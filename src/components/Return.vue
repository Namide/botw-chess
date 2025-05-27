<script setup lang="ts">
</script>

<template>
  <nav class="back">
    <button @click="$emit('goto', 'home')" class="">
      - revenir</button>
  </nav>
</template>

<style scoped lang="scss">
button {
  color: #ffffff;
}
</style>
