export default async function handler(req, res) {
    
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "No text" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `
Aşağıdaki metni analiz et.

JSON dön:
{
 "sentiment": "...",
 "summary": "...",
 "title": "..."
}

Metin:
${text}
`
                    }
                ]
            })
        });

        const data = await response.json();

        const content = data.choices[0].message.content;

        const cleaned = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return res.status(200).json(JSON.parse(cleaned));

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
