import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: "New Chat"
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    messages: [MessageSchema],
}, { timestamps: true });

ThreadSchema.index({
    userId: 1, 
    threadId: 1},
    {
        unique: true
    }
);

export default mongoose.model("Thread", ThreadSchema);