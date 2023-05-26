import "module-alias/register";
import app from "@main/app";
import { host, port } from "./config/env";

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
});
