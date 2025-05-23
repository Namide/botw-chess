<script setup lang="ts">
defineProps<{
  data?: {
    title?: string,
    message?: string,
    cta?: string,
  }
}>()
</script>

<template>
  <section>
    <h2 v-if="data?.title">{{ data?.title }}</h2>
    <slot><p v-if="data?.message" v-html="data?.message"></p></slot>
    <button v-if="data?.cta" @click="$emit('action')">{{ data?.cta }}</button>
  </section>
</template>

<style scoped lang="scss">
section {
  box-sizing: border-box;
  line-height: 1.6;
  max-width: 720px;
  margin: auto;
  text-align: center;

  // transform-origin: center center;
  transform-style: preserve-3d;
  perspective: var(--prespective);

  // padding: 2rem;
  // backdrop-filter: blur(16px);
  // background-color: #00000050;
  // border-radius: 2rem;
  // border: 2px solid #FFFFFF10;
}

section:before {
  --padding: 2rem;
  content: "";
  display: block;
  position: absolute;
  top: calc(-1 * var(--padding));
  left: calc(-1 * var(--padding));
  width: calc(100% + 2 * var(--padding));
  height: calc(100% + 2 * var(--padding));

  backdrop-filter: blur(16px);
  background-color: #ffffff10;
  border-radius: 2rem;
  border: 2px solid #FFFFFF10;
}

h2 {
  color: #FFFFFF;
  font-size: 2.4rem;
  margin: 0;
  // transform: translateZ(40px);
  text-wrap: balance
}

p {
  color: #FFFFFF;
  margin: 0;
  opacity: 1;
  // transform: translateZ(20px);
  text-wrap: balance
}

button {
  position: relative;
  margin-top: 2rem;
}
</style>
