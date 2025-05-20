<script setup lang="ts">
</script>

<template>
  <main>
    <h1>Échecs</h1>
    <button @click="$emit('change')">Set random position</button>
  </main>
</template>

<style scoped>
main {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  padding: 5rem;
  box-sizing: border-box;
  pointer-events: none;
}

button {
  pointer-events: initial;
  cursor: pointer;
}
</style>
