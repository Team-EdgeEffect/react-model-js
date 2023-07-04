import { axios, Model, isResponseError, isResponseSuccess, METHOD_POST } from "@edge-effect/model-js";

const simpleAxios = axios.create(); // for this model

export const UPLOAD_ERROR_TYPE_NONE = "None";
export const UPLOAD_ERROR_TYPE_UNEXPECTED = "Unexpected";
export const UPLOAD_ERROR_TYPE_ACCESS_DENIED = "AccessDenied";
export const UPLOAD_ERROR_TYPE_ENTITY_TOO_LARGE = "EntityTooLarge";

export declare const UploadErrorTypes: ReadonlyArray<
    typeof UPLOAD_ERROR_TYPE_NONE | typeof UPLOAD_ERROR_TYPE_UNEXPECTED | typeof UPLOAD_ERROR_TYPE_ACCESS_DENIED | typeof UPLOAD_ERROR_TYPE_ENTITY_TOO_LARGE
>;
export type UploadErrorType = (typeof UploadErrorTypes)[number];

export interface AwsS3UploadResult {
    isSuccess: boolean;
    errorType: UploadErrorType;
}
export class AwsS3Model extends Model {
    protected getDomain(): string {
        return "";
    }

    public async upload(url: string, body: Record<string, string>, file: File): Promise<AwsS3UploadResult> {
        const response = await this.custom(
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                method: METHOD_POST,
                url,
                datas: {
                    ...body,
                    file,
                },
            },
            {
                overrideAxios: simpleAxios,
            }
        );

        let isSuccess: boolean = false;
        let errorType: UploadErrorType = UPLOAD_ERROR_TYPE_NONE;

        if (isResponseSuccess(response)) {
            isSuccess = true;
        } else if (isResponseError(response)) {
            const parser = new DOMParser();
            const dom = parser.parseFromString(response.native?.data, "text/xml");
            const errorCode = (dom.querySelector("Error>Code") || {}).textContent;
            // let error_message = (dom.querySelector("Error>Message") || {}).textContent;
            if (errorCode) {
                if (errorCode === "AccessDenied") {
                    errorType = UPLOAD_ERROR_TYPE_ACCESS_DENIED;
                } else if (errorCode === "EntityTooLarge") {
                    errorType = UPLOAD_ERROR_TYPE_ENTITY_TOO_LARGE;
                } else {
                    errorType = UPLOAD_ERROR_TYPE_UNEXPECTED;
                }
            }
        }
        return {
            isSuccess,
            errorType,
        };
    }
}
