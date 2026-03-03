// server.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set your key in env variables
});

/**
 * Build structured prompt for beginner-friendly responses
 */
function buildPrompt(conversation) {
  return [
    {
      role: "system",
      content: `
You are "Personal Tutor", a friendly AI tutor for beginners. 
You explain concepts in **English and Urdu** (if asked). 
Your answers must always be:

- Easy to understand for a layman
- Structured with headings, line breaks, bullet points
- Write formulas in **plain text**, not LaTeX. For example, write: "torque = r × F × sin(theta)" instead of using backslashes or [ ... ] LaTeX blocks.
- Avoid LaTeX syntax like \\tau, \\theta, \\text{ }, \\frac{ }, or any [ ... ] blocks.
- Include examples with calculations
- Explain symbols used in formulas
- Use Markdown formatting for headings, lists, line breaks, and code blocks (but no LaTeX)
- Cover topics in: Math, Physics, English, and Urdu
`
    },
    ...conversation
  ];
}

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const prompt = buildPrompt(messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4
      messages: prompt,
      temperature: 0.7,
      max_tokens: 1200,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Streaming version: sends the reply chunk by chunk instead of in one JSON blob
app.post("/chat-stream", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const prompt = buildPrompt(messages);

    // Prepare headers for streaming text
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: prompt,
      temperature: 0.7,
      max_tokens: 1200,
      stream: true,
    });

    let fullText = "";

    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content || "";
      if (delta) {
        fullText += delta;
        res.write(delta);
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    // If headers not sent yet, send standard JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    } else {
      // If already streaming, end the stream
      res.end();
    }
  }
});

// Export for Vercel serverless
export default app;

// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}