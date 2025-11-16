<template>
  <ion-page>
    <PageHeader title="訂單管理" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">訂單管理</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="segment-wrapper">
        <ion-segment v-model="activeSegment">
          <ion-segment-button value="create" content-id="create-tab">
            <ion-label>新增訂單</ion-label>
          </ion-segment-button>
          <ion-segment-button value="preparing" content-id="preparing-tab">
            <ion-label>製作中</ion-label>
          </ion-segment-button>
          <ion-segment-button value="awaiting" content-id="awaiting-tab">
            <ion-label>未取餐</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <ion-segment-view>
        <!-- 新增訂單 -->
        <ion-segment-content id="create-tab" class="tab-content">
          <!-- 顧客姓名如未使用可保留日後擴充
          <ion-list>
            <ion-item>
              <ion-label position="stacked">顧客姓名</ion-label>
              <ion-input v-model="customerName" placeholder="請輸入顧客姓名"></ion-input>
            </ion-item>
          </ion-list>
          -->

          <div class="section-title">選擇商品</div>
          
          <div v-if="loadingMenu" class="center-block">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else>
                    <ion-list v-if="menuItems.length">
              <ion-item v-for="item in menuItems" :key="item.id" class="menu-item">
                <ion-avatar slot="start">
                  <img :src="item.photo_url ? getPhotoUrl(item.photo_url) : '/favicon.png'" :alt="item.name" />
                </ion-avatar>

                <ion-label>
                  <h2>{{ item.name }}</h2>
                  <p>單價：$ {{ formatPrice(item.unit_price) }}</p>
                </ion-label>

                <div class="quantity-controls">
                  <ion-button size="small" fill="outline" @click="changeQuantity(item, -1)">
                    -
                  </ion-button>
                  <div class="quantity-text">{{ getQuantity(item.id) }}</div>
                  <ion-button size="small" fill="outline" @click="changeQuantity(item, 1)">
                    +
                  </ion-button>
                </div>
              </ion-item>
            </ion-list>

            <div v-else class="center-block empty-text">
              尚未建立任何商品，請先至「商品管理」新增商品。
            </div>
          </div>

          <div class="section-title">訂單摘要</div>
          <ion-list v-if="cartItems.length">
            <ion-item v-for="ci in cartItems" :key="ci.menu_item_id">
              <ion-label>
                <h2>{{ ci.item_name }}</h2>
                <p>
                  數量：{{ ci.quantity }}
                  &nbsp; 單價：$ {{ formatPrice(ci.unit_price) }}
                  &nbsp; 小計：$ {{ formatPrice(ci.line_total) }}
                </p>
              </ion-label>
            </ion-item>
          </ion-list>
          <div v-else class="center-block empty-text">
            尚未選擇任何商品。
          </div>

          <div class="summary-footer">
            <div class="total-text">總金額：$ {{ formatPrice(totalAmount) }}</div>
            <ion-button expand="block" color="primary" :disabled="submitting" @click="submitOrder">
              送出訂單
            </ion-button>
          </div>
        </ion-segment-content>

        <!-- 製作中（NEW） -->
        <ion-segment-content id="preparing-tab" class="tab-content">
          <div class="section-title">製作中</div>

          <div v-if="loadingNewOrders" class="center-block">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <ion-list v-else-if="newOrders.length">
            <ion-item v-for="order in newOrders" :key="order.id" class="order-item">
              <ion-label>
                <h2>
                  <ion-chip color="warning">製作中</ion-chip>
                  <span class="order-code">{{ order.order_code }}</span>
                  <span class="customer-name">{{ order.customer_name }}</span>
                </h2>
                <p>
                  金額：$ {{ formatPrice(order.total_price) }}
                  &nbsp; 建立時間：{{ formatTime(order.created_at) }}
                </p>
                <p class="items-text">
                  {{ buildItemsSummary(order.items) }}
                </p>
              </ion-label>

              <div class="order-actions">
                <ion-button size="small" color="success" fill="solid" @click="moveToAwaiting(order)">
                  完成
                </ion-button>
                <ion-button size="small" color="medium" fill="outline" @click="cancel(order)">
                  取消
                </ion-button>
              </div>
            </ion-item>
          </ion-list>

          <div v-else class="center-block empty-text">
            目前沒有製作中的訂單。
          </div>
        </ion-segment-content>

        <!-- 未取餐（AWAITING） -->
        <ion-segment-content id="awaiting-tab" class="tab-content">
          <div class="section-title">未取餐</div>

          <div v-if="loadingAwaiting" class="center-block">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <ion-list v-else-if="awaitingOrders.length">
            <ion-item v-for="order in awaitingOrders" :key="order.id" class="order-item">
              <ion-label>
                <h2>
                  <ion-chip color="secondary">未取餐</ion-chip>
                  <span class="order-code">{{ order.order_code }}</span>
                  <span class="customer-name">{{ order.customer_name }}</span>
                </h2>
                <p>
                  金額：$ {{ formatPrice(order.total_price) }}
                  &nbsp; 建立時間：{{ formatTime(order.created_at) }}
                </p>
                <p class="items-text">
                  {{ buildItemsSummary(order.items) }}
                </p>
              </ion-label>

              <div class="order-actions">
                <ion-button size="small" color="success" fill="solid" @click="completeAwaiting(order)">
                  完成
                </ion-button>
              </div>
            </ion-item>
          </ion-list>

          <div v-else class="center-block empty-text">
            目前沒有未取餐訂單。
          </div>
        </ion-segment-content>
      </ion-segment-view>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonSegmentView,
  IonSegmentContent,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonButton,
  IonSpinner,
  IonChip,
  toastController,
  onIonViewDidEnter,
  onIonViewDidLeave,
} from '@ionic/vue';
import PageHeader from '../components/PageHeader.vue';
import { getPhotoUrl } from '../utils/url';
import { listMenuItems } from '../services/menuService';
import { createOrder, listOrders, cancelOrder, awaitOrder, completeOrder } from '../services/orderService';
import { formatTime } from '../utils/datetime';

