<script setup lang="ts">
import { computed, ref } from 'vue';
import HomeView from './components/HomeView.vue';
import ThreeD from './components/ThreeD.vue';
import NewsView from './components/NewsView.vue';
import JoinView from './components/JoinView.vue';
import CreditsView from './components/CreditsView.vue';

const sceneId1 = ref(1)
const sceneId2 = ref(1)

const page = ref('home')

const scene1 = computed(() => page.value + sceneId1.value)
</script>

<template>
  <ThreeD :scene-id-1="scene1" :scene-id-2="sceneId2"></ThreeD>
  <main>

    <header>
      <h1>C45 Ch3ss Club</h1>
      <p>La team esport leader du blitz chess online</p>
    </header>

    <Transition name="page" mode="out-in">
      <NewsView v-if="page === 'news'" @goto="page = $event" @change="sceneId1++" @reset="sceneId2++"></NewsView>
      <JoinView v-else-if="page === 'join'" @goto="page = $event" @change="sceneId1++" @reset="sceneId2++"></JoinView>
      <CreditsView v-else-if="page === 'credits'" @goto="page = $event" @change="sceneId1++" @reset="sceneId2++">
      </CreditsView>
      <HomeView v-else @goto="page = $event"></HomeView>
    </Transition>

    <footer>
      crédits Super8Studio & Namide
    </footer>

  </main>
</template>

<style scoped>
main {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5rem;
  box-sizing: border-box;
  pointer-events: none;
}

header {
  position: relative;
}

footer {
  width: 100%;
  position: relative;
  text-align: center;
}

.page-enter-from,
.page-leave-to { opacity: 0 }

/* .page-enter,
.page-leave { opacity: 1 } */

.page-enter-active,
.page-leave-active {
  transition: opacity 0.75s;
}
</style>
