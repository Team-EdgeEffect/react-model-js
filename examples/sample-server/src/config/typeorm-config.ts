import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { getDataSourceOptions } from "./../common/typeorm-config-loader";
import { DataSource, DataSourceOptions } from "typeorm";

config();
const configService = new ConfigService();

const dataSourceOptions: DataSourceOptions = getDataSourceOptions(configService);
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
