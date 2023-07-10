import { RefreshToken } from "../dto/AuthDto";

export const getSavedAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
};

export const getSavedRefreshToken = (): string | null => {
    return localStorage.getItem("refreshToken");
};

export const setTokens = (value: RefreshToken) => {
    localStorage.setItem("accessToken", value.accessToken);
    localStorage.setItem("refreshToken", value.refreshToken);
};

export const resetTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};
