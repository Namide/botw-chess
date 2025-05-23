<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { PlayChess } from './threeD/PlayChess';
import Modal from './Modal.vue';

const playChess = new PlayChess()

const modalMessage = ref<{
  title: string,
  message: string,
  cta: string
} | undefined>({

  title: 'Rejoindre notre team',
  message: 'Avant de pouvoir postuler tu dois prouver ton niveau dans une partie de blitz.<br>Et comme on est sympa on te laisse commencer.<br><br>GL HF!',
  cta: 'commencer',
})
const onModalCloseAction = ref<(() => void)>(() => start(false))
const restTime = ref(-1)

watch(restTime, (restTime) => {
  if (restTime === 0) {
    modalMessage.value = {
      title: 'Perdu !',
      message: 'Temps écoulé. Recommence mais soit un peu plus rapide cette fois.',
      cta: 'recommencer',
    }
    onModalCloseAction.value = start
  }
})

const displayTime = computed(() => restTime.value > -1 ? restTime.value : '')

playChess.onIllegalMove = () => {
  modalMessage.value = {
    title: 'C\'est interdit ça !',
    message: 'Concentre toi un peu et rejoue le coup.',
    cta: 'ok',
  }
  onModalCloseAction.value = () => 0
}

playChess.onDraw = () => {
  modalMessage.value = {
    title: 'Égalité !',
    message: 'Pas mal mais ça ne suffit pas.',
    cta: 'recommencer',
  }
  onModalCloseAction.value = start
}

playChess.onLose = () => {
  modalMessage.value = {
    title: 'Perdu !',
    message: 'Il faut un meilleur niveau pour intégrer l\'équipe. Entraine toi dur et reviens nous voir.',
    cta: 'recommencer',
  }
  onModalCloseAction.value = start
}

playChess.onWin = () => {
  modalMessage.value = {
    title: 'Bravo, ça c\'est du beau jeu !',
    message: 'N\'hésite pas à contacter notre coach à l\'adresse <a href="contact:coach@checkmate.fr">coach@checkmate.fr</a>!',
    cta: 'ok',
  }
  onModalCloseAction.value = start
}

playChess.onCheck = () => {
  modalMessage.value = {
    title: 'Échec au roi',
    message: '',
    cta: 'ok',
  }
  onModalCloseAction.value = () => 0
}

onUnmounted(() => {
  playChess.dispose()
})

function start(force=true) {
  if (force) {
    playChess.restart()
  }
  restTime.value = 10 * 60
  updateTime()
}

let to: number
function updateTime() {
  clearTimeout(to)
  to = setTimeout(() => {
    restTime.value -= 1
    updateTime()
  }, 1000)
}

function action() {
  modalMessage.value = undefined;
  onModalCloseAction.value();
}
</script>

<template>
  <article>
    <nav class="back">
      <button @click="$emit('goto', 'home')">
        < revenir </button>
    </nav>
    <div class="time">{{ displayTime }}</div>
    <Modal :data="modalMessage" @close="action"></Modal>
  </article>
</template>

<style scoped>
article {
  width: 100%;
  flex: 1;
}

.time {
  position: fixed;
  top: 2rem;
  right: 2rem;

  font-variant-numeric: tabular-nums lining-nums;
  text-align: left;
  width: 3em;
}
</style>
