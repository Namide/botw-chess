<script setup lang="ts">
</script>

<template>
  <article>
    <nav class="nav">
      <button @click="$emit('goto', 'news')">nos actus</button>
      <button @click="$emit('goto', 'join')">nous rejoindre</button>
    </nav>
  </article>
</template>

<style scoped>
article {
  margin: 0 auto auto;
  width: 100%;
}
</style>
