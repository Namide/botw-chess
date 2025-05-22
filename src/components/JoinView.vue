<script setup lang="ts">
import { onUnmounted } from 'vue';
import { PlayChess } from './threeD/PlayChess';

const playChess = new PlayChess()


onUnmounted(() => {
  playChess.dispose()
})
</script>

<template>
  <article>
    <button @click="$emit('goto', 'home')">Return</button><br>
    <button @click="$emit('change')">Set random position</button>
  </article>
</template>

<style scoped></style>
