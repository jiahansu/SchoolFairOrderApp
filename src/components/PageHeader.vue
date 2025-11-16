<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="end">
        <ion-button fill="clear" @click="goHome" aria-label="回首頁">
          <ion-icon :icon="homeOutline" slot="icon-only" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { homeOutline } from 'ionicons/icons';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const router = useRouter();

function goHome() {
  router.push({ name: 'Home' });
}
</script>

<style scoped>
/* 可依需求在這裡客製化 header 樣式 */
</style>
