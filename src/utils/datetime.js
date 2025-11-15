// 共用的日期時間工具
// 將後端回傳的 UTC 字串轉成目前使用者本地時間的 HH:mm 格式
//
// 支援兩種情況：
// 1. 字串本身有時區資訊（例如結尾為 Z 或 +08:00），直接交給 Date 處理
// 2. 字串沒有時區資訊（例如 2025-11-15T12:34:56），一律視為 UTC 來解析

export function formatTime(isoString) {
  if (!isoString) return '';

  let d;

  // 若字串本身已帶有時區資訊（例如結尾有 Z 或 +08:00），直接交給 Date 處理
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(isoString)) {
    d = new Date(isoString);
  } else {
    // 沒有時區資訊時，將其視為 UTC 來解析
    const parts = isoString.split(/[-T: ]/);
    const [year, month, day, hour = '0', minute = '0', second = '0'] = parts;
    const utcMs = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
    d = new Date(utcMs);
  }

  if (Number.isNaN(d.getTime())) return '';

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
