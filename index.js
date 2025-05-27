app.post("/webhook", async (req, res) => {
  const event = req.body;
  console.log("✅ Webhook受信:", JSON.stringify(event, null, 2));

  const userMessage = event.content?.text || "こんにちは";

  try {
    // GPT呼び出し
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

    // ✅ LINE WORKSへ返信
    await fetch(`https://www.worksapis.com/v1.0/bots/${process.env.LINE_BOT_NO}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LINE_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        botNo: process.env.LINE_BOT_NO,
        accountId: event.source?.userId,
        content: {
          type: "text",
          text: reply
        }
      })
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ エラー:", err);
    res.status(500).send("Error");
  }
});
