import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import helmet from "helmet";
import morgan from "morgan";

import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/api/v1", routes);
app.use(errorMiddleware);
