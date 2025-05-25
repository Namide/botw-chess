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
    <slot>
      <p v-if="data?.message" v-html="data?.message"></p>
    </slot>
    <button v-if="data?.cta" @click="$emit('action')">{{ data?.cta }}</button>
  </section>
</template>

<style scoped lang="scss">
section {
  box-sizing: border-box;
  line-height: 1.6;
  max-width: 720px;
  text-align: center;
  position: relative;
}

section>* {
  --padding: 2rem;
  position: relative;
  padding: 0;
  padding-left: var(--padding);
  padding-right: var(--padding);
  list-style: none;

  &:first-child {
    margin-top: var(--padding);
  }

  &:last-child {
    margin-bottom: var(--padding);
  }
}

section:before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  backdrop-filter: blur(16px);
  background-color: #ffffff10;
  border-radius: 2rem;
  border: 2px solid #FFFFFF10;
}

h2 {
  color: #FFFFFF;
  font-size: var(--font-size-subtitle);
  margin: 0;
  text-wrap: balance
}

p {
  color: #FFFFFF;
  margin: 0;
  opacity: 1;
  text-wrap: balance
}

button {
  position: relative;
  margin-top: 2rem;
  background: #00000070;
  border: 0;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: var(--font-size-link);
}
</style>
