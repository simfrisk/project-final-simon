import { config, reportConfig, scrubSecrets } from "./config"
reportConfig()

import express, { Application } from "express"
import cors from "cors"
import mongoose from "mongoose"
import { setupSwagger } from "./swagger/swagger"

import { resetDatabase } from "./setup/resetDatabase"
import router from "./Routes/routes"
import { createOpsRouter } from "./controllers/postOps"
import { startBackupScheduler } from "./ops/backupScheduler"

const mongoHost = (url: string): string => {
  try {
    // Credentials are dropped on purpose, only the host is ever logged.
    return new URL(url).host
  } catch {
    return "unparseable"
  }
}

// The first connection is retried with backoff. If the database is still not reachable once
// DB_CONNECT_MAX_SECONDS has passed, the process exits non-zero so the platform restarts it.
// While it is down, /health answers 503. After a successful first connect, Mongoose reconnects by itself.
const DB_ATTEMPT_TIMEOUT_MS = 5000
const DB_MAX_BACKOFF_MS = 10000
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const connectWithRetry = async (): Promise<void> => {
  const startedAt = Date.now()
  let delay = 1000
  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect(config.mongoUrl, { serverSelectionTimeoutMS: DB_ATTEMPT_TIMEOUT_MS })
      console.log(`[db] connected host=${mongoHost(config.mongoUrl)}`)
      startBackupScheduler()
      return
    } catch (error) {
      const message = scrubSecrets(error instanceof Error ? error.message : String(error))
      const elapsed = Date.now() - startedAt
      if (elapsed + delay >= config.dbConnectMaxMs) {
        console.error(`[db] giving up after ${attempt} attempts in ${Math.round(elapsed / 1000)}s: ${message}`)
        process.exit(1)
      }
      console.error(`[db] attempt ${attempt} failed, retrying in ${delay / 1000}s: ${message}`)
      await sleep(delay)
      delay = Math.min(delay * 2, DB_MAX_BACKOFF_MS)
    }
  }
}
connectWithRetry()

const app: Application = express()

app.use(express.static("public"))

// First, parse incoming request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Then, configure CORS from FRONTEND_URL
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true) // allow curl/postman with no origin
    if (config.frontendOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, false) // silently fail without throwing error
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}
app.use(cors(corsOptions))

// Handle OPTIONS preflight requests with the same origin rules
app.options("*", cors(corsOptions))

resetDatabase()

// Ops routes exist only during an ops window. Otherwise every /ops path answers 404, which has to be
// explicit here because the Swagger UI mounted below answers 200 for any path nothing else handled.
if (config.ops.enabled) {
  app.use("/ops", createOpsRouter())
  console.log("[ops] ops routes are ENABLED")
} else {
  app.use("/ops", (_req, res) => {
    res.status(404).json({ success: false, response: null, message: "Not found" })
  })
}

app.use("/", router)

//This is a documentation helper
setupSwagger(app)

// Start the server
app.listen(config.port, (): void => {
  console.log(`Server running on port ${config.port}`)
})
