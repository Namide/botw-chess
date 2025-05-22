<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

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
        "cameraPosition": {
          "x": -0.23671819399814562,
          "y": 27.23870124654716,
          "z": -0.6149793275019749
        },
        "targetPosition": {
          "x": 0.14991971594490358,
          "y": 0.6304512272090906,
          "z": -0.23384776126681142
        },
        "focus": 26,

        aperture: 0.002,
        maxblur: 0.01,
      }))
      break;
    case 1:
      emits('reset', 'r1bq1rk1/ppp2ppp/2n5/3p4/2P5/2N2P2/P1Q2P1P/R1B2RK1 w - - 0 1')
      emits('camera', JSON.stringify({
        "cameraPosition": {
          "x": 8.06840352691622,
          "y": 2.8642558247383554,
          "z": 8.682547623385442
        },
        "targetPosition": {
          "x": 0.27742608473043306,
          "y": 0.4063302596931356,
          "z": -2.7308367719630935
        },
        "focus": 6.2,
        aperture: 0.005,
        maxblur: 0.015,
      }))
      break;
    case 2:
      emits('reset', '8/8/8/p1k2K1R/5P1P/8/4p1n1/8 w - - 0 1')
      emits('camera', JSON.stringify({
        "cameraPosition": {
          "x": -5.665308634932254,
          "y": 0.6196636201126262,
          "z": -10.790441302958325
        },
        "targetPosition": {
          "x": 0.4009658637940291,
          "y": 3.0373653207777243,
          "z": 0.1274042016700795
        },
        "focus": 8,
        aperture: 0.005,
        maxblur: 0.02,
      }))
      break;
  }
}, { immediate: true })
</script>

<template>
  <article>
    <div>
      <button @click="$emit('goto', 'home')">Return</button><br><br>
      <button @click="newsID--" :disabled="newsID < 1">Actu précédente</button><br>
      <button @click="newsID++" :disabled="newsID > 1">Actu suivante</button>
    </div>

    <div class="news-container">
      <Transition name="news" mode="out-in">
        <section v-if="newsID === 0" class="news-1">
          <h2>Tokyo, le 21 mai 2025</h2>
          <p>Nous continuons de faire parler de nous dans le monde des échecs en ligne ! C'est cette fois notre champion
            H4ker35 qui remporte le tournoi de bullet "Champions Chess Tour" au Japon en imposant une variante peu
            commune
            de la défense sicilienne.</p>
        </section>
        <section v-else-if="newsID === 1" class="news-2">
          <h2>Séoul, le 10 avril 2025</h2>
          <p>Après une série de victoires impressionnantes, notre espoir féminin M0t0k0 a utilisé un clouage pour mettre
            le champion du monde hors course. Ce coup magistral lui octroie l'une des neuf places disponibles pour la
            richement dotée
            Coupe du Monde d'e-sport de cet été !</p>
        </section>
        <section v-else-if="newsID === 2" class="news-3">
          <h2>Online, le 23 mars 2025</h2>
          <p>En demi finale du "Chess LPL split", sur une ouverture classique, H4ker35 a rapidement transformé la partie
            en un jeu tactique complexe pour finalement placer une déviation qui lui permettra de s'imposer !</p>
        </section>
      </Transition>
    </div>
  </article>
</template>

<style scoped lang="scss">
article {
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
}

.news-container {
  width: 75%;
  perspective: 1000px;
  perspective-origin: center center;
}

section {
  padding: 2rem;
  box-sizing: border-box;
  line-height: 1.6;
  max-width: 720px;
  margin: 0 auto;
  background-color: #00000050;
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  border: 2px solid #FFFFFF10;

  transform-origin: center center;
  transform-style: preserve-3d;
}

h2 {
  font-size: 2.4rem;
  margin: 0;
}

p {
  margin: 0;
}

.news-1 {
  margin: 0 0 0 auto;
  transform: translateY(75%) rotate3d(0.5, -1, 0, 15deg);
}

.news-2 {
  margin: 0 0 0 auto;
  transform: translateY(-100%) rotate3d(-0.5, -1, 0, 15deg);
}

.news-3 {
  margin: 0 auto 0 0;
  transform: translateY(100%) rotate3d(1, 1, 0, 15deg);
}

.news-enter-from,
.news-leave-to {
  // opacity: 0
}

.news-enter-from {
  // line-height: 1.8;
  transform: translateX(-200%) translateZ(500px) rotate3d(0, 1, 0, 90deg);
}

.news-leave-to {
  // line-height: 1.8;
  transform: translateX(200%) translateZ(500px) rotate3d(0, 1, 0, 90deg);
}

/* .news-enter,
.news-leave { opacity: 1 } */

.news-enter-active {
  transition: opacity 0.75s linear, transform 0.75s cubic-bezier(.03,.11,.11,.99), line-height 0.75s ease-out;
}

.news-leave-active {
  transition: opacity 0.75s linear, transform 0.75s cubic-bezier(.81,0,.58,.99), line-height 0.75s ease-in;
}
</style>
7