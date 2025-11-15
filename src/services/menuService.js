import { request } from './apiClient';

// 取得商品列表，active 預設為 true，只顯示啟用商品
async function listMenuItems(active = true) {
  const params = new URLSearchParams();
  if (active !== null && active !== undefined) {
    params.set('active', String(active));
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/menu${query}`);
}

// 新增商品（名稱、單價、照片）
async function createMenuItem(payload) {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('unit_price', String(payload.unitPrice));
  if (payload.photo) {
    formData.append('photo', payload.photo);
  }

  return request('/menu', {
    method: 'POST',
    body: formData,
  });
}

// 更新商品（可部分更新）
async function updateMenuItem(id, payload) {
  const formData = new FormData();

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    formData.append('name', payload.name);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'unitPrice')) {
    formData.append('unit_price', String(payload.unitPrice));
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
    formData.append('is_active', String(payload.isActive));
  }
  if (payload.photo) {
    formData.append('photo', payload.photo);
  }

  return request(`/menu/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

// 軟刪除商品（實際上是設 is_active = false）
async function deleteMenuItem(id) {
  return request(`/menu/${id}`, {
    method: 'DELETE',
  });
}

export { listMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
