import dotenv from "dotenv"
dotenv.config()

import express, { Application } from "express"
import cors from "cors"
import mongoose from "mongoose"
import { setupSwagger } from "./swagger/swagger"

import { resetDatabase } from "./setup/resetDatabase"
import router from "./Routes/routes"

const mongoUrl: string =
  process.env.MONGO_URL || "mongodb://localhost/final-project"
mongoose.connect(mongoUrl)

const port: number = parseInt(process.env.PORT || "8080")
const app: Application = express()

app.use(express.static("public"))

const allowedOrigins = [
  "http://localhost:5173", // your local dev
  "https://class-review.netlify.app", // your deployed frontend
]

// First, parse incoming request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Then, configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true) // allow curl/postman with no origin
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(null, false) // silently fail without throwing error
        // or you can do callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Handle OPTIONS preflight requests
app.options("*", cors())

resetDatabase()

app.use("/", router)

//This is a documentation helper
// /api-docs/ for a endpoint
setupSwagger(app)

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`)
})
