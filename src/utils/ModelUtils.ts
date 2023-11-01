import { ErrorResponse } from "@edge-effect/model-js";
import { HttpStatusCode } from "axios";

export const isResponseUserError = (object: any): object is ErrorResponse => {
    if (object instanceof ErrorResponse) {
        return !(object.native?.status === HttpStatusCode.Unauthorized);
    } else {
        return false;
    }
};
