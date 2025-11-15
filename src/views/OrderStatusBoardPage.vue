<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>取餐公告欄</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">取餐公告欄</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="board-container">
        <section class="board-section preparing">
          <div class="section-header">
            <h2>製作中</h2>
            <ion-badge color="warning">{{ newOrders.length }}</ion-badge>
          </div>

          <div v-if="loading" class="center-block">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else>
            <div v-if="newOrders.length" class="order-grid">
              <div v-for="order in newOrders" :key="order.id" class="board-card">
                <div class="order-code">{{ order.order_code }}</div>
                <div class="customer-name">{{ order.customer_name }}</div>
                <div class="time-text">建立時間：{{ formatTime(order.created_at) }}</div>
              </div>
            </div>
            <div v-else class="center-block empty-text">
              目前沒有製作中的訂單。
            </div>
          </div>
        </section>

        <section class="board-section ready">
          <div class="section-header">
            <h2>可取餐</h2>
            <ion-badge color="success">{{ filteredCompletedOrders.length }}</ion-badge>
          </div>

          <div v-if="loading" class="center-block">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else>
            <div v-if="filteredCompletedOrders.length" class="order-grid">
              <div v-for="order in filteredCompletedOrders" :key="order.id" class="board-card ready-card">
                <div class="order-code">{{ order.order_code }}</div>
                <div class="customer-name">{{ order.customer_name }}</div>
                <div class="time-text">完成時間：{{ formatTime(order.created_at) }}</div>
              </div>
            </div>
            <div v-else class="center-block empty-text">
              目前沒有可取餐的訂單。
            </div>
          </div>
        </section>
      </div>

      <ion-toast
        :is-open="toast.isOpen"
        :message="toast.message"
        :color="toast.color"
        :duration="2000"
        @didDismiss="toast.isOpen = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBadge,
  IonSpinner,
  IonToast,
} from '@ionic/vue';
import { listOrders } from '../services/orderService';
import { formatTime } from '../utils/datetime';

const newOrders = ref([]);
const completedOrders = ref([]);
const loading = ref(false);
const intervalId = ref(null);

const toast = ref({
  isOpen: false,
  message: '',
  color: 'primary',
});

const MAX_COMPLETED_ORDERS_DISPLAY = 20;
const COMPLETED_TIME_WINDOW_MINUTES = 30;

function showToast(message, color = 'primary') {
  toast.value.message = message;
  toast.value.color = color;
  toast.value.isOpen = true;
}

const filteredCompletedOrders = computed(() => {
  const now = new Date();
  const filtered = (completedOrders.value || []).filter((order) => {
    //if (!order.created_at) return false;
    //const createdAt = new Date(order.created_at);
    //const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000;
    return true;
  });

  // 後端已經 created_at desc，這裡保險再排序一次
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return filtered.slice(0, MAX_COMPLETED_ORDERS_DISPLAY);
});

async function fetchOrders() {
  try {
    loading.value = true;
    const [newData, completedData] = await Promise.all([
      listOrders('NEW'),
      listOrders('AWAITING'),
    ]);
    newOrders.value = newData || [];
    completedOrders.value = completedData || [];
  } catch (err) {
    console.error(err);
    showToast(err.message || '載入訂單資料失敗', 'danger');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchOrders();
  const id = setInterval(fetchOrders, 15000);
  intervalId.value = id;
});

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<style scoped>
.board-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.board-section {
  flex: 1;
  padding: 12px 16px 16px;
  overflow: hidden;
}

.preparing {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-header h2 {
  font-size: 24px;
  margin: 0;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding-top: 4px;
}

.board-card {
  border-radius: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
}

.ready-card {
  background: rgba(56, 142, 60, 0.85);
  color: #fff;
}

.order-code {
  font-size: 28px;
  font-weight: bold;
}

.customer-name {
  margin-top: 4px;
  font-size: 18px;
}

.time-text {
  margin-top: 4px;
  font-size: 14px;
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

@media (min-width: 768px) {
  .section-header h2 {
    font-size: 28px;
  }

  .order-code {
    font-size: 32px;
  }

  .customer-name {
    font-size: 20px;
  }
}
</style>
