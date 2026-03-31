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

    const data = await response.json();

    // 🔥 YENİ DOĞRU YER
    const content = data.output?.[0]?.content?.[0]?.text;

    if (!content) {
      return res.status(500).json({ error: "AI response boş geldi" });
    }

    const parsed = JSON.parse(content);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
