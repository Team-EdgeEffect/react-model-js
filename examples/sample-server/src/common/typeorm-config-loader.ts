import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
    const config: TypeOrmModuleOptions = {
        type: "sqlite",
        database: configService.get("DB_NAME"),
        logging: true,
        entities: ["dist/src/entity/*.ts"],
        migrations: ["dist/src/migration/*.ts"],
    };
    console.log("getTypeOrmConfig", config);
    return config;
};

export const getDataSourceOptions = (configService: ConfigService): DataSourceOptions => {
    const config: DataSourceOptions = {
        type: "sqlite",
        database: configService.get("DB_NAME"),
        logging: true,
        entities: ["dist/src/entity/*.ts"],
        migrations: ["dist/src/migration/*.ts"],
    };
    console.log("getDataSourceOptions", config);
    return config;
};
