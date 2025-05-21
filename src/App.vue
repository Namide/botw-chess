<script setup lang="ts">
import { ref } from 'vue';
import HomeView from './components/HomeView.vue';
import ThreeD from './components/ThreeD.vue';

const sceneId1 = ref(1)
const sceneId2 = ref(1)
</script>

<template>
  <ThreeD :scene-id-1="sceneId1" :scene-id-2="sceneId2"></ThreeD>
  <HomeView @change="sceneId1++" @reset="sceneId2++"></HomeView>
</template>

<style scoped>
</style>
