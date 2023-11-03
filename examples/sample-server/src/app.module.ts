import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./module/users/users.module";
import { FoodsModule } from "./module/foods/foods.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTypeOrmConfig } from "./common/typeorm-config-loader";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return getTypeOrmConfig(configService);
            },
        }),
        UsersModule,
        FoodsModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
