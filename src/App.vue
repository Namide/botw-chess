<script setup lang="ts">
import { ref, watch } from 'vue';
import HomeView from './components/HomeView.vue';
import ThreeD from './components/ThreeD.vue';
import NewsView from './components/NewsView.vue';
import JoinView from './components/JoinView.vue';
import { START_CAMERA, START_POSITIONS } from './conf';
import { ChessScene } from './components/threeD/ChessScene';
import CreditsView from './components/CreditsView.vue';

const position = ref<string | undefined>(undefined)
const random = ref(1)
const camera = ref('')

const page = ref<'home' | 'news' | 'join' | 'credits'>('home')

watch(page, page => {
  switch (page) {
    case 'home':
      ChessScene.instance.reset(START_POSITIONS)
      ChessScene.instance.moveCamera(START_CAMERA)
      break
    case 'credits':
      ChessScene.instance.reset('8/3rk2p/3pb1p1/1Np1pp2/2P1P3/5P2/3bBKPP/R7 w - - 7 29')
      ChessScene.instance.moveCamera({
        "cameraPosition": {
          "x": 7.4584726009576725,
          "y": 4.61995805253401,
          "z": 12.92355841605686
        },
        "targetPosition": {
          "x": 0.3597959182553215,
          "y": 2.6903860351731463,
          "z": -2.3103919183359625
        },
        "focus": 17,
        "aperture": 0.002,
        "maxblur": 0.01
      })
      break
    case 'join':
      position.value = ''
      camera.value = ''
      break
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
      <CreditsView v-else-if="page === 'credits'" @goto="page = $event"></CreditsView>
      <HomeView v-else @goto="page = $event"></HomeView>
    </Transition>

    <footer>
      <button @click="page = 'credits'">crédits</button>
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
