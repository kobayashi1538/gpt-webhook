// ✅ Render / Replit 両対応 GPT Webhook（Node.js / Express）
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/webhook", async (req, res) => {
  const userMessage = req.body.text || req.body.content || "こんにちは";

  try {
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "あなたは業務用包装資材の提案アシスタントです。" },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await gptRes.json();
    const reply = data.choices?.[0]?.message?.content || "すみません、応答できませんでした。";
    res.json({ content: reply });
  } catch (err) {
    console.error("GPTエラー:", err);
    res.status(500).json({ content: "サーバーエラーです。" });
  }
});

app.get("/", (req, res) => {
  res.send("GPT Webhook is running!");
});

// ✅ PORTをRenderの仕様に対応させる（必須）
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
