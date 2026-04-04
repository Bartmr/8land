import 'dotenv/config'

import { DataSource } from "typeorm";
import { TYPEORM_ORMCONFIG } from "./ormconfig";

export const AppDataSource = new DataSource(TYPEORM_ORMCONFIG)