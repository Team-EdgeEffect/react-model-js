import React from "react";
import { SampleComponent1 } from "./component/SampleComponent1";
import { SampleComponent2 } from "./component/SampleComponent2";
import { useModelContext, Authorization } from "@edge-effect/react-model-js";
import PostModel from "./model/PostModel";
import { useNavigate } from "react-router-dom";
import { BaseResponse, InterceptResponse, isResponseSuccess } from "@edge-effect/model-js";
import { getSavedAccessToken, getSavedRefreshToken, resetTokens, setTokens } from "./utils/TokenUtils";
import AuthModel from "./model/AuthModel";

function DetailApp() {
    const navigate = useNavigate();

    // initialize model context
    useModelContext({
        // Models to be used must be initialized before use, and can be initialized at any time during runtime.
        onModelInitialize: () => {
            return [new PostModel(), new AuthModel()];
        },

        // You can define request-related configuration through models.
        onConfigInitialize: (config, actions) => {
            // @TODO actions config 랑 중복?

            const savedAccessToken = getSavedAccessToken();
            if (savedAccessToken) {
                // If authorization is set, the authorization value is assigned to the request through the model.
                config.setAuthorization(new Authorization("Bearer", savedAccessToken));
            }

            // If the request through the model causes a 401 error, the event is caught here before the business logic.
            config.tokenRefresh.add(async () => {
                let refreshedAuthorization: Authorization | null = null;

                const savedRefreshToken = getSavedRefreshToken();

                // If desired, you can write code that additionally utilizes the expiration time, etc. to the stored token information.
                const authModel = actions.getModel(AuthModel); // This line should never throw a 401 error.
                const response = await authModel.refreshToken(`Bearer ${savedRefreshToken}`);
                if (isResponseSuccess(response)) {
                    const data = response.content;

                    // Store the token separately.
                    setTokens(data);

                    refreshedAuthorization = new Authorization("Bearer", data.accessToken);
                } else {
                    // It can be handled with isResponseError , but in this example, all unsuccessful cases are considered as else cases.
                    resetTokens();
                }

                // If null is returned, the token will fail to be updated, and it will bubble up to the 401 event handler.
                return refreshedAuthorization;
            });

            // If the tokenRefresh listener fails to successfully update the access token value, this event is caught.
            config.requestRequireLogin.add(() => {
                if (window.confirm("This service requires login.")) {
                    const redirectTo = window.location.pathname + window.location.search + window.location.hash;
                    navigate(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
                } else {
                    navigate("/");
                }

                // Returning true causes the event to bubble to other registered event handlers, and returning false cancels event bubbling.
                return true;
            });
        },

        // You can access/control native axios configuration values.
        onAxiosConfigInitialize: (core) => {
            // The example below is an example of moving to the server inspection page through the intercept function of axios.
            core.interceptors.response.use(
                (res) => res,
                (error) => {
                    try {
                        let withIntercept = false;
                        withIntercept = false;
                        const httpStatus = error.response.status;
                        // @TODO update pkg
                        // switch (httpStatus) {
                        //     case HttpStatusCode.NOT_IMPLEMENTED:
                        //         withIntercept = true;
                        //         navigate("/maintenance-system");
                        //         break;
                        // }
                        if (withIntercept) {
                            return new InterceptResponse(new BaseResponse(error?.response, error?.response?.data));
                        } else {
                            // If you don't reject it, it won't bubble up to other event listeners.
                            return Promise.reject(error);
                        }
                    } catch (e) {
                        // If you don't reject it, it won't bubble up to other event listeners.
                        return Promise.reject(error);
                    }
                }
            );
        },
    });

    return (
        <div className="App">
            <h1>react-model-js-example-react</h1>
            <SampleComponent1 />
            <SampleComponent2 />
        </div>
    );
}

export default DetailApp;