const customerName = ref('');
const menuItems = ref([]);
const quantities = ref({}); // key: menu_id, value: quantity

const loadingMenu = ref(false);
const submitting = ref(false);

const newOrders = ref([]); // status NEW
const awaitingOrders = ref([]); // status AWAITING
const loadingNewOrders = ref(false);
const loadingAwaiting = ref(false);

const activeSegment = ref('create');

const REFRESH_INTERVAL = 15000;
let refreshIntervalId = null;

function clearRefreshInterval() {
  if (refreshIntervalId !== null) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

function setupRefreshInterval() {
  clearRefreshInterval();

  if (activeSegment.value === 'preparing' || activeSegment.value === 'awaiting') {
    refreshIntervalId = setInterval(() => {
      if (activeSegment.value === 'preparing') {
        fetchNewOrders();
      } else if (activeSegment.value === 'awaiting') {
        fetchAwaitingOrders();
      }
    }, REFRESH_INTERVAL);
  }
}

async function showToast(message, color = 'primary') {
  const toast = await toastController.create({
    message,
    color,
    duration: 2000,
    position: 'bottom',
  });
  await toast.present();
}

function formatPrice(value) {
  if (value == null) return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toFixed(0);
}

function getQuantity(menuId) {
  return quantities.value[menuId] || 0;
}

function changeQuantity(item, delta) {
  const current = getQuantity(item.id);
  let next = current + delta;
  if (next < 0) next = 0;
  quantities.value = {
    ...quantities.value,
    [item.id]: next,
  };
}

const cartItems = computed(() => {
  const result = [];
  menuItems.value.forEach((item) => {
    const qty = getQuantity(item.id);
    if (qty > 0) {
      const unitPriceNum = Number(item.unit_price);
      const lineTotal = unitPriceNum * qty;
      result.push({
        menu_item_id: item.id,
        item_name: item.name,
        unit_price: unitPriceNum,
        quantity: qty,
        line_total: lineTotal,
      });
    }
  });
  return result;
});

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, ci) => sum + ci.line_total, 0);
});

