<script setup lang="ts">
</script>

<template>
  <nav>
    <button @click="$emit('goto', 'news')" class="link"><span>-</span> nos actus <span>-</span></button>
    <button @click="$emit('goto', 'join')" class="link"><span>-</span> nous rejoindre <span>-</span></button>
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
  padding-bottom: 15vh;
}

button {
  font-size: var(--font-size-nav);
  color: #ffffff;
  opacity: 0.9;
  text-shadow: 0 0 8px #ffffffb0;

  span {
    display: inline-block;
    transition: transform 0.5s ease-in-out, opacity 0.25s linear;
    opacity: 0.5;

    &:first-child {
      transform-origin: right;
    }

    &:last-child {
      transform-origin: left;
    }
  }

  &:hover {
    span {
      transform: scaleX(2);
      opacity: 1;
    }
  }
}
</style>
