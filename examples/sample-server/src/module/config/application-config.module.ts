import { Global, Module } from "@nestjs/common";
import { ApplicationConfigService } from "./application-config.service";

@Module({
    providers: [ApplicationConfigService],
    exports: [ApplicationConfigService],
})
@Global()
export class ApplicationConfigModule {}
