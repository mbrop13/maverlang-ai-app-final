export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { symbol } = req.body;
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'Finnhub API Key is not configured' });
  if (!symbol) return res.status(400).json({ message: 'Symbol is required' });
  try {
    const [quoteResponse, profileResponse] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
    ]);
    if (!quoteResponse.ok) return res.status(quoteResponse.status).json({ message: `Error fetching quote data` });
    res.status(200).json({ quoteData: await quoteResponse.json(), profileData: profileResponse.ok ? await profileResponse.json() : {} });
  } catch (error) { res.status(500).json({ message: 'Internal Server Error', error: error.message }); }
}
