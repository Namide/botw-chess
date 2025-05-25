<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import GlassBox from './GlassBox.vue';
import Return from './Return.vue';

const newsID = ref(-1)
const emits = defineEmits<{
  (e: 'goto', page: "home" | "news" | "join"): void
  (e: 'camera', page: string): void
  (e: 'reset', position: string): void
}>()

onMounted(() => {
  newsID.value = 0
})

watch(newsID, (id) => {
  switch (id) {
    case 0:
      emits('reset', '4k3/p1p2r1p/1p4p1/n2p4/P2P1P1P/2PB2P1/6K1/R7 w - - 0 27')
      emits('camera', JSON.stringify({
        cameraPosition: {
          x: -10.24078653745133,
          y: 8.277409392949957,
          z: 21.50995047352488
        },
        targetPosition: {
          x: 0.14991971594490358,
          y: 0.6304512272090906,
          z: -0.23384776126681142
        },
        focus: 26,
        aperture: 0.002,
        maxblur: 0.01
      }))
      break;
    case 1:
      emits('reset', 'r1bq1rk1/ppp2ppp/2n5/3p4/2P5/2N2P2/P1Q2P1P/R1B2RK1 w - - 0 1')
      emits('camera', JSON.stringify({
        cameraPosition: {
          x: -13.14870679347731,
          y: 6.167148079306834,
          z: 8.076461693988021
        },
        targetPosition: {
          x: -6.447004698964101,
          y: 2.64007541382193,
          z: 3.502688132330433
        },
        focus: 6.199999999999999,
        aperture: 0.005,
        maxblur: 0.015
      }))
      break;
    case 2:
      emits('reset', '8/8/8/p1k2K1R/5P1P/8/4p1n1/8 w - - 0 1')
      emits('camera', JSON.stringify({
        cameraPosition: {
          x: 7.204379846391173,
          y: 1.539454023442698,
          z: -12.805862563155463
        },
        targetPosition: {
          x: -0.3881122019310443,
          y: 2.5811897358202986,
          z: -2.6511547043745503
        },
        focus: 8,
        aperture: 0.005,
        maxblur: 0.02
      }))
      break;
  }
}, { immediate: true })
</script>

<template>
  <article>
    <Return @goto="$emit('goto', $event)"></Return>

    <div class="news-container">
      <Transition name="news" mode="out-in">
        <GlassBox v-if="newsID === 0" :data="{ title: 'Tokyo, 21 mai 2025' }" class="news-1">
          <p>Nous continuons de faire parler de nous dans le monde des échecs en ligne ! C'est cette fois notre champion
            H4ker35 qui remporte le tournoi de bullet "Champions Chess Tour" au Japon en imposant une variante peu
            commune
            de la défense sicilienne.</p>
        </GlassBox>
        <GlassBox v-else-if="newsID === 1" :data="{ title: 'Séoul, 10 avril 2025' }" class="news-2">
          <p>Après une série de victoires impressionnantes, notre espoir féminin M0t0k0 a utilisé un clouage pour mettre
            le champion du monde hors course. Ce coup magistral lui octroie l'une des neuf places disponibles pour la
            richement dotée Coupe du Monde de cet été !</p>
        </GlassBox>
        <GlassBox v-else-if="newsID === 2" :data="{ title: 'Online, 23 mars 2025' }" class="news-3">
          <p>En demi finale du "Chess LPL split", sur une ouverture classique, H4ker35 a rapidement transformé la partie
            en un jeu tactique complexe pour finalement placer une déviation qui lui permettra de s'imposer !</p>
        </GlassBox>
      </Transition>
    </div>

    <div class="nav">
      <button @click="newsID--" :disabled="newsID < 1" class="cta link">- actu précédente</button>
      <button @click="newsID++" :disabled="newsID > 1" class="cta link">actu suivante -</button>
    </div>
  </article>
</template>

<style scoped lang="scss">
article {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-container {
  --prespective: 1000px;

  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  perspective: var(--prespective);
  perspective-origin: center center;
}

.news-1 {
  margin: auto 4rem auto auto;
  transform: rotate3d(-0.5, -1, 0, 15deg);
}

.news-2 {
  margin: 4rem auto auto 4rem;
  transform: rotate3d(-0.5, 1, 0, 15deg);
}

.news-3 {
  margin: auto auto 4rem 4rem;
  transform: rotate3d(1, 1, 0, 15deg);
}

button:disabled {
  opacity: 0.25;
  pointer-events: none;
}

.news-enter-from {
  transform: translateX(-100vw) translateZ(500px) rotate3d(0, 1, 0, 90deg);
}

.news-leave-to {
  transform: translateX(100vw) translateZ(500px) rotate3d(0, 1, 0, 45deg);
}

.news-enter-active {
  transition: opacity 0.75s linear, transform 0.75s cubic-bezier(.03, .11, .11, .99), line-height 0.75s ease-out;
}

.news-leave-active {
  transition: opacity 0.75s linear, transform 0.75s cubic-bezier(.81, 0, .58, .99), line-height 0.75s ease-in;
}
</style>
7