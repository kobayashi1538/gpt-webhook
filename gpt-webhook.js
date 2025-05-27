// gpt-webhook.js
// LINE WORKSからのリクエストを受け取り、OpenAI GPT-4oに渡して応答を返す最小構成テンプレ

import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post("/webhook", async (req, res) => {
  const userMessage = req.body.content || req.body.text || "こんにちは";

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const result = await openaiRes.json();
    const reply = result.choices?.[0]?.message?.content || "すみません、うまく応答できませんでした。";

    // LINE WORKSのWebhook形式で応答（テキスト）
    res.json({ content: reply });
  } catch (err) {
    console.error("GPTエラー:", err);
    res.status(500).json({ content: "エラーが発生しました。" });
  }
});

app.get("/", (req, res) => {
  res.send("GPT Webhook is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
