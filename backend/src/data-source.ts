import "reflect-metadata";
import { DataSource } from "typeorm";
import { Property } from "./entities/Property";
import { TenantProfile } from "./entities/TenantProfile";
import { Amenity } from "./entities/Amenity";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [Property, TenantProfile, Amenity],
    migrations: [],
    subscribers: [],
});