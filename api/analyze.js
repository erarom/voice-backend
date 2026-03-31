export default async function handler(req, res) {
  try {
    // 🔒 sadece POST kabul et
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // 🔥 OPENAI CALL
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
Aşağıdaki metni analiz et:

1. Duygu (mutlu, üzgün, stresli, nötr)
2. Kısa özet (1 cümle)
3. Başlık (max 5 kelime)

Metin:
${text}

SADECE JSON dön:
{
  "sentiment": "",
  "summary": "",
  "title": ""
}
`
      })
    });

    const data = await response.json();

    // 🔥 DEBUG (çok önemli)
    console.log("🔥 FULL OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    // 🔥 SAFE PARSE (KRİTİK)
    let content = null;

    if (data.output && data.output.length > 0) {
      const first = data.output[0];
      if (first.content && first.content.length > 0) {
        content = first.content[0].text;
      }
    }

    // fallback
    if (!content && data.output_text) {
      content = data.output_text;
    }

    if (!content) {
      return res.status(500).json({
        error: "AI response boş geldi",
        raw: data
      });
    }

    // 🔥 JSON PARSE
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("❌ JSON PARSE ERROR:", content);
      return res.status(500).json({
        error: "JSON parse edilemedi",
        raw: content
      });
    }

    // 🔥 SUCCESS
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
