// İstanbul için basit hava durumu — Open-Meteo API key gerektirmez.
const ISTANBUL_LAT = 41.0082;
const ISTANBUL_LON = 28.9784;

const WEATHER_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: "Açık", emoji: "☀️" },
  1: { label: "Az bulutlu", emoji: "🌤️" },
  2: { label: "Parçalı bulutlu", emoji: "⛅" },
  3: { label: "Kapalı", emoji: "☁️" },
  45: { label: "Sisli", emoji: "🌫️" },
  48: { label: "Sisli", emoji: "🌫️" },
  51: { label: "Çisenti", emoji: "🌦️" },
  61: { label: "Yağmurlu", emoji: "🌧️" },
  63: { label: "Yağmurlu", emoji: "🌧️" },
  65: { label: "Sağanak", emoji: "🌧️" },
  71: { label: "Karlı", emoji: "🌨️" },
  80: { label: "Sağanak", emoji: "🌦️" },
  95: { label: "Fırtınalı", emoji: "⛈️" },
};

export async function getIstanbulWeather() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${ISTANBUL_LAT}&longitude=${ISTANBUL_LON}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FIstanbul&forecast_days=1`,
      { next: { revalidate: 1800 } } // 30 dakikada bir tazele
    );
    if (!res.ok) return null;
    const data = await res.json();
    const code = data.current?.weather_code ?? 0;
    const info = WEATHER_LABELS[code] ?? { label: "Bilinmiyor", emoji: "🌡️" };
    return {
      temp: Math.round(data.current?.temperature_2m),
      tempMax: Math.round(data.daily?.temperature_2m_max?.[0]),
      tempMin: Math.round(data.daily?.temperature_2m_min?.[0]),
      rainChance: data.daily?.precipitation_probability_max?.[0] ?? 0,
      label: info.label,
      emoji: info.emoji,
    };
  } catch {
    return null;
  }
}
