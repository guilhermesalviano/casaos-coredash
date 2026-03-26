import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";

import { Todo } from "@/entities/Todo";
import { TodoRecurrence } from "@/entities/TodoRecurrence";
import { User } from "@/entities/User";
import { Weather } from "@/entities/Weather";
import { WeatherHour } from "@/entities/WeatherHour";
import { TodoCheck } from "@/entities/TodoCheck";
import { FlightCrawled } from "@/entities/FlightCrawled";
import { WishlistAmazon } from "@/entities/WishlistAmazon";
import { HabitTracker } from "@/entities/HabitTracker";
import { CONFIG } from "@/config/config";

let initializationPromise: Promise<DataSource> | null = null;

const devType: DataSourceOptions = {
  type: "sqlite",
  database: "database.db",
  synchronize: true,
  logging: true,
};

const prodType: DataSourceOptions = {
  type: "mariadb",
  host: CONFIG.db.host,
  port: CONFIG.db.port,
  database: CONFIG.db.name,
  username: CONFIG.db.username,
  password: CONFIG.db.password,
  synchronize: false,
  logging: false,
}

const devOrProdDataSource = {
  ...(CONFIG.env === "development" ? devType : prodType),
  entities: [Todo, TodoRecurrence, WishlistAmazon, TodoCheck, FlightCrawled, User, HabitTracker, Weather, WeatherHour],
  subscribers: [],
  migrations: [],
};

export const AppDataSource = new DataSource(devOrProdDataSource);

export const getDatabaseConnection = async () => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = AppDataSource.initialize()
    .then((ds) => {
      console.log("Data Source has been initialized!");
      return ds;
    })
    .catch((err) => {
      initializationPromise = null;
      console.error("Error during Data Source initialization", err);
      throw err;
    });

  return initializationPromise;
};