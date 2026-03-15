export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (url.pathname === "/") {
      return jsonResponse({
        message: "DPPL Cloudflare Worker API is running.",
        endpoint: "/api/silver-prices",
      });
    }

    if (url.pathname === "/api/silver-prices") {
      try {
        const data = await getSilverPrices(env);
        return jsonResponse(data);
      } catch (error) {
        return jsonResponse(
          {
            error: "Failed to fetch silver prices.",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500
        );
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(refreshIfNeeded(env, true));
  },
};

const SOURCE_URL = "https://fenegosida.org/";
const NEPAL_TIMEZONE = "Asia/Kathmandu";
const REFRESH_HOUR = 10;
const REFRESH_MINUTE = 55;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function parseNumber(value) {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "").trim();
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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NEPAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getNepalHourMinute(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NEPAL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const out = {};
  for (const part of parts) {
    if (part.type !== "literal") out[part.type] = part.value;
  }

  return {
    hour: Number(out.hour),
    minute: Number(out.minute),
  };
}

function getEnglishDateDisplay(date = new Date()) {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: NEPAL_TIMEZONE,
    weekday: "long",
  }).format(date);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: NEPAL_TIMEZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return {
    day: day.toUpperCase(),
    date: formattedDate.toUpperCase(),
  };
}

function toNepaliDigits(text) {
  const map = {
    "0": "०",
    "1": "१",
    "2": "२",
    "3": "३",
    "4": "४",
    "5": "५",
    "6": "६",
    "7": "७",
    "8": "८",
    "9": "९",
  };

  return String(text).replace(/[0-9]/g, (d) => map[d] || d);
}

function getNepaliWeekday(englishWeekday) {
  const map = {
    Sunday: "आइतबार",
    Monday: "सोमबार",
    Tuesday: "मंगलबार",
    Wednesday: "बुधबार",
    Thursday: "बिहिबार",
    Friday: "शुक्रबार",
    Saturday: "शनिबार",
  };

  return map[englishWeekday] || englishWeekday;
}

function convertBsMonthToNepali(month) {
  const map = {
    Baisakh: "बैशाख",
    Jestha: "जेठ",
    Ashad: "असार",
    Shrawan: "श्रावण",
    Bhadra: "भदौ",
    Ashoj: "असोज",
    Kartik: "कार्तिक",
    Mansir: "मंसिर",
    Poush: "पुष",
    Magh: "माघ",
    Falgun: "फाल्गुण",
    Chaitra: "चैत्र",
  };

  return map[month] || month;
}

function extractNepaliBsDate(bodyText, fallbackDate = new Date()) {
  const englishWeekday = new Intl.DateTimeFormat("en-US", {
    timeZone: NEPAL_TIMEZONE,
    weekday: "long",
  }).format(fallbackDate);

  const match = bodyText.match(
    /\b(\d{1,2})\s+(Baisakh|Jestha|Ashad|Shrawan|Bhadra|Ashoj|Kartik|Mansir|Poush|Magh|Falgun|Chaitra)\s+(\d{4})\b/i
  );

  if (!match) {
    return {
      day: getNepaliWeekday(englishWeekday),
      date: "",
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
  const response = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Source request failed with status ${response.status}`);
  }

  const html = await response.text();
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tenGramMatch = bodyText.match(
    /SILVER\s*per\s*10\s*grm\s*(?:Nrs|Rs|रु)\s*([\d,]+(?:\.\d+)?)/i
  );
  const oneTolaMatch = bodyText.match(
    /SILVER\s*per\s*1\s*tola\s*(?:Nrs|Rs|रु)\s*([\d,]+(?:\.\d+)?)/i
  );

  const sale10Gram = parseNumber(tenGramMatch?.[1]);
  const sale1Tola = parseNumber(oneTolaMatch?.[1]);

  if (sale10Gram == null || sale1Tola == null) {
    throw new Error("Could not extract silver prices from the source website.");
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

async function readCache(env) {
  const raw = await env.DPPL_CACHE.get("silver-prices", "json");
  return raw || null;
}

async function writeCache(env, data) {
  await env.DPPL_CACHE.put("silver-prices", JSON.stringify(data));
}

async function refreshIfNeeded(env, force = false) {
  const cached = await readCache(env);
  const todayKey = getNepalDateKey();
  const { hour, minute } = getNepalHourMinute();

  const isAfterRefreshTime =
    hour > REFRESH_HOUR || (hour === REFRESH_HOUR && minute >= REFRESH_MINUTE);

  const shouldRefresh =
    force ||
    !cached ||
    (isAfterRefreshTime && cached.cacheDateKey !== todayKey);

  if (!shouldRefresh) {
    return cached;
  }

  try {
    const freshData = await scrapeSilverData();
    await writeCache(env, freshData);
    return freshData;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function getSilverPrices(env) {
  const cached = await readCache(env);
  if (!cached) {
    return await refreshIfNeeded(env, true);
  }
  return await refreshIfNeeded(env, false);
}
