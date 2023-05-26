import express from "express";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));

app.get("/health", (req, res, next) => {
  res.json({ message: "OK!" });
});

export default app;
