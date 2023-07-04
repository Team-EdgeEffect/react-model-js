import { axios, AxiosCoreDefaults, AxiosInstance, defaultAxios, Model } from "@edge-effect/model-js";
import { AxiosResponse, HttpStatusCode } from "axios";
import React, { useCallback, useMemo, useRef } from "react";
import { Authorization } from "src/auth/Authorization";
import { ModelEventListener } from "src/listener/BaseListener";
import { sleep } from "src/utils/Utils";

// custom axios
export const ignoreEventFlowAxios = axios.create(); // ignore intercept case axios

// members
const MAX_TOKEN_REFRESH_QUEUE_TIMEOUT = 5000;
let nowTokenRefresh = false;

// config
type OnRequestRequireLogin = () => Promise<boolean> | boolean; // true bubble
type OnRequestPermissionDenied = () => Promise<boolean> | boolean; // true bubble
// @TODO 해당 함수 안에서 401이 발생하면 max call limit 버그 발생함
type OnTokenRefresh = () => Promise<Authorization | null> | Authorization | null;

class ModelContextProviderConfig {
    private authorization: Authorization | null;
    public requestRequireLogin: ModelEventListener<OnRequestRequireLogin> = new ModelEventListener();
    public requestPermissionDenied: ModelEventListener<OnRequestPermissionDenied> = new ModelEventListener();
    public tokenRefresh: ModelEventListener<OnTokenRefresh> = new ModelEventListener();

    constructor() {
        this.setAuthorization(null);
    }

    public setAuthorization(authorization: Authorization | null) {
        this.authorization = authorization;
        if (authorization) {
            const authorizationString = `${authorization.code} ${authorization.token}`;
            defaultAxios.defaults.headers.common["Authorization"] = authorizationString;
            ignoreEventFlowAxios.defaults.headers.common["Authorization"] = authorizationString;
        } else {
            defaultAxios.defaults.headers.common["Authorization"] = null;
            ignoreEventFlowAxios.defaults.headers.common["Authorization"] = null;
        }
    }

    public getAuthorization() {
        return this.authorization;
    }
}
// end of config

// interface
type InstallModelType = (model: Model) => void;
export interface ModelContextProviderActions {
    initialize: (onInitializer: ModelContextProviderInitializer) => void;
    installModel: InstallModelType;
    getModel: <T extends Model>(target: new () => T) => T;
    config: ModelContextProviderConfig;
}
export interface ModelContextProviderProps {
    children: React.ReactNode | undefined;
}
// end of interface

