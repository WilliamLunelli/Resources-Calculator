import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import userRouter from "./routes/user_router";
import calcRouter from "./routes/calc_router";

dotenv.config();
const PORT = process.env.PORT;

export const server = express();
server.use(helmet());
server.use(express.json());

server.use(userRouter);
server.use(calcRouter);

server.get("/", (req, res) => {
  res.send("Server rodando. . .");
});

server.get("/ping", (req, res) => {
  res.json({ pong: "True" });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando no link http://localhost:${PORT}/`);
});
