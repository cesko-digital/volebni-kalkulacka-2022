<script setup lang="ts">
import { computed } from 'vue';

import { UserAnswerEnum, type UserAnswer } from '@/stores/electionStore';

import BodyText from '@/components/design-system/typography/BodyText.vue';
import BottomBar from '@/components/design-system/navigation/BottomBar.vue';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';

import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';

import {
  vkiLogoInFavour,
  vkiLogoAgainst,
  vkiStarOutlined,
  vkiStarFilled,
} from '@/components/design-system/icons';

import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const props = defineProps<{
  answer: UserAnswer;
  starClick: () => void;
  yesClick: () => void;
  noClick: () => void;
  skipClick: () => void;
}>();

const starColor = computed(() =>
  props.answer.flag ? 'rgba(var(--palette-yellow))' : undefined,
);
const starIcon = computed(() =>
  props.answer.flag ? vkiStarFilled : vkiStarOutlined,
);
</script>

<template>
  <BottomBar class="bottom-bar">
    <div class="grid">
      <!-- <ResponsiveWrapper large extra-large huge>
        <StackComponent
          horizontal
          centered
          class="important"
          @click="starClick"
        >
          <IconButton>
            <IconComponent
              :icon="starIcon"
              :color="starColor"
              size="large"
              title="Pro mě důležité"
            />
          </IconButton>
          <BodyText class="star-text" size="medium">{{
            $t('routes.question.QuestionBottomBar.important-for-me')
          }}</BodyText>
        </StackComponent>
      </ResponsiveWrapper> -->
      <!-- <ResponsiveWrapper extra-small small medium>
        <IconButton class="important">
          <IconComponent
            :icon="starIcon"
            :color="starColor"
            size="large"
            :title="$t('routes.question.QuestionBottomBar.important-for-me')"
            @click="starClick"
          />
        </IconButton>
      </ResponsiveWrapper> -->
      <ResponsiveWrapper small medium large extra-large huge>
        <ButtonComponent
          class="in-favour"
          kind="answer"
          color="primary"
          :selected="answer.answer === UserAnswerEnum.yes"
          @click="yesClick"
        >
          <template #icon>
            <IconComponent :icon="vkiLogoInFavour" />
          </template>
          {{ $t('routes.question.QuestionBottomBar.yes') }}
        </ButtonComponent>
        <ButtonComponent
          class="against"
          kind="answer"
          color="secondary"
          :selected="answer.answer === UserAnswerEnum.no"
          @click="noClick"
        >
          <template #icon>
            <IconComponent :icon="vkiLogoAgainst" />
          </template>
          {{ $t('routes.question.QuestionBottomBar.no') }}
        </ButtonComponent>
      </ResponsiveWrapper>
      <ResponsiveWrapper extra-small>
        <ButtonComponent
          class="in-favour"
          kind="answer"
          color="primary"
          :selected="answer.answer === UserAnswerEnum.yes"
          @click="yesClick"
        >
          <template #icon>
            <IconComponent :icon="vkiLogoInFavour" />
          </template>
        </ButtonComponent>
        <ButtonComponent
          class="against"
          kind="answer"
          color="secondary"
          :selected="answer.answer === UserAnswerEnum.no"
          @click="noClick"
        >
          <template #icon>
            <IconComponent :icon="vkiLogoAgainst" />
          </template>
        </ButtonComponent>
      </ResponsiveWrapper>
    </div>
  </BottomBar>
</template>

<style lang="scss" scoped>
@import '@/assets/breakpoints.scss';

.bottom-bar {
  display: flex;
  justify-content: center;
}

.grid {
  display: grid;
  width: clamp(32rem, 50vw, 48rem);
  grid-template-columns: auto 1fr 1fr;
  grid-template-areas: 'important in-favour against';
  align-items: center;
  justify-content: center;
  gap: var(--responsive-gap-medium);
}

.important {
  grid-area: important;
  justify-self: start;
  margin-right: var(--responsive-optional-gap-large);

  &:hover {
    cursor: pointer;

    .icon-button {
      background: rgba(var(--color-neutral-bg-backdrop-hover));
    }
  }
}

.in-favour {
  grid-area: in-favour;
  justify-self: stretch;
}

.against {
  grid-area: against;
  justify-self: stretch;
}

@media (max-width: calc($breakpoint-large - 1px)) {
  .grid {
    // width: auto;
  }
}

@media (max-width: calc($breakpoint-extra-small - 1px)) {
  .grid {
    width: 100%;
    grid-template-columns: min-content 1fr 1fr;
  }

  .in-favour,
  .against {
    justify-self: stretch;
  }
}
</style>