// context
const ModelContext = React.createContext<ModelContextProviderActions>({} as ModelContextProviderActions);
export const ModelContextProvider = (props: ModelContextProviderProps): JSX.Element => {
    const config = useRef<ModelContextProviderConfig>(new ModelContextProviderConfig());

    const models = useRef<Array<Model>>(new Array<Model>());

    const isinitialized = useRef<boolean>(false);

    const installModel = useCallback((model: Model) => {
        // @TODO duplicate model
        models.current.push(model);
    }, []);

    // const setAuthorization = useCallback((authorization: Authorization | null) => {
    //     if (authorization) {
    //         config.current.setAuthorization(authorization);
    //         const authorizationString = `${authorization.code} ${authorization.token}`;
    //         defaultAxios.defaults.headers.common["Authorization"] = authorizationString;
    //         ignoreEventFlowAxios.defaults.headers.common["Authorization"] = authorizationString;
    //     } else {
    //         config.current.setAuthorization(null);
    //         defaultAxios.defaults.headers.common["Authorization"] = null;
    //         ignoreEventFlowAxios.defaults.headers.common["Authorization"] = null;
    //     }
    // }, []);

    const getModel = useCallback(<T extends Model>(target: new () => T): T => {
        const found = models.current.find((model) => {
            return model.constructor === target;
        });

        if (!found) {
            throw "cannot found model. install first please";
        }

        return found as T;
    }, []);

    const actions = useMemo(() => {
        const createdActions = {
            installModel,
            getModel,
            config: config.current,
            initialize: (onInitializer: ModelContextProviderInitializer) => {
                if (isinitialized.current) return;

                defaultAxios.interceptors.response.use(
                    (res) => res,
                    async (error) => {
                        if (axios.isAxiosError(error) && error.config) {
                            const responseStatusCode = error.response?.status;
                            if (responseStatusCode === HttpStatusCode.Unauthorized) {
                                let newResponse: AxiosResponse | null = null;
                                if (!nowTokenRefresh) {
                                    nowTokenRefresh = true;
                                    let newAuthorization: Authorization | null = null;
                                    await config.current.tokenRefresh.iterate(async (l) => {
                                        newAuthorization = await l();
                                        return newAuthorization ? true : false;
                                    });

                                    config.current.setAuthorization(newAuthorization);

                                    if (newAuthorization) {
                                        // retry
                                        error.config.headers = { ...error.config.headers };
                                        error.config.headers.Authorization = (newAuthorization as Authorization).toString();
                                        try {
                                            newResponse = await ignoreEventFlowAxios.request(error.config);
                                        } catch (newError) {
                                            if (axios.isAxiosError(newError) && newError.config) {
                                                const responseStatusCode = error.response?.status;
                                                if (responseStatusCode === HttpStatusCode.Unauthorized) {
                                                    await config.current.requestRequireLogin.iterate((l) => {
                                                        return l();
                                                    });
                                                }
                                            }
                                            throw newError;
                                        }
                                    } else {
                                        await config.current.requestRequireLogin.iterate((l) => {
                                            return l();
                                        });
                                    }
                                } else {
                                    const startTime = new Date().getTime();
                                    while (nowTokenRefresh) {
                                        if (new Date().getTime() - startTime > MAX_TOKEN_REFRESH_QUEUE_TIMEOUT) {
                                            break;
                                        }
                                        await sleep(10);
                                    }

                                    const newAuthorization = config.current.getAuthorization();
                                    if (newAuthorization) {
                                        // retry
                                        error.config.headers = { ...error.config.headers };
                                        error.config.headers.Authorization = newAuthorization.toString();
                                        try {
                                            newResponse = await ignoreEventFlowAxios.request(error.config);
                                        } catch (newError) {
                                            // nothing?
                                        }
                                    }
                                }

                                nowTokenRefresh = false;
                                if (newResponse) {
                                    return newResponse;
                                }
                            } else if (responseStatusCode === HttpStatusCode.Forbidden) {
                                await config.current.requestPermissionDenied.iterate((l) => {
                                    return l();
                                });
                            }
                        } else {
                            // unexpected error
                        }

                        return Promise.reject(error);
                    }
                );

                onInitializer.onModelInitialize().forEach((model) => {
                    installModel(model);
                });

                onInitializer.onConfigInitialize && onInitializer.onConfigInitialize(config.current, actions);
                config.current.setAuthorization(config.current.getAuthorization());
                if (onInitializer.onAxiosConfigInitialize) {
                    defaultAxios.defaults = {
                        ...defaultAxios.defaults,
                        ...onInitializer.onAxiosConfigInitialize(defaultAxios),
                    };
                    ignoreEventFlowAxios.defaults = defaultAxios.defaults;
                }

                isinitialized.current = true;
            },
        };
        return createdActions;
    }, [installModel, getModel, config]);

    return <ModelContext.Provider value={actions}>{props.children}</ModelContext.Provider>;
};

// hooks
// installModel: InstallModelType
interface ModelContextProviderInitializer {
    onModelInitialize: () => Array<Model>;
    onConfigInitialize?: (config: ModelContextProviderConfig, actions: ModelContextProviderActions) => void;
    onAxiosConfigInitialize?: (core: AxiosInstance) => AxiosCoreDefaults | void;
}
export const useModelContext = (onInitializer?: ModelContextProviderInitializer) => {
    const c = React.useContext(ModelContext);

    onInitializer && c.initialize(onInitializer);

    return c;
};
