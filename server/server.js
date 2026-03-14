import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 5000;
const SOURCE_URL = 'https://fenegosida.org/';
const NEPAL_TIMEZONE = 'Asia/Kathmandu';
const REFRESH_HOUR = 10;
const REFRESH_MINUTE = 55;

app.use(cors());
app.use(express.json());

let priceCache = null;

function parseNumber(value) {
  if (!value) return null;
  const cleaned = value.replace(/,/g, '').trim();
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function roundToNearestHalf(value) {
  return Math.round(value * 2) / 2;
}

function formatPrice(value) {
  return value.toFixed(2);
}

function getNepalDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: NEPAL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

function getNepalHourMinute(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NEPAL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const out = {};
  for (const part of parts) {
    if (part.type !== 'literal') out[part.type] = part.value;
  }

  return {
    hour: Number(out.hour),
    minute: Number(out.minute),
  };
}

function getEnglishDateDisplay(date = new Date()) {
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: NEPAL_TIMEZONE,
    weekday: 'long',
  }).format(date);

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: NEPAL_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return {
    day: day.toUpperCase(),
    date: formattedDate.toUpperCase(),
  };
}

function toNepaliDigits(text) {
  const map = {
    '0': '०',
    '1': '१',
    '2': '२',
    '3': '३',
    '4': '४',
    '5': '५',
    '6': '६',
    '7': '७',
    '8': '८',
    '9': '९',
  };

  return String(text).replace(/[0-9]/g, (d) => map[d] || d);
}

function getNepaliWeekday(englishWeekday) {
  const map = {
    Sunday: 'आइतबार',
    Monday: 'सोमबार',
    Tuesday: 'मंगलबार',
    Wednesday: 'बुधबार',
    Thursday: 'बिहिबार',
    Friday: 'शुक्रबार',
    Saturday: 'शनिबार',
  };

  return map[englishWeekday] || englishWeekday;
}

function convertBsMonthToNepali(month) {
  const map = {
    Baisakh: 'बैशाख',
    Jestha: 'जेठ',
    Ashad: 'असार',
    Shrawan: 'श्रावण',
    Bhadra: 'भदौ',
    Ashoj: 'असोज',
    Kartik: 'कार्तिक',
    Mansir: 'मंसिर',
    Poush: 'पुष',
    Magh: 'माघ',
    Falgun: 'फाल्गुण',
    Chaitra: 'चैत्र',
  };

  return map[month] || month;
}

function extractNepaliBsDate(bodyText, fallbackDate = new Date()) {
  const englishWeekday = new Intl.DateTimeFormat('en-US', {
    timeZone: NEPAL_TIMEZONE,
    weekday: 'long',
  }).format(fallbackDate);

  const match = bodyText.match(
    /\b(\d{1,2})\s+(Baisakh|Jestha|Ashad|Shrawan|Bhadra|Ashoj|Kartik|Mansir|Poush|Magh|Falgun|Chaitra)\s+(\d{4})\b/i
  );

  if (!match) {
    return {
      day: getNepaliWeekday(englishWeekday),
      date: '',
    };
  }

  return {
    day: getNepaliWeekday(englishWeekday),
    date: `${toNepaliDigits(match[1])} ${convertBsMonthToNepali(
      match[2]
    )} ${toNepaliDigits(match[3])}`,
  };
}

async function scrapeSilverData() {
  const response = await axios.get(SOURCE_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 20000,
  });

  const html = response.data;
  const $ = cheerio.load(html);
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  const tenGramMatch = bodyText.match(
    /SILVER\s*per\s*10\s*grm\s*(?:Nrs|Rs|रु)\s*([\d,]+(?:\.\d+)?)/i
  );
  const oneTolaMatch = bodyText.match(
    /SILVER\s*per\s*1\s*tola\s*(?:Nrs|Rs|रु)\s*([\d,]+(?:\.\d+)?)/i
  );

  const sale10Gram = parseNumber(tenGramMatch?.[1]);
  const sale1Tola = parseNumber(oneTolaMatch?.[1]);

  if (sale10Gram == null || sale1Tola == null) {
    throw new Error('Could not extract silver prices from the source website.');
  }

  const purchase10Gram = roundToNearestHalf(sale10Gram - sale10Gram * 0.04);
  const purchase1Tola = roundToNearestHalf(sale1Tola - sale1Tola * 0.04);

  const now = new Date();

  return {
    source: SOURCE_URL,
    fetchedAt: now.toISOString(),
    cacheDateKey: getNepalDateKey(now),
    dateInfo: {
      english: getEnglishDateDisplay(now),
      nepali: extractNepaliBsDate(bodyText, now),
    },
    silver: {
      sale: {
        gram10: formatPrice(sale10Gram),
        tola1: formatPrice(sale1Tola),
      },
      purchase: {
        gram10: formatPrice(purchase10Gram),
        tola1: formatPrice(purchase1Tola),
      },
    },
  };
}

async function refreshCache(force = false) {
  const todayKey = getNepalDateKey();
  const { hour, minute } = getNepalHourMinute();
  const isAfterRefreshTime =
    hour > REFRESH_HOUR || (hour === REFRESH_HOUR && minute >= REFRESH_MINUTE);

  const shouldRefresh =
    force ||
    !priceCache ||
    (isAfterRefreshTime && priceCache.cacheDateKey !== todayKey);

  if (!shouldRefresh) {
    return priceCache;
  }

  try {
    const freshData = await scrapeSilverData();
    priceCache = freshData;
    console.log(
      `Cache updated for ${freshData.cacheDateKey} at ${freshData.fetchedAt}`
    );
  } catch (error) {
    console.error('Refresh failed:', error.message);
    if (!priceCache) throw error;
  }

  return priceCache;
}

function startRefreshWatcher() {
  setInterval(async () => {
    await refreshCache(false);
  }, 30 * 1000);
}

app.get('/api/silver-prices', async (_req, res) => {
  try {
    const data = await refreshCache(false);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch silver prices.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/', (_req, res) => {
  res.json({
    message: 'DPPL silver price server is running.',
    endpoint: '/api/silver-prices',
  });
});

async function startServer() {
  try {
    await refreshCache(true);
    startRefreshWatcher();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();