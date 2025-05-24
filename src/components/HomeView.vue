<script setup lang="ts">
</script>

<template>
  <nav>
    <button @click="$emit('goto', 'news')" class="cta"><span>-</span> nos actus <span>-</span></button>
    <button @click="$emit('goto', 'join')" class="cta"><span>-</span> nous rejoindre <span>-</span></button>
  </nav>
</template>

<style scoped lang="scss">
nav {
  margin: 0 auto auto;
  width: 100%;

  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 5vh;
  padding-bottom: 10vh;
}

button {
  font-size: 2em;
  background: transparent;
  border: none;
  text-shadow: 0 0 8px #fffffff0;

  span {
    opacity: 0.5;
  }

  &:hover span {
    opacity: 1;
  }
}
</style>
