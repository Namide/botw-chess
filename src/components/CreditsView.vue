<script setup lang="ts">

</script>

<template>
    <div>
      <button @click="$emit('goto', 'home')">Return</button><br>
      <button @click="$emit('change')">Set random position</button><br>
      <button @click="$emit('reset')">Use clean position</button>
    </div>
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
