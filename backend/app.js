import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";

import "dotenv/config";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import accountRoutes from "./app/routes/accounts.js";
import usersRoutes from "./app/routes/users.js";
import chatRoutes from "./app/routes/chat.js";
import pushRoutes from "./app/routes/push.js";
import socketHandler from "./app/services/socket-handler.js";
import { initWebPush } from "./app//services/push-service.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app); // create HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
}); // create Socket.IO server
socketHandler(io);
const PORT = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use((req, res, next) => {
  console.log(`🚩Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error("error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// initWebPush(); // 서버가 시작하면 한 번만 설정(푸시를 보낼 때 쓸 서버 정보)

app.use("/api/accounts", accountRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/push", pushRoutes);

server.listen(PORT, host, () => {
  console.log(`🚩Server running on ${host}:${PORT}`);
});

export default app;
