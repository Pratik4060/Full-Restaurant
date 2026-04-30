import { app } from "./app.js";
import { env } from "./config/env.js";

const port = Number(process.env.PORT ?? env.port);

app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
