<script setup lang="ts">
import GlassBox from './GlassBox.vue';

</script>

<template>
  <article>

    <button @click="$emit('goto', 'home')">Return</button>

    <GlassBox :data="{ title: 'crédits' }" class="section">
      <ul>
        <li>Design: <a href="https://super8studio.eu/" target="_blank">Super8Studio</a></li>
        <li>Dév: <a href="https://damien-doussaud.com/" target="_blank">Damien Doussaud</a></li>
        <li>Moteurs d'échecs: Stockfish</li>
        <li>Logiciel 3D: Blender</li>
        <li>Moteur de rendu: Three.js</li>
      </ul>
    </GlassBox>

  </article>
</template>

<style scoped>
article {
  display: flex;
  width: 100%;
  align-items: center;
}

section {
  margin: auto;
}

ul {
  text-align: left;
}
</style>
