import { BASE_URL, request } from './apiClient';

// 建立訂單
async function createOrder(payload) {
  // payload: { customer_name: string, items: [{ menu_item_id, quantity }] }
  return request('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

// 取得訂單列表，可依狀態與預購過濾
async function listOrders(status, preorder) {
    //console.log(preorder)
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  // 後端以 `preorder` 作為查詢參數別名，需傳遞 'true' 或 'false'
  if(preorder !== undefined){
    params.set('preorder', preorder ? 'true' : 'false');
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/orders${query}`);
}

// 取消訂單（僅 NEW 可取消）
async function cancelOrder(orderId) {
  return request(`/orders/${orderId}/cancel`, {
    method: 'POST',
  });
}

// 將訂單狀態從 NEW 改為 AWAITING（未取餐）
async function awaitOrder(orderId) {
  return request(`/orders/${orderId}/await`, {
    method: 'POST',
  });
}

// 完成訂單（從 AWAITING 改為 COMPLETED，也可視後端實作支援 NEW → COMPLETED）
async function completeOrder(orderId) {
  return request(`/orders/${orderId}/complete`, {
    method: 'POST',
  });
}

// 取得所有訂單狀態字串陣列
async function listOrderStatuses() {
  return request('/orders/statuses');
}

// 取得訂單統計資訊
async function getOrderStats(status) {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/orders/stats${query}`);
}

// 刪除所有訂單
async function deleteAllOrders() {
  return request('/orders', {
    method: 'DELETE',
  });
}

// 下載訂單報表 Excel
// status: 'ALL' | 'NEW' | 'COMPLETED' | 'CANCELED'
// 若為 'ALL' 則不帶 status 參數，需後端配合將 status 預設改為 None 表示全部
function downloadOrdersReport(status) {
  let url = `${BASE_URL}/reports/orders.xlsx`;
  if (status && status !== 'ALL') {
    const params = new URLSearchParams();
    params.set('status', status);
    url += `?${params.toString()}`;
  }
  window.open(url, '_blank');
}

export {
  createOrder,
  listOrders,
  cancelOrder,
  awaitOrder,
  completeOrder,
  listOrderStatuses,
  getOrderStats,
  deleteAllOrders,
  downloadOrdersReport,
};
