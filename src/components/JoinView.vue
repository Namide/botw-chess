<script setup lang="ts">

</script>

<template>
  <article>
    <button @click="$emit('goto', 'home')">Return</button><br>
    <button @click="$emit('change')">Set random position</button><br>
    <button @click="$emit('reset')">Use clean position</button>
  </article>
</template>

<style scoped>
button {
  pointer-events: initial;
  cursor: pointer;
}
</style>
