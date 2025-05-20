<script setup lang="ts">
import { ref, watch } from 'vue';
import { ChessScene } from './threeD/ChessScene';

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

function init3D(canvas: HTMLCanvasElement) {
  chessScene = new ChessScene({ canvas })
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
