import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/webhook", async (req, res) => {
  console.log("✅ Webhook受信:", JSON.stringify(req.body, null, 2));

  const userMessage = req.body.content?.text || "こんにちは";
  const userId = req.body.source?.userId;
  const domainId = req.body.source?.domainId;

  try {
    // ChatGPTに問い合わせ
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

    // LINE WORKSに返信（Reply API）
    await fetch("https://www.worksapis.com/v1.0/bots/@self/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LINE_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        botNo: process.env.LINE_BOT_NO, // 例: 12345678
        accountId: userId,
        content: {
          type: "text",
          text: reply
        }
      })
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ エラー:", err);
    res.status(500).send("サーバーエラー");
  }
});

app.get("/", (req, res) => {
  res.send("GPT Webhook is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
