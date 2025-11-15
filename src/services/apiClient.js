// 簡單的 API client，基於 fetch 封裝

const BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const mergedOptions = {
    credentials: 'include',
    ...options,
  };

  const resp = await fetch(url, mergedOptions);

  if (!resp.ok) {
    let message = `HTTP ${resp.status}`;
    try {
      const data = await resp.json();
      if (data && data.detail) {
        message = Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg || d).join('\n')
          : data.detail;
      }
    } catch (_) {
      // ignore
    }
    const error = new Error(message);
    error.status = resp.status;
    throw error;
  }

  // 部分 API 如下載 Excel 不會回傳 JSON，由上層自行用 fetch 處理
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return resp.json();
  }
  return resp;
}

export { BASE_URL, request };
