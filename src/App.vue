<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import HomeView from './components/HomeView.vue';
import ThreeD from './components/ThreeD.vue';
import NewsView from './components/NewsView.vue';
import JoinView from './components/JoinView.vue';
import { START_CAMERA, START_POSITIONS } from './conf';

const position = ref<string | undefined>(undefined)
const random = ref(1)
const camera = ref('')

const page = ref<'home' | 'news' | 'join'>('home')

watch(page, page => {
  switch (page) {
    case 'home':
      position.value = START_POSITIONS
      camera.value = JSON.stringify(START_CAMERA)
      break
    // case 'join':
    //   position.value = ''
    //   camera.value = ''
    //   break
  }
})
</script>

<template>
  <ThreeD :position="position" :camera="camera" :random="random"></ThreeD>
  <main>

    <header>
      <h1>C45 Ch3ss Club</h1>
      <p>La team esport leader du blitz chess online</p>
    </header>

    <Transition name="page" mode="out-in">
      <NewsView v-if="page === 'news'" @goto="page = $event" @reset="position = $event" @camera="camera = $event">
      </NewsView>
      <JoinView v-else-if="page === 'join'" @goto="page = $event" @change="random++"></JoinView>
      <HomeView v-else @goto="page = $event"></HomeView>
    </Transition>

    <footer>
      crédits ~ <a href="https://super8studio.eu/" target="_blank">Super8Studio</a> & <a
        href="https://damien-doussaud.com/" target="_blank">Namide</a>
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
.page-leave-to {
  opacity: 0
}

/* .page-enter,
.page-leave { opacity: 1 } */

.page-enter-active,
.page-leave-active {
  transition: opacity 0.75s;
}
</style>
