import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
`,
    },
    ...(conversation || []),
  ];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const prompt = buildPrompt(messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: prompt,
      temperature: 0.7,
      max_tokens: 1200,
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Server error", details: err?.message ?? "Unknown error" });
  }
}

