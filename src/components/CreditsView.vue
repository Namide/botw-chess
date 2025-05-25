<script setup lang="ts">
import GlassBox from './GlassBox.vue';
import Return from './Return.vue';

</script>

<template>
  <article>
    <Return @goto="$emit('goto', $event)"></Return>

    <GlassBox :data="{ title: 'crédits' }" class="section">
      <ul>
        <li>Design: <a href="https://super8studio.eu/" target="_blank">Super8Studio</a></li>
        <li>Dev: <a href="https://damien-doussaud.com/" target="_blank">Damien Doussaud</a></li>
        <li class="secondary">Contexte: <a href="https://briefweek.fr/" target="_blank">BOTW</a></li>
        <li class="secondary">Moteurs d'échecs: Stockfish</li>
        <li class="secondary">Logiciel 3D: Blender</li>
        <li class="secondary">Moteur de rendu: Three.js</li>
        <li class="secondary">Matériaux: polycount</li>
        <li class="secondary">Inspiration: Louis Berger</li>
      </ul>
    </GlassBox>
  </article>
</template>

<style scoped>
article {
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
  flex: 1;
  margin: 0 auto 15vh;
}

.section {
  margin: auto;
}

ul {
  text-align: left;
}

.secondary {
  opacity: 0.65;
}
</style>
