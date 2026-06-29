require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/Db");

// Routes Imports
const authRoutes = require("./routes/authroutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const teamRoutes = require("./routes/teamroutes");
const channelRoutes = require("./routes/channelroutes");
const messageRoutes = require("./routes/messageroutes");

const { GlobalResponseHandler } = require("./utils/GlobalResponseHandler");
const GlobalErrorHandler = require("./utils/GlobalErrorHandler");
const loggerMiddleware = require("./middlewares/loggermiddleware");
const eventLoggerMiddleware = require("./middlewares/eventloggermiddleware");
const { startEventWatcher } = require("./watchers/eventWatcher");
const sendErrorToWebhook = require("./utils/WebhookService");

const app = express();

// Database Connection is handled in the async initialization block below.


// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use(eventLoggerMiddleware);

// ✅ Attaches res.success() and res.failed() to every request
app.use(GlobalResponseHandler);

// Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

app.use(GlobalErrorHandler);

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  sendErrorToWebhook(err); // report to webhook
  process.exit(1); // exit — let process manager restart
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[unhandledRejection] at:", promise, "reason:", reason);
  const err = reason instanceof Error ? reason : new Error(String(reason));
  sendErrorToWebhook(err); // report to webhook, no req context available
});

const PORT = process.env.PORT || 5000;
const logger = require("./utils/Logger");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

io.on("connection", (socket) => {
  const userId =
    socket.handshake.auth?.userId ||
    socket.handshake.query?.userId ||
    socket.request.headers["x-user-id"];

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  const userRoom = userId.toString();
  socket.join(userRoom);
  logger.info(`Socket connected for user ${userRoom} (room joined)`);

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected for user ${userRoom}`);
  });
});

(async () => {
  await connectDB();
  startEventWatcher(io);

  server.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });
})();
