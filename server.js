const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const NIFTY_50_SYMBOLS = [
  "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS", "BAJAJ-AUTO.NS",
  "BAJFINANCE.NS", "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS", "BRITANNIA.NS",
  "CIPLA.NS", "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS", "EICHERMOT.NS",
  "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS", "HEROMOTOCO.NS",
  "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS", "INDUSINDBK.NS",
  "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LTIM.NS", "LT.NS",
  "M&M.NS", "MARUTI.NS", "NTPC.NS", "NESTLEIND.NS", "ONGC.NS",
  "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SBIN.NS", "SUNPHARMA.NS",
  "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS", "TECHM.NS",
  "TITAN.NS", "ULTRACEMCO.NS", "UPL.NS", "WIPRO.NS"
];

const app = express();

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

async function fetchHighLow(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const quote = data.chart?.result?.[0]?.indicators?.quote?.[0];
    const meta = data.chart?.result?.[0]?.meta;
    if (!quote || !meta) return null;
    return {
      name: meta.shortName || symbol,
      symbol,
      low: quote.low?.[0] ?? null,
      high: quote.high?.[0] ?? null
    };
  } catch (e) {
    return { name: symbol, symbol, low: null, high: null };
  }
}

app.get('/api/nifty50', async (req, res) => {
  const results = await Promise.all(NIFTY_50_SYMBOLS.map(fetchHighLow));
  res.json(results.filter(Boolean));
});

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));