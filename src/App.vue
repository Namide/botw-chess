<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import HomeView from "./components/HomeView.vue";
import ThreeD from "./components/ThreeD.vue";
import NewsView from "./components/NewsView.vue";
import JoinView from "./components/JoinView.vue";
import {
  CREDIT_CAMERA,
  CREDIT_POSITIONS,
  NEWS_1_CAMERA,
  NEWS_1_POSITIONS,
  NEWS_2_CAMERA,
  NEWS_2_POSITIONS,
  NEWS_3_CAMERA,
  NEWS_3_POSITIONS,
  START_CAMERA,
  START_POSITIONS,
} from "./conf";
import { ChessScene } from "./components/threeD/ChessScene";
import CreditsView from "./components/CreditsView.vue";
import { konami } from "./pure/konami";

const position = ref<string | undefined>(undefined);
const random = ref(1);
const camera = ref("");

let intervalId: number;

const page = ref<"home" | "news" | "join" | "credits">("home");
konami(() => {
  const INFOS = [
    [START_POSITIONS, START_CAMERA],
    [CREDIT_POSITIONS, CREDIT_CAMERA],
    [NEWS_1_POSITIONS, NEWS_1_CAMERA],
    [NEWS_2_POSITIONS, NEWS_2_CAMERA],
    [NEWS_3_POSITIONS, NEWS_3_CAMERA],
  ] as const;

  let i = Math.floor(Math.random() * INFOS.length);
  intervalId = setInterval(() => {
    ChessScene.instance.reset(INFOS[i][0]);
    ChessScene.instance.moveCamera(INFOS[i][1]);
    i = (i + 1) % INFOS.length;
  }, 3000);

  document.body.querySelector("main")!.style.display = "none";
});

onUnmounted(() => {
  document.body.querySelector("main")!.style.display = "";
  clearInterval(intervalId);
});

watch(page, (page) => {
  switch (page) {
    case "home":
      ChessScene.instance.reset(START_POSITIONS);
      ChessScene.instance.moveCamera(START_CAMERA);
      break;
    case "credits":
      ChessScene.instance.reset(CREDIT_POSITIONS);
      ChessScene.instance.moveCamera(CREDIT_CAMERA);
      break;
    case "join":
      break;
  }
});
</script>

<template>
  <ThreeD :position="position" :camera="camera" :random="random"></ThreeD>
  <main>
    <header>
      <button @click="page = 'home'"><h1>Ultra Mat</h1></button>
      <p>La team esport du blitz chess</p>
    </header>

    <Transition name="page" mode="out-in">
      <NewsView
        v-if="page === 'news'"
        @goto="page = $event"
        @reset="position = $event"
        @camera="camera = $event"
      >
      </NewsView>
      <JoinView
        v-else-if="page === 'join'"
        @goto="page = $event"
        @change="random++"
      ></JoinView>
      <CreditsView
        v-else-if="page === 'credits'"
        @goto="page = $event"
      ></CreditsView>
      <HomeView v-else @goto="page = $event"></HomeView>
    </Transition>

    <footer>
      <button @click="page = 'credits'">- crédits -</button>
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
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
  pointer-events: none;

  animation: fadein 5s linear 1;
}

@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

header {
  position: relative;
  text-align: center;
  margin-top: 4em;

  button {
    color: #ffffff;
    opacity: 0.9;
  }
}

h1 {
  font-size: var(--font-size-title);
  margin: 0;
  line-height: 1;
  text-shadow: 0 0 8px #fffffff0;
}

p {
  margin: 0;
}

footer {
  width: 100%;
  position: relative;
  text-align: center;
}

button {
  background-color: transparent;
  border: none;
  color: #ffffff;
  opacity: 0.6;
  transition: opacity 0.3s linear;
}

button:hover {
  opacity: 1;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.75s;
}
</style>
