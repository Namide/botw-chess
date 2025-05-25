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
    transform: `rotate3d(${Math.random() * 2 - 1}, ${Math.random() * 2 - 1}, 0, 7deg)`
  }
}, { immediate: true })
</script>

<template>
  <Transition name="modal" >
    <aside v-if="key" >
      <div class="bg"></div>
      <GlassBox :data="data" :style="style" @action="$emit('close')" class="glass-box" :key="key"></GlassBox>
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
  z-index: 2;
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

.glass-box {
  margin-bottom: 10vh;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.75s, transform 0.75s;
}
</style>
