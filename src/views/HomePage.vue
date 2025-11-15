<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>園遊會點餐系統</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">園遊會點餐系統</ion-title>
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
                  <ion-select-option value="NEW">NEW</ion-select-option>
                  <ion-select-option value="COMPLETED">COMPLETED</ion-select-option>
                  <ion-select-option value="CANCELED">CANCELED</ion-select-option>
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
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { downloadOrdersReport } from '../services/orderService';

const router = useRouter();

const reportStatus = ref('ALL');

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
