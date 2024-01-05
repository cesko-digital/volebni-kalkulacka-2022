<script setup lang="ts">
import { ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiCloseCircleOutline, mdiArrowLeft, mdiArrowRight } from '@mdi/js';

import { appRoutes } from '@/main';
import { useElectionStore, UserAnswerEnum } from '@/stores/electionStore';

import type { DeprecatedElection } from '@/types/election';
import type { DeprecatedQuestion } from '@/types/question';

import BackgroundComponent from '@/components/design-system/style/BackgroundComponent.vue';
import BodyText from '@/components/design-system/typography/BodyText.vue';
import BottomBar from '@/components/design-system/navigation/BottomBar.vue';
import BottomBarWrapper from '@/components/design-system/layout/BottomBarWrapper.vue';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import NavigationBar from '@/components/design-system/navigation/NavigationBar.vue';
import SecondaryNavigationBar from '@/components/design-system/navigation/SecondaryNavigationBar.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';

import { vkiLogoPercent } from '@/components/design-system/icons';

import EmbedWrapper from '@/components/utilities/embedding/EmbedWrapper.vue';
import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';
import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';

import RecapQuestionCard from './RecapQuestionCard.vue';
import InfovolbyRecapQuestionCard from './InfovolbyRecapQuestionCard.vue';
import { getDistrictCode } from '@/common/utils';

import { EmbedKey } from '@/components/utilities/embedding/EmbedKey'; // GH: Update

import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const router = useRouter();
const route = useRoute();
const electionStore = useElectionStore();

const currentEmbed = inject(EmbedKey); 

const election = electionStore.election as DeprecatedElection;
const electionName = election.name;
const districtCode = getDistrictCode(route.params.second as string);
const districtName = electionStore.districts.filter(
  (district) => district.district_code === districtCode,
)[0].name;
const showDistrictCode = electionStore.districts.filter(
  (district) => district.district_code === districtCode,
)[0].show_district_code;
const districtNameWithCode = showDistrictCode
  ? `${districtName} (${districtCode})`
  : districtName;

const breadcrumbs = `${electionName} — ${districtNameWithCode}`;

const handlePreviousClick = () => {
  router.push({
    name: appRoutes.question.name,
    params: { ...route.params, nr: 'last' },
    query: { ...route.query },
  });
};

const handleShowResultsClick = () => {
  router.push({
    name: appRoutes.result.name,
    params: { ...route.params },
    query: { ...route.query },
  });
};

const availableTags: Set<string> = new Set(['All']);
const selectedTag = ref('All');
electionStore.calculator?.questions.forEach(
  (q) => q.tags?.forEach((tag) => availableTags.add(tag)),
);

