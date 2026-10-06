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

mongoose
  .connect(config.mongoUrl)
  .then(() => {
    console.log(`[db] connected host=${mongoHost(config.mongoUrl)}`)
    startBackupScheduler()
  })
  .catch((error) => {
    console.error(`[db] connection failed: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
  })

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
// /api-docs/ for a endpoint
setupSwagger(app)

// Start the server
app.listen(config.port, (): void => {
  console.log(`Server running on port ${config.port}`)
})
