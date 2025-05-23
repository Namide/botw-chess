<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import GlassBox from './GlassBox.vue';

const props = defineProps<{
  data?: {
    title: string,
    message: string,
    cta: string,
  }
}>()

const key = computed(() => JSON.stringify(props.data))
const style = ref<any>({})

watch(key, () => {
  style.value = {
    transform: `translateY(-50%) rotate3d(${Math.random() * 2 - 1}, ${Math.random() * 2 - 1}, 0, 7deg)`
  }
}, { immediate: true })
</script>

<template>
  <Transition name="modal" :key="key" :duration="750">
    <aside v-if="key">
      <div class="bg"></div>
      <GlassBox :data="data" :style="style" @action="$emit('close')"></GlassBox>
    </aside>
  </Transition>
</template>

<style scoped lang="scss">
aside {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  display: flex;
  justify-content: center;
  align-items: center;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000C0;
  pointer-events: all;
}

.modal-enter-from .bg,
.modal-leave-to .bg,
.modal-enter-from section,
.modal-leave-to section {
  opacity: 0;
}

/* .modal-enter,
.modal-leave { opacity: 1 } */

.modal-enter-active .bg,
.modal-leave-active .bg,
.modal-leave-active section,
.modal-leave-active section {
  transition: opacity 0.75s, transform 0.75s;
}
</style>
