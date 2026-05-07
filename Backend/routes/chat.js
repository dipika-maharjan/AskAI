import express from "express";
import Thread from "../models/Thread.js";
import { getOpenAIAPIResponse } from "../utils/openai.js";

const router = express.Router();

//Get all threads
router.get("/thread", async(req, res) => {
    try{
        const threads = await Thread.find({}).sort({updatedAt: -1})  
        //descending order of updatedAt....most recent data on top
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to fetch threads"});
    }
});

router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;
    try{
        const thread = await Thread.findOne({threadId});

        if(!thread){
            return res.status(404).json({error: "Thread not found"});
        }
        res.json(thread.messages);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to fetch chat"})
    }
});

router.delete("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;
    try{
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread){
            return res.status(404).json({error: "Thread not found"});
        }
        return res.status(200).json({success: "Thread deleted successfully"})

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to delete thread"})
    }
});

router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || !message){
        return res.status(400).json({error: "missing required field"});
    }

    try{
        const assistantReply = await getOpenAIAPIResponse(message);

        const thread = await Thread.findOneAndUpdate(
            { threadId },
            {
                $setOnInsert: {
                    threadId,
                    title: message,
                    createdAt: new Date(),
                },
                $set: {
                    updatedAt: new Date(),
                },
                $push: {
                    messages: {
                        $each: [
                            { role: "user", content: message },
                            { role: "assistant", content: assistantReply },
                        ],
                    },
                },
            },
            { upsert: true, new: true }
        );

        res.json({reply: assistantReply});
    }catch(err){
        if (err?.code === 11000) {
            return res.status(409).json({
                error: "Thread already exists. Try sending a new message to the same threadId or use a new threadId.",
            });
        }

        console.log(err);
        res.status(500).json({error: "something went wrong"});
    }
});

export default router;