export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { userMessage, financialData, extractionMode = false } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'Gemini API Key is not configured' });
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  let promptText;
  if (extractionMode) {
    promptText = `Analyze this message and extract ONLY valid stock market symbols. Rules: Apple->AAPL, Microsoft->MSFT, Tesla->TSLA, Google->GOOGL, Amazon->AMZN, Meta->META. Respond only with comma-separated symbols. Message: "${userMessage}"`;
  } else {
    promptText = `You are Maverlang-AI, an expert financial advisor. Query: "${userMessage}". AVAILABLE DATA: ${JSON.stringify(financialData)}. Provide a complete, accessible analysis. If no data, give general educational info.`;
  }
  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: extractionMode ? { temperature: 0.1, maxOutputTokens: 50 } : { temperature: 0.7, maxOutputTokens: 2000 }
  };
  try {
    const geminiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    if (!geminiResponse.ok) throw new Error('Error from Gemini API');
    res.status(200).json(await geminiResponse.json());
  } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); }
}
