import { ConfigService } from "@nestjs/config";

export class ApplicationConfigService {
    constructor(private configService: ConfigService) {}

    // for wrapper, not implemented

    private get<T = any>(key: string): T {
        return this.configService.get<T>(key);
    }
}
