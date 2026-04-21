export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel environment variables.' });
  }

  try {
    const { revenue, industry, profitability, headwinds } = req.body;

    const prompt = `You are a top-tier M&A advisor and financial analyst.
Evaluate this business profile for a potential sale:
- Industry: ${industry || 'General Business'}
- Annual Revenue: $${revenue}
- Profitability: ${profitability || 'Unknown'}
- Known Risks/Headwinds: ${headwinds ? headwinds.join(', ') : 'None specified'}

Output a strictly formatted JSON object matching EXACTLY this schema. Use realistic M&A market estimates for the industry and revenue size.
{
  "current_valuation_low": number,
  "current_valuation_high": number,
  "red_flag_insight": "A 1-2 sentence string explaining the biggest buyer risk specific to the inputs (harsh but professional).",
  "value_bridge_insight": "A 1-2 sentence string explaining how a Fractional Controller / M&A Advisor could fix the risk, improve margins, and increase the multiple.",
  "added_value_potential": number,
  "future_valuation_low": number,
  "future_valuation_high": number
}
Ensure all numbers are integers (e.g. 2500000, not 2.5m). Current valuation should be realistic. Future valuation should be 15-30% higher due to advisory interventions. Value added potential is the difference. Give ONLY the JSON object, absolutely NO MARKDOWN formatting backticks (like \`\`\`json).`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API Error:", errorText);
      return res.status(500).json({ error: 'Failed to communicate with AI provider.' });
    }

    const data = await geminiRes.json();
    const textOutput = data.candidates[0].content.parts[0].text;
    
    // Parse the output to ensure it's valid JSON
    const parsedJson = JSON.parse(textOutput);
    
    return res.status(200).json(parsedJson);

  } catch (error) {
    console.error("Analysis Endpoint Error:", error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
