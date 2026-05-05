import "dotenv/config";

export const getOpenAIAPIResponse = async(message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [{
                role: "user",
                content: message
            }]
        })
    };
    try{
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", options);
        
        if (!response.ok) {
            const error = await response.json();
            console.error("[OpenAI] API error:", error);
            return `Error from API: ${error?.error?.message ?? "Unknown error"}`;
        }
        
        const data = await response.json();
        
        if (!data?.choices?.[0]?.message?.content) {
            console.error("[OpenAI] Unexpected response structure:", data);
            return "I couldn't generate a response. Please try again.";
        }
        
        return data.choices[0].message.content;
    }catch(err){
        console.error("[OpenAI] Request failed:", err?.message ?? err);
        return `Error: ${err?.message ?? "Unknown error"}`;
    }
};