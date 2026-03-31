export default async function handler(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

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

JSON formatında cevap ver:
{
  "sentiment": "",
  "summary": "",
  "title": ""
}
`
      })
    });

    // 🔥 BURASI KRİTİK
    if (!response.ok) {
      const errText = await response.text();
      console.log("❌ OPENAI ERROR:", errText);
      return res.status(500).json({ error: "OpenAI request failed" });
    }

    const data = await response.json();

    console.log("🔥 FULL OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    // 🔥 GÜVENLİ PARSE
    let content = null;

    if (data.output && data.output.length > 0) {
      const first = data.output[0];

      if (first.content && first.content.length > 0) {
        content = first.content[0].text;
      }
    }

    if (!content && data.output_text) {
      content = data.output_text;
    }

    if (!content) {
      return res.status(500).json({ error: "AI response boş geldi" });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.log("❌ JSON PARSE FAIL:", content);
      return res.status(500).json({ error: "JSON parse edilemedi" });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
