import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import JSON5 from "json5";
import chatRouter from "./routes/chat.js";

const app = express();
const PORT = 8080;

// Use text parser first to capture raw body for JSON5 parsing
app.use(express.text({ type: "*/*" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Custom middleware to parse lenient JSON
app.use((req, res, next) => {
    if (typeof req.body === "string" && req.body.trim()) {
        try {
            req.body = JSON.parse(req.body);
        } catch (e) {
            try {
                req.body = JSON5.parse(req.body);
            } catch (e2) {
                // keep as string
            }
        }
    }
    next();
});

// Mount routes
app.use("/api", chatRouter);

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
    connectDB();
});

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.warn("MONGODB_URI is not set. Skipping database connection.");
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected with Database");
    } catch (err) {
        if (err?.name === "MongooseServerSelectionError") {
            console.error(
                "Failed to connect to MongoDB Atlas. Check that your current IP is whitelisted and the MONGODB_URI is correct."
            );
            return;
        }

        console.error("Failed to connect to MongoDB:", err?.message ?? err);
    }
};

