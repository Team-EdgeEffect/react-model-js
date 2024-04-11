"use client";

import { Model } from "@edge-effect/model-js";
import { useModelContext } from "../context/ModelContextProvider";

export const useGetModel = <T extends Model>(target: new () => T) => {
    const { getModel } = useModelContext();
    return getModel(target);
};