async function fetchMenu() {
  try {
    loadingMenu.value = true;
    const data = await listMenuItems(true);
    menuItems.value = data || [];
  } catch (err) {
    console.error(err);
    showToast(err.message || '載入商品失敗', 'danger');
  } finally {
    loadingMenu.value = false;
  }
}

async function fetchNewOrders() {
  try {
    loadingNewOrders.value = true;
    const data = await listOrders('NEW');
    newOrders.value = data || [];
  } catch (err) {
    console.error(err);
    showToast(err.message || '載入訂單失敗', 'danger');
  } finally {
    loadingNewOrders.value = false;
  }
}

async function fetchAwaitingOrders() {
  try {
    loadingAwaiting.value = true;
    const data = await listOrders('AWAITING');
    awaitingOrders.value = data || [];
  } catch (err) {
    console.error(err);
    showToast(err.message || '載入訂單失敗', 'danger');
  } finally {
    loadingAwaiting.value = false;
  }
}

function resetCreateForm() {
  customerName.value = '';
  quantities.value = {};
}

async function submitOrder() {
  try {
    // 若未使用顧客姓名，可略過檢查
    if (!cartItems.value.length) {
      showToast('請至少選擇一項商品', 'warning');
      return;
    }

    submitting.value = true;

    const payload = {
      customer_name: customerName.value,
      items: cartItems.value.map((ci) => ({
        menu_item_id: ci.menu_item_id,
        quantity: ci.quantity,
      })),
    };

    await createOrder(payload);
    showToast('建立訂單成功');
    resetCreateForm();

    await fetchNewOrders();
  } catch (err) {
    console.error(err);
    showToast(err.message || '建立訂單失敗', 'danger');
  } finally {
    submitting.value = false;
  }
}

function buildItemsSummary(items) {
  if (!items || !items.length) return '';
  return items
    .map((it) => `${it.item_name} x${it.quantity}`)
    .join('、');
}

async function cancel(order) {
  try {
    await cancelOrder(order.id);
    showToast(`訂單 ${order.order_code} 已取消`);
    await fetchNewOrders();
  } catch (err) {
    console.error(err);
    showToast(err.message || '取消訂單失敗', 'danger');
  }
}

// 從 NEW → AWAITING
async function moveToAwaiting(order) {
  try {
    await awaitOrder(order.id);
    showToast(`訂單 ${order.order_code} 已移至未取餐`);
    await Promise.all([fetchNewOrders(), fetchAwaitingOrders()]);
  } catch (err) {
    console.error(err);
    showToast(err.message || '更新訂單狀態失敗', 'danger');
  }
}

// 從 AWAITING → COMPLETED
async function completeAwaiting(order) {
  try {
    await completeOrder(order.id);
    showToast(`訂單 ${order.order_code} 已完成`);
    await fetchAwaitingOrders();
  } catch (err) {
    console.error(err);
    showToast(err.message || '完成訂單失敗', 'danger');
  }
}

watch(activeSegment, (newVal) => {
  if (newVal === 'preparing') {
    fetchNewOrders();
  } else if (newVal === 'awaiting') {
    fetchAwaitingOrders();
  }
  setupRefreshInterval();
});

onMounted(() => {
  //fetchMenu();
  //fetchNewOrders();
  //fetchAwaitingOrders();
  //setupRefreshInterval();
});

onIonViewDidEnter(() => {
  fetchMenu();
  fetchNewOrders();
  fetchAwaitingOrders();
  setupRefreshInterval();
});

onIonViewDidLeave(() => {
  clearRefreshInterval();
});

onUnmounted(() => {
  clearRefreshInterval();
});
</script>

<style scoped>
.segment-wrapper {
  padding: 8px 12px;
}

.tab-content {
  padding-bottom: 16px;
}

.section-title {
  padding: 8px 16px;
  font-weight: 600;
}

.center-block {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.empty-text {
  color: var(--ion-color-medium);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-text {
  min-width: 24px;
  text-align: center;
}

.summary-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 12px 16px 24px;
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
}

.total-text {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: bold;
}

.order-item {
  --min-height: 80px;
}

.order-code {
  margin-left: 8px;
  font-weight: 600;
}

.customer-name {
  margin-left: 8px;
}

.items-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  --min-height: 72px;
}
</style>
