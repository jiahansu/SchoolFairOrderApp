<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>園遊會點餐系統</ion-title>
        <ion-buttons slot="end">
          <ion-button
            color="danger"
            fill="clear"
            size="small"
            @click="openDeleteAllOrdersAlert"
            aria-label="刪除所有訂單"
          >
            <ion-icon :icon="trashOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-alert
        :is-open="isDeleteAlertOpen"
        header="危險操作"
        sub-header="刪除所有訂單"
        message="此動作會永久刪除所有訂單資料，請輸入密碼確認："
        :inputs="deleteAlertInputs"
        :buttons="deleteAlertButtons"
        @didDismiss="onDeleteAlertDismiss"
      />

      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">園遊會點餐系統</ion-title>
          <ion-buttons slot="end">
            <ion-button
              color="danger"
              fill="clear"
              size="small"
              @click="openDeleteAllOrdersAlert"
              aria-label="刪除所有訂單"
            >
              <ion-icon :icon="trashOutline" slot="icon-only" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div class="home-wrapper ion-padding">
        <div class="home-container">
          <ion-card button @click="goTo('/menu')">
            <ion-card-header>
              <ion-card-title>商品管理</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              新增、編輯與停用園遊會商品。
            </ion-card-content>
          </ion-card>

          <ion-card button @click="goTo('/orders')">
            <ion-card-header>
              <ion-card-title>訂單管理</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              協助顧客點餐，管理 NEW 訂單狀態。
            </ion-card-content>
          </ion-card>

          <ion-card button @click="goTo('/board')">
            <ion-card-header>
              <ion-card-title>訂單公告欄</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              顯示製作中與可取餐訂單給顧客查看。
            </ion-card-content>
          </ion-card>

          <ion-card>
            <ion-card-header>
              <ion-card-title>下載訂單報表</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item lines="none">
                <ion-label>訂單狀態</ion-label>
                <ion-select v-model="reportStatus" interface="popover">
                  <ion-select-option value="ALL">全部</ion-select-option>
                  <ion-select-option value="NEW">製作中</ion-select-option>
                  <ion-select-option value="AWAITING">帶取餐</ion-select-option>
                  <ion-select-option value="COMPLETED">已完成</ion-select-option>
                  <ion-select-option value="CANCELED">已取消</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-button expand="block" color="primary" class="download-button" @click="downloadReport">
                下載訂單報表
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonIcon,
  IonAlert,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { trashOutline } from 'ionicons/icons';
import { downloadOrdersReport, deleteAllOrders } from '../services/orderService';

const router = useRouter();

const reportStatus = ref('ALL');
const isDeleteAlertOpen = ref(false);

const deleteAlertInputs = [
  {
    name: 'password',
    type: 'password',
    placeholder: '請輸入密碼',
    attributes: {
      autocomplete: 'off',
    },
  },
];

const deleteAlertButtons = [
  {
    text: '取消',
    role: 'cancel',
  },
  {
    text: '確定刪除',
    role: 'confirm',
    handler: async (data) => {
      if (!data || data.password !== 'bryan') {
        window.alert('密碼錯誤');
        return false;
      }
      try {
        await deleteAllOrders();
        window.alert('已刪除所有訂單');
      } catch (error) {
        const msg = error && error.message ? error.message : String(error);
        window.alert(`刪除失敗：${msg}`);
      }
      return true;
    },
  },
];

function openDeleteAllOrdersAlert() {
  isDeleteAlertOpen.value = true;
}

function onDeleteAlertDismiss() {
  isDeleteAlertOpen.value = false;
}

function goTo(path) {
  router.push(path);
}

function downloadReport() {
  downloadOrdersReport(reportStatus.value);
}
</script>

<style scoped>
.home-wrapper {
  height: 100%;
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: center; /* 水平置中整個卡片區塊 */
}

.home-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  grid-gap: 12px;
  width: 100%;
  max-width: 960px; /* 讓內容不會太寬，居中比較好看 */
}

.download-button {
  margin-top: 8px;
}
</style>
