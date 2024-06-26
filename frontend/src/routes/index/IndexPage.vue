<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { appRoutes } from '@/main';

import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';
import CardComponent from '@/components/design-system/containers/CardComponent.vue';
import StackComponent from '../../components/design-system/layout/StackComponent.vue';
import BodyText from '../../components/design-system/typography/BodyText.vue';
import ButtonComponent from '../../components/design-system/input/ButtonComponent.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';
import HeadlineText from '@/components/design-system/typography/HeadlineText.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import { mdiArrowDown, mdiArrowRight } from '@mdi/js';
import InfoBubble from '@/components/InfoBubble.vue';
import FooterMultiWord from '@/components/FooterMultiWord.vue';
import DonateBlock from '@/components/DonateBlock.vue';
import StaticContentLayout from '@/components/layouts/StaticContentLayout.vue';
import MasonryGrid from '@/components/design-system/layout/MasonryGrid.vue';
import NavigationBar from '@/components/design-system/navigation/NavigationBar.vue';
import BlobComponent from '@/components/design-system/style/BlobComponent.vue';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const user = computed(() => userStore.user);
const info = ref<HTMLElement | null>(null);
const scrollDown = () => info.value?.scrollIntoView({ behavior: 'smooth' });
</script>

<template>
  <StickyHeaderLayout>
    <template #header>
      <NavigationBar transparent with-account :user="user" />
    </template>
    <div class="prezident-hero">
      <BlobComponent color="blue" class="blob1" />
      <BlobComponent color="red" class="blob2" />
      <StackComponent spacing="medium" centered class="calc-main">
        <HeadlineText tag="p" size="small">
          Archiv volebních kalkulaček
        </HeadlineText>
        <StackComponent class="section" spacing="large" centered>
          <ButtonComponent kind="link" href="https://www.volebnikalkulacka.cz">
            <div class="button-content">
              Kalkulačka pro Evropské volby<IconComponent
                :icon="mdiArrowRight"
              ></IconComponent>
            </div>
          </ButtonComponent>
        </StackComponent>
      </StackComponent>
    </div>
    <StaticContentLayout>
      <StackComponent spacing="large">
        <div ref="info"></div>
        <TitleText size="large" tag="h2">
          Volební kalkulačky k už proběhlým volbám
        </TitleText>
        <MasonryGrid style="align-self: stretch">
          <CardComponent corner="top-right" padding="medium" border shadow>
            <div class="card-content">
              <div class="card-content-text">
                <TitleText tag="h3" size="medium"
                  >Prezidentské volby 2023</TitleText
                >
                <BodyText size="medium"
                  >Volby prezidenta České republiky 2023, 42 otázek, cca 10
                  minut</BodyText
                >
              </div>
              <ButtonComponent
                kind="filled"
                color="primary"
                tag="a"
                @click="
                  router.push({
                    name: appRoutes.guide.name,
                    params: {
                      ...route.params,
                      election: 'prezidentske-2023',
                      district: 'pro-kazdeho',
                    },
                    query: { ...route.query },
                  })
                "
              >
                Spustit kalkulačku pro 1. kolo
                <template #iconAfter>
                  <IconComponent :icon="mdiArrowRight" />
                </template>
              </ButtonComponent>
            </div>
          </CardComponent>
          <CardComponent corner="top-right" padding="medium" border shadow>
            <div class="card-content">
              <div class="card-content-text">
                <TitleText tag="h3" size="medium"
                  >Prezidentské volby 2023: 2. kolo</TitleText
                >
                <BodyText size="medium"
                  >Volební kalkulačka pro 2. kolo, 20 otázek, cca 5
                  minut</BodyText
                >
              </div>
              <ButtonComponent
                kind="outlined"
                color="primary"
                tag="a"
                @click="
                  router.push({
                    name: appRoutes.guide.name,
                    params: {
                      ...route.params,
                      election: 'prezidentske-2023',
                      district: 'pro-kazdeho-2-kolo',
                    },
                    query: { ...route.query },
                  })
                "
              >
                Spustit kalkulačku
                <template #iconAfter>
                  <IconComponent :icon="mdiArrowRight" />
                </template>
              </ButtonComponent>
            </div>
          </CardComponent>
          <CardComponent corner="top-right" padding="medium" border shadow>
            <div class="card-content">
              <div class="card-content-text">
                <TitleText tag="h3" size="medium"
                  >Prezidentské volby 2023: pro nadšence</TitleText
                >
                <BodyText size="medium"
                  >Všech 98 otázek, které jsme položili prezidentským
                  kandidátům.
                </BodyText>
              </div>
              <ButtonComponent
                kind="outlined"
                color="primary"
                tag="a"
                @click="
                  router.push({
                    name: appRoutes.guide.name,
                    params: {
                      ...route.params,
                      election: 'prezidentske-2023',
                      district: 'pro-nadsence',
                    },
                    query: { ...route.query },
                  })
                "
              >
                Spustit kalkulačku
                <template #iconAfter>
                  <IconComponent :icon="mdiArrowRight" />
                </template>
              </ButtonComponent>
            </div>
          </CardComponent>
          <CardComponent corner="top-right" padding="medium" border shadow>
            <div class="card-content">
              <div class="card-content-text">
                <TitleText tag="h3" size="medium"
                  >Prezidentské volby 2023: pro mladé</TitleText
                >
                <BodyText size="medium"
                  >Otázky, které rezonují mladou generací.<br />
                  Ve spolupráci s projektem
                  <a href="https://www.nazorypolitiku.cz" target="_blank">
                    NázoryPolitiků.cz </a
                  >.</BodyText
                >
              </div>
              <ButtonComponent
                kind="outlined"
                color="primary"
                tag="a"
                @click="
                  router.push({
                    name: appRoutes.guide.name,
                    params: {
                      ...route.params,
                      election: 'prezidentske-2023',
                      district: 'pro-mlade',
                    },
                    query: { ...route.query },
                  })
                "
              >
                Spustit kalkulačku
                <template #iconAfter>
                  <IconComponent :icon="mdiArrowRight" />
                </template>
              </ButtonComponent>
            </div>
          </CardComponent>
          <CardComponent corner="top-right" padding="medium" border shadow>
            <div class="card-content">
              <div class="card-content-text">
                <TitleText tag="h3" size="medium"
                  >Komunální volby 2022</TitleText
                >
                <BodyText size="medium"
                  >K dispozici jsou kalkulačky pro vybraná města.</BodyText
                >
                <div class="divider" />
                <BodyText size="small"
                  >Komunální kalkulačku vyplnilo přes 100 tisíc lidí.</BodyText
                >
              </div>
              <ButtonComponent
                kind="filled"
                color="primary"
                @click="
                  router.push({
                    name: appRoutes.districtSelection.name,
                    params: { ...route.params, election: 'komunalni-2022' },
                    query: { ...route.query },
                  })
                "
                >Spustit kalkulačku</ButtonComponent
              >
            </div>
          </CardComponent>
          <CardComponent corner="top-left" padding="medium" border shadow>
            <div class="card-content">
              <div class="card-content-text">
                <TitleText tag="h3" size="medium">Senátní volby 2022</TitleText>
                <BodyText size="medium"
                  >Pro jednotlivé volební obvody.</BodyText
                >
                <BodyText size="medium"
                  ><a
                    href="https://2022.programydovoleb.cz/senatni-volby#kde-se-letos-voli"
                    >Více o senátních obvodech</a
                  ></BodyText
                >
              </div>
              <div class="divider" />
              <BodyText size="small"
                >Senátní kalkulačku vyplnilo přes 25 tisíc lidí.</BodyText
              >
              <ButtonComponent
                color="primary"
                kind="filled"
                @click="
                  router.push({
                    name: appRoutes.districtSelection.name,
                    params: { ...route.params, election: 'senatni-2022' },
                    query: { ...route.query },
                  })
                "
                >Spustit kalkulačku</ButtonComponent
              >
            </div>
          </CardComponent>
        </MasonryGrid>
      </StackComponent>
      <DonateBlock />
    </StaticContentLayout>
    <FooterMultiWord class="section" />
  </StickyHeaderLayout>
