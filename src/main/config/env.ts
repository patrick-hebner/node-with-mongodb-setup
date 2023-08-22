import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? "0.0.0.0";
const database = process.env.DATABASE ?? "test";
const mongo_admin = process.env.MONGO_ROOT_USERNAME;
const mongo_password = process.env.MONGO_ROOT_PASSWORD;
const mongo_port = process.env.MONGO_PORT;
const mongo_url =
  process.env.MONGO_URL ??
  `mongodb://${mongo_admin}:${mongo_password}@localhost:${mongo_port}/?authMechanism=DEFAULT`;

console.log(">>> ENV", { port, host, database, mongo_url });

export { port, host, database, mongo_url };