const handleStarClick = (index: number) => {
  electionStore.flipAnswerFlag(index);
};
const handleAnswerClick = (index: number, answer: UserAnswerEnum) => {
  if (electionStore.answers[index].answer === answer) {
    electionStore.setAnswer(index, UserAnswerEnum.skip);
  } else {
    electionStore.setAnswer(index, answer);
  }
};
const isCardHidden = (index: number) => {
  return !(
    selectedTag.value === 'All' ||
    electionStore.calculator?.questions[index].tags?.includes(selectedTag.value)
  );
};
</script>
<template>
  <BackgroundComponent :is-image="false">
    <StickyHeaderLayout>
      <template #header v-if="currentEmbed !== 'infovolby'">
        <NavigationBar >
          <template #title>{{ breadcrumbs }}</template>
          <template #right>
            <EmbedWrapper>
              <ResponsiveWrapper extra-small small>
                <ButtonComponent
                  kind="link"
                  @click="
                    router.push({
                      name: appRoutes.index.name,
                      query: { ...route.query },
                    })
                  "
                >
                  <template #icon>
                    <IconComponent
                      :icon="mdiCloseCircleOutline"
                      :title="$t('routes.recap.RecapPage.back-to-main-page')"
                    />
                  </template>
                </ButtonComponent>
              </ResponsiveWrapper>
              <ResponsiveWrapper medium large extra-large huge>
                <ButtonComponent
                  kind="link"
                  @click="
                    router.push({
                      name: appRoutes.index.name,
                      query: { ...route.query },
                    })
                  "
                >
                  {{ $t('routes.recap.RecapPage.back-to-main-page') }}
                  <template #iconAfter>
                    <IconComponent :icon="mdiCloseCircleOutline" />
                  </template>
                </ButtonComponent>
              </ResponsiveWrapper>
            </EmbedWrapper>
          </template>
        </NavigationBar>
      </template>
      <template #sticky-header>
        <ResponsiveWrapper extra-small small>
          <SecondaryNavigationBar centered-title>
            <template #before>
              <IconButton @click="handlePreviousClick">
                <IconComponent
                  :icon="mdiArrowLeft"
                  :title="$t('routes.recap.RecapPage.questions')"
                />
              </IconButton>
            </template>
            <TitleText tag="h2" size="medium">{{
              $t('routes.recap.RecapPage.recapitulation')
            }}</TitleText>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
        <ResponsiveWrapper medium large extra-large huge>
          <SecondaryNavigationBar v-if="currentEmbed === 'infovolby'" class="recap-header">
            <template #before>
              <!-- <IconButton @click="handlePreviousClick">
                <IconComponent
                  :icon="mdiArrowLeft"
                  :title="$t('routes.recap.RecapPage.questions')"
                />
              </IconButton> -->
              <ButtonComponent kind="link" @click="handlePreviousClick">
                {{ t('routes.question.QuestionPage.previous-question-short') }}
                <template #icon>
                  <IconComponent :icon="mdiArrowLeft" />
                </template>
              </ButtonComponent>
            </template>
            <TitleText tag="h2" size="large" color='white'>{{
              $t('routes.recap.RecapPage.recapitulation')
            }}</TitleText>
            <template #after>
              <!-- <ButtonComponent
                class="desktop"
                kind="filled"
                color="primary"
                @click="handleShowResultsClick"
              >
                <template #icon>
                  <IconComponent :icon="vkiLogoPercent" />
                </template>
                {{ $t('routes.recap.RecapPage.display-results') }}
                <template #iconAfter>
                  <IconComponent :icon="mdiArrowRight" />
                </template>
              </ButtonComponent> -->
            </template>
          </SecondaryNavigationBar>
          <SecondaryNavigationBar v-else>
            <template #before>
              <IconButton @click="handlePreviousClick">
                <IconComponent
                  :icon="mdiArrowLeft"
                  :title="$t('routes.recap.RecapPage.questions')"
                />
              </IconButton>
            </template>
            <TitleText tag="h2" size="large">{{
              $t('routes.recap.RecapPage.recapitulation')
            }}</TitleText>
            <template #after>
              <ButtonComponent
                class="desktop"
                kind="filled"
                color="primary"
                @click="handleShowResultsClick"
              >
                <template #icon>
                  <IconComponent :icon="vkiLogoPercent" />
                </template>
                {{ $t('routes.recap.RecapPage.display-results') }}
                <template #iconAfter>
                  <IconComponent :icon="mdiArrowRight" />
                </template>
              </ButtonComponent>
            </template>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
      </template>
      <BottomBarWrapper>
        <!-- <StackComponent  class="main" spacing="small"> -->
        <div class="bottom-bar-container" v-if="currentEmbed === 'infovolby'">
          <div class="before"></div>
          <div class="main">
            <!-- <BodyText size="small">
              {{ $t('routes.recap.RecapPage.hint-text') }}
            </BodyText> -->
            <StackComponent class="list" spacing="small">
              <InfovolbyRecapQuestionCard
                v-for="i in [...Array(electionStore.questionCount).keys()]"
                :key="i"
                :hidden="isCardHidden(i)"
                :question="
                  electionStore.calculator?.questions[i] as DeprecatedQuestion
                "
                :answer="electionStore.answers[i]"
                :current-question="i + 1"
                :question-count="electionStore.questionCount"
                :star-click="() => handleStarClick(i)"
                :yes-click="() => handleAnswerClick(i, UserAnswerEnum.yes)"
                :no-click="() => handleAnswerClick(i, UserAnswerEnum.no)"
                :skip-click="() => handleAnswerClick(i, UserAnswerEnum.skip)"
              />
            </StackComponent>
          </div>
            <div class="after"></div>
          </div>
        <!-- </StackComponent> -->
        <StackComponent v-else class="main" spacing="small">
          <BodyText size="small">
            {{ $t('routes.recap.RecapPage.hint-text') }}
          </BodyText>
          <StackComponent class="list" spacing="small">
            <RecapQuestionCard
              v-for="i in [...Array(electionStore.questionCount).keys()]"
              :key="i"
              :hidden="isCardHidden(i)"
              :question="
                electionStore.calculator?.questions[i] as DeprecatedQuestion
              "
              :answer="electionStore.answers[i]"
              :current-question="i + 1"
              :question-count="electionStore.questionCount"
              :star-click="() => handleStarClick(i)"
              :yes-click="() => handleAnswerClick(i, UserAnswerEnum.yes)"
              :no-click="() => handleAnswerClick(i, UserAnswerEnum.no)"
              :skip-click="() => handleAnswerClick(i, UserAnswerEnum.skip)"
            />
          </StackComponent>
        </StackComponent>
        <template #bottom-bar>
          <ResponsiveWrapper extra-small small>
            <BottomBar>
              <div class="bottom-bar-grid">
                <ButtonComponent
                  kind="filled"
                  color="primary"
                  @click="handleShowResultsClick"
                >
                  Zobrazit výsledky
                  <template #iconAfter>
                    <IconComponent :icon="mdiArrowRight" />
                  </template>
                </ButtonComponent>
              </div>
            </BottomBar>
          </ResponsiveWrapper>
          <ResponsiveWrapper v-if="currentEmbed === 'infovolby'" medium large extra-large>
            <BottomBar>
              <div class="bottom-bar-container">
                <div class="before"></div>
                <div class="main">
                  <div class="wrapper">
                    <ButtonComponent
                      class="desktop"
                      kind="outlined"
                      color="white"
                      @click="handleShowResultsClick"
                    >
                      <template #icon>
                        <IconComponent :icon="vkiLogoPercent" />
                      </template>
                      {{ $t('routes.recap.RecapPage.display-results') }}
                      <template #iconAfter>
                        <IconComponent :icon="mdiArrowRight" />
                      </template>
                    </ButtonComponent>

                  </div>
                </div>
                <div class="after"></div>
              </div>
              <!-- <div class="bottom-bar-grid">
                <ButtonComponent
                  kind="filled"
                  color="primary"
                  @click="handleShowResultsClick"
                >
                  Zobrazit výsledky
                  <template #iconAfter>
                    <IconComponent :icon="mdiArrowRight" />
                  </template>
                </ButtonComponent>
              </div> -->
            </BottomBar>
          </ResponsiveWrapper>
        </template>
      </BottomBarWrapper>
    </StickyHeaderLayout>
  </BackgroundComponent>
</template>

<style lang="scss" scoped>
.main {
  display: grid;
  grid-template-columns: clamp(32rem, 50vw, 48rem);
  justify-content: center;
  padding: var(--spacing-small);
}

/* TODO: update breakpoint */
@media (max-width: 700px) {
  .main {
    grid-template-columns: 1fr;
  }

  .desktop {
    display: none;
  }
}

.list {
  display: grid;
}

.bottom-bar-grid {
  display: grid;
  grid-template-columns: 1fr;
}
</style>
