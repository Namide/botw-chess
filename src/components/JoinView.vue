<script setup lang="ts">

</script>

<template>
  <article>
    <button @click="$emit('goto', 'home')">Return</button><br>
    <button @click="$emit('change')">Set random position</button>
  </article>
</template>

<style scoped></style>
