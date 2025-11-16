import { BASE_URL } from '../services/apiClient';

/**
 * 將圖片路徑轉成完整 URL：
 * - 若為 http/https 開頭則直接回傳
 * - 否則以 BASE_URL 為前綴組成完整地址
 */
export function getPhotoUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${BASE_URL}/${path}`;
}
