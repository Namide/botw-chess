<script setup lang="ts">
</script>

<template>
  <article>
    <button @click="$emit('goto', 'news')">Nos actus</button><br>
    <button @click="$emit('goto', 'join')">Nous rejoindre</button><br>
    <button @click="$emit('goto', 'credits')">Crédits</button>
  </article>
</template>

<style scoped>
button {
  pointer-events: initial;
  cursor: pointer;
}
</style>
