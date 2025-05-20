<script setup lang="ts">
import { ref, watch } from 'vue';
import { ChessScene } from './threeD/ChessScene';
import { getGPUTier } from 'detect-gpu';

const props = defineProps<{ sceneId: number }>()

const canvas = ref<HTMLCanvasElement>()
let chessScene: ChessScene

watch(canvas, canvas => {
  if (canvas) {
    init3D(canvas)
  } else if (chessScene) {
    chessScene.dispose()
  }
})

watch(() => props.sceneId, (sceneId) => {
  if (chessScene) {
    chessScene.change(sceneId)
  }
})

async function init3D(canvas: HTMLCanvasElement) {
  // Get GPU performances
  const gpuTier = await getGPUTier();
  const hq = gpuTier.tier > 2;
  chessScene = new ChessScene({ canvas, hq })
}

</script>

<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
