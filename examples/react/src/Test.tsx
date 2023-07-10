import { SuccessResponse } from "@edge-effect/model-js";

// export const isResponseSuccess = (object: any): object is SuccessResponse => {
export const isResponseSuccess = (object: any): object is SuccessResponse => {
    if (object instanceof SuccessResponse) {
        return true;
    } else {
        return false;
    }
};
