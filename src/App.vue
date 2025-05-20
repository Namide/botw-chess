<script setup lang="ts">
import { ref } from 'vue';
import HomeView from './components/HomeView.vue';
import ThreeD from './components/ThreeD.vue';

const sceneId = ref(1)
</script>

<template>
  <ThreeD :scene-id="sceneId"></ThreeD>
  <HomeView @change="sceneId++"></HomeView>
</template>

<style scoped>
</style>