</template>

<style scoped lang="scss">
.prezident-hero {
  box-sizing: border-box;
  position: relative;
  max-width: 100%;
  display: grid;
  column-gap: 24px;
  overflow: hidden;
  padding-top: 7%;

  .calc-main {
    text-align: center;
    padding: 24px;
  }

  .other-calcs {
    width: 100%;
    padding: 24px;
    text-align: center;
    display: grid;
    gap: 24px;
  }

  .other-calcs > * {
    width: 100%;
    padding: 16px;
    display: grid;
  }

  .blob1 {
    position: absolute;
    left: 10%;
  }

  .blob2 {
    position: absolute;
    right: 10%;
    top: 10%;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));

    .calc-main {
      grid-row: 1/6;
      grid-column: 4/10;
      margin-bottom: 16px;
    }

    .other-calcs {
      grid-row: 6;
      grid-column: 2/12;
      grid-template-columns: 1fr 1fr;
      padding: 0;
    }
  }

  @media (min-width: 992px) {
    .other-calcs {
      grid-column: 3/11;
    }
  }

  @media (min-width: 1200px) {
    .other-calcs {
      grid-column: 4/10;
    }
  }
}

.section-header {
  display: grid;
  grid-template-columns: 1.2fr repeat(1, 1fr);
  grid-template-rows: 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 16px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.section {
  padding: 40px 0;
}

.wrapper {
  display: grid;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-large);
}

.card {
  max-width: 60rem;
}

.card-election {
  width: 100%;
  max-width: 600px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-content-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.divider {
  width: 100%;
  height: 2px;
  background-color: rgb(var(--color-neutral-bg));
}

.button-content {
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.info-bubbles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr;
  grid-column-gap: 32px;
  grid-row-gap: 32px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }

  @media (max-width: 478px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }
}

.navigation-bar {
  .grid {
    display: grid;
    align-items: center;
    grid-template-columns: auto auto 1fr;

    @media (max-width: 700px) {
      grid-template-columns: 1fr auto 1fr;
    }

    .title {
      justify-self: center;
      margin-left: var(--spacing-medium);
      margin-right: var(--spacing-medium);
    }

    .right {
      justify-content: end;
    }
  }
}
</style>
