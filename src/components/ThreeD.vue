<script setup lang="ts">
import { ref, watch } from 'vue';
import { ChessScene } from './threeD/ChessScene';


const canvas = ref<HTMLCanvasElement>()
// let chessScene: ChessScene

watch(canvas, canvas => {
  if (canvas) {
    init3D(canvas)
  }
})

function init3D(canvas: HTMLCanvasElement) {
  new ChessScene({ canvas })
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
