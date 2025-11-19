<template>
  <ion-page>
    <PageHeader title="商品管理" />

    <ion-content :fullscreen="true">

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-text="下拉重新整理"></ion-refresher-content>
      </ion-refresher>

      <div class="toolbar-row">
        <ion-item lines="none">
          <ion-label>只顯示啟用商品</ion-label>
          <ion-toggle v-model="onlyActive" @ionChange="fetchMenuItems"></ion-toggle>
        </ion-item>

        <ion-button color="primary" @click="openCreateModal">新增商品</ion-button>
      </div>

      <div v-if="loading" class="center-block">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else>
        <ion-list v-if="items.length">
          <ion-item v-for="item in items" :key="item.id" class="menu-item">
            <ion-avatar slot="start" v-if="item.photo_url">
              <img :src="getPhotoUrl(item.photo_url)" :alt="item.name" />
            </ion-avatar>

            <ion-label>
              <h2>{{ item.name }}</h2>
              <p>單價：$ {{ formatPrice(item.unit_price) }}</p>
              <p>
                狀態：
                <ion-badge :color="item.is_active ? 'success' : 'medium'">
                  {{ item.is_active ? '啟用' : '停用' }}
                </ion-badge>
              </p>
            </ion-label>

            <div class="item-actions">
              <ion-button size="small" @click="openEditModal(item)">編輯</ion-button>

              <ion-button
                v-if="item.is_active"
                size="small"
                color="medium"
                fill="outline"
                @click="deactivateItem(item)"
              >
                停用
              </ion-button>
              <ion-button
                v-else
                size="small"
                color="success"
                fill="outline"
                @click="activateItem(item)"
              >
                啟用
              </ion-button>

              <ion-button
                size="small"
                color="danger"
                fill="outline"
                @click="removeItem(item)"
              >
                刪除
              </ion-button>
            </div>
          </ion-item>
        </ion-list>

        <div v-else class="center-block empty-text">
          目前沒有商品，請先新增。
        </div>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingItem ? '編輯商品' : '新增商品' }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form @submit.prevent="submitForm">
            <ion-list>
              <ion-item>
                <ion-label position="stacked">商品名稱</ion-label>
                <ion-input v-model="form.name" required placeholder="請輸入商品名稱"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">單價</ion-label>
                <ion-input
                  v-model.number="form.unitPrice"
                  type="number"
                  min="-5"
                  step="1"
                  required
                  placeholder="請輸入單價"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">商品照片（選填）</ion-label>
                <input type="file" accept="image/*" @change="onFileChange" />
              </ion-item>

              <ion-item v-if="editingItem">
                <ion-label>啟用狀態</ion-label>
                <ion-toggle v-model="form.isActive"></ion-toggle>
              </ion-item>
            </ion-list>

            <div class="modal-actions">
              <ion-button type="button" fill="outline" @click="closeModal">取消</ion-button>
              <ion-button type="submit" color="primary">儲存</ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>

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
import { ref, onMounted, nextTick } from 'vue';
import {
  IonPage,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonList,
  IonAvatar,
  IonBadge,
  IonModal,
  IonInput,
  IonSpinner,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/vue';
import PageHeader from '../components/PageHeader.vue';
import { getPhotoUrl } from '../utils/url';
import { listMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuService';

const items = ref([]);
const loading = ref(false);
const onlyActive = ref(true);

const isModalOpen = ref(false);
const editingItem = ref(null);

const form = ref({
  name: '',
  unitPrice: null,
  isActive: true,
  photo: null,
});

const toast = ref({
  isOpen: false,
  message: '',
  color: 'primary',
});

function showToast(message, color = 'primary') {
  toast.value.message = message;
  toast.value.color = color;
  toast.value.isOpen = true;
}

function formatPrice(value) {
  if (value == null) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toFixed(0);
}

async function fetchMenuItems() {
  try {
    loading.value = true;
    // toggle 打開時只顯示啟用商品；關閉時顯示全部（active = null）
    const activeFilter = onlyActive.value ? true : null;
    const data = await listMenuItems(activeFilter);
    items.value = data || [];
  } catch (err) {
    console.error(err);
    showToast(err.message || '載入商品失敗', 'danger');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.value = {
    name: '',
    unitPrice: null,
    isActive: true,
    photo: null,
  };
  editingItem.value = null;
}

function openCreateModal() {
  resetForm();
  isModalOpen.value = true;
}

function openEditModal(item) {
  editingItem.value = item;
  form.value = {
    name: item.name,
    unitPrice: Number(item.unit_price),
    isActive: item.is_active,
    photo: null,
  };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function onFileChange(event) {
  const files = event.target.files;
  if (files && files[0]) {
    form.value.photo = files[0];
  } else {
    form.value.photo = null;
  }
}

async function submitForm() {
  try {
    if (!form.value.name) {
      showToast('請輸入商品名稱', 'warning');
      return;
    }
    if (form.value.unitPrice == null || Number.isNaN(Number(form.value.unitPrice))) {
      showToast('請輸入正確的單價', 'warning');
      return;
    }

    const payload = {
      name: form.value.name,
      unitPrice: form.value.unitPrice,
      photo: form.value.photo,
    };

    if (!editingItem.value) {
      await createMenuItem(payload);
      showToast('新增商品成功');
    } else {
      const updatePayload = {
        name: form.value.name,
        unitPrice: form.value.unitPrice,
        isActive: form.value.isActive,
        photo: form.value.photo,
      };
      await updateMenuItem(editingItem.value.id, updatePayload);
      showToast('更新商品成功');
    }

    isModalOpen.value = false;
    // 等待 modal 關閉並完成 DOM 更新，再重新載入列表，避免與 Ionic 動畫產生 DOM 衝突
    await nextTick();
    setTimeout(fetchMenuItems, 250);
    //await fetchMenuItems();
  } catch (err) {
    console.error(err);
    showToast(err.message || '儲存失敗', 'danger');
  }
}

async function deactivateItem(item) {
  if (!item.is_active) {
    showToast('此商品已經是停用狀態');
    return;
  }
  try {
    await updateMenuItem(item.id, { isActive: false });
    showToast('已停用商品');
    await fetchMenuItems();
  } catch (err) {
    console.error(err);
    showToast(err.message || '停用失敗', 'danger');
  }
}

async function activateItem(item) {
  if (item.is_active) {
    showToast('此商品已經是啟用狀態');
    return;
  }
  try {
    await updateMenuItem(item.id, { isActive: true });
    showToast('已啟用商品');
    await fetchMenuItems();
  } catch (err) {
    console.error(err);
    showToast(err.message || '啟用失敗', 'danger');
  }
}

async function removeItem(item) {
  try {
    const resp = await deleteMenuItem(item.id);
    const msg = resp && resp.message ? resp.message : '已刪除（停用）商品';
    showToast(msg);
    await fetchMenuItems();
  } catch (err) {
    console.error(err);
    showToast(err.message || '刪除失敗', 'danger');
  }
}

async function handleRefresh(event) {
  await fetchMenuItems();
  event.target.complete();
}

onMounted(() => {
  fetchMenuItems();
});
</script>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

/* 讓「只顯示啟用商品」文字橫向顯示，不要因為寬度太窄而變成一行一字 */
.toolbar-row ion-item {
  flex: 0 0 auto;
  --inner-padding-end: 0;
}

.toolbar-row ion-label {
  white-space: nowrap;
  margin-right: 8px;
}

.menu-item {
  --min-height: 72px;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

input[type='file'] {
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
