import { Model } from "@edge-effect/model-js";
import { RefreshToken } from "../dto/AuthDto";
import { ignoreEventFlowAxios } from "@edge-effect/react-model-js";

class AuthModel extends Model {
    protected getDomain(): string {
        return `{your-request-domain}`;
    }

    public refreshToken(refreshToken: string) {
        return this.get<RefreshToken>(
            {
                path: "{your-refresh-token-endpoint}",
                headers: {
                    Authorization: refreshToken,
                },
            },
            {
                // By assigning overrideAxios to ignoreEventFlowAxios, you can successfully refresh the token while ignoring the lifecycle provided by the model context provider.
                // This option is mandatory in this example
                overrideAxios: ignoreEventFlowAxios,
            }
        );
    }
}
export default AuthModel;
