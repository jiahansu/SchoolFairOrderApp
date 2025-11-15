export interface MenuItem {
  id: number;
  name: string;
  /**
   * 後端為 Decimal，前端以 string 接收，必要時自行轉成 number 顯示
   */
  unit_price: string;
  is_active: boolean;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
}
