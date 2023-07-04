import { ErrorResponse, HttpStatusCode } from "@edge-effect/model-js";

export const isResponseUserError = (object: any): object is ErrorResponse => {
    if (object instanceof ErrorResponse) {
        return !(object.native?.status === HttpStatusCode.Unauthorized);
    } else {
        return false;
    }
};
