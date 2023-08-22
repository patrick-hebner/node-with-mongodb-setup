import express from "express";
import morgan from "morgan";
import db from "./conn";

const app = express();
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ message: "OK" });
});

app.get("/dbtest", async (req, res) => {
  let dbNames: string[] = [];
  if (db) {
    const { databases } = await db.admin().listDatabases();
    dbNames = databases.map((d: { name: string }) => d.name);
  }
  res.json({ databases: dbNames });
});

export default app;
