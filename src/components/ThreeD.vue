<script setup lang="ts">
import { ref, watch } from 'vue';
import { ChessScene } from './threeD/ChessScene';
import { getGPUTier } from 'detect-gpu';

const props = defineProps<{ position?: string, camera?: string, random?: number }>()

const canvas = ref<HTMLCanvasElement>()
const isReady = ref(false)

let chessScene: ChessScene

watch(canvas, canvas => {
  if (canvas) {
    init3D(canvas)
  } else if (chessScene) {
    chessScene.dispose()
  }
})

watch(() => props.position, (position?: string) => {
  if (chessScene) {
    if (position) {
      chessScene.reset(position)
    } else {
      chessScene.random()
    }
  }
})

watch(() => props.camera, camera => {
  if (chessScene) {
    chessScene.moveCamera(camera ? JSON.parse(camera) : undefined)
  }
})

watch(() => props.random, () => {
  if (chessScene) {
    chessScene.moveCamera()
    chessScene.random()
  }
})

async function init3D(canvas: HTMLCanvasElement) {
  // Get GPU performances
  const gpuTier = await getGPUTier({
    benchmarksURL: `${import.meta.env.BASE_URL}benchmarks`,
  });
  const hq = gpuTier.tier > 2;
  chessScene = new ChessScene({ canvas, hq, onReady: () => isReady.value = true })
}

</script>

<template>
  <canvas ref="canvas" :class="{ 'is-ready': isReady }"></canvas>
</template>

<style scoped>
canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  opacity: 0;
  transition: transform 2s ease-out, opacity 2s linear;
  /* transform: scale(1.1); */
}

.is-ready {
  opacity: 1;
  transform: none;
}
</style>
