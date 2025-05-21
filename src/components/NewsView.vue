<script setup lang="ts">
import { ref, watch } from 'vue';

const newsID = ref(0)
const emits = defineEmits<{
  (e: 'goto', page: string): void
  (e: 'reset', position: string): void
}>()

watch(newsID, (id) => {
  switch (id) {
    case 0:
      emits('reset', '4k3/p1p2r1p/1p4p1/n2p4/P2P1P1P/2PB2P1/6K1/R7 w - - 0 27')
      break;
    case 1:
      emits('reset', 'r1bq1rk1/ppp2ppp/2n5/3p4/2P5/2N2P2/P1Q2P1P/R1B2RK1 w - - 0 1')
      break;
    case 2:
      emits('reset', '8/8/8/p1k2K1R/5P1P/8/4p1n1/8 w - - 0 1')
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

    <Transition name="news" mode="out-in">
      <section v-if="newsID === 0">
        <h2>Tokyo, le 21 mai 2025</h2>
        <p>Nous continuons de faire parler de nous dans le monde des échecs en ligne ! C'est cette fois notre champion
          H4ker35 qui remporte le tournoi de bullet "Champions Chess Tour" au Japon en imposant une variante peu commune
          de la défense sicilienne.</p>
      </section>
      <section v-else-if="newsID === 1">
        <h2>Séoul, le 10 avril 2025</h2>
        <p>Après une série de victoires impressionnantes, notre espoir féminin M0t0k0 a utilisé un clouage pour mettre le champion du monde hors course. Ce coup magistral lui octroie l'une des neuf places disponibles pour la richement dotée
          Coupe du Monde d'e-sport de cet été !</p>
      </section>
      <section v-else-if="newsID === 2">
        <h2>Online, le 23 mars 2025</h2>
        <p>En demi finale du "Chess LPL split", sur une ouverture classique, H4ker35 a rapidement transformé la partie
          en un jeu tactique complexe pour finalement placer une déviation qui lui permettra de s'imposer !</p>
      </section>
    </Transition>
  </article>
</template>

<style scoped>
article {
  display: flex;
}

section {
  position: absolute;
  top: 50%;
  left: 60%;
  width: 75%;
  padding: 5rem;
  box-sizing: border-box;
  transform: translateX(-50%) translateY(-50%);
  line-height: 1.6;
}

.news-enter-from,
.news-leave-to {
  opacity: 0
}

.news-enter-from {
  line-height: 1.8;
  transform: translateX(-50%) translateY(-70%);
}

.news-leave-to {
  line-height: 1.8;
  transform: translateX(-50%) translateY(-30%);
}

/* .news-enter,
.news-leave { opacity: 1 } */

.news-enter-active {
  transition: opacity 0.5s linear, transform 0.5s ease-out, line-height 0.5s ease-out;
}

.news-leave-active {
  transition: opacity 0.5s linear, transform 0.5s ease-in, line-height 0.5s ease-in;
}
</style>
