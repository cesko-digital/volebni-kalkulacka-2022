<script setup lang="ts">
import { computed, ref } from 'vue';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';

import { UserAnswerEnum, type UserAnswer } from '@/stores/electionStore';
import type { DeprecatedQuestion } from '@/types/question';

import BodyText from '@/components/design-system/typography/BodyText.vue';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import CardComponent from '@/components/design-system/containers/CardComponent.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import TagComponent from '@/components/design-system/containers/TagComponent.vue';

import {
  vkiLogoInFavour,
  vkiLogoAgainst,
  vkiLogoNeutral,
  vkiStarOutlined,
  vkiStarFilled,
} from '@/components/design-system/icons';

import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';

export interface Props {
  question: DeprecatedQuestion;
  currentQuestion: number;
  questionCount: number;
  answer: UserAnswer;
  starClick: () => void;
  yesClick: () => void;
  noClick: () => void;
  skipClick: () => void;
}
const props = defineProps<Props>();

const starColor = computed(() =>
  props.answer.flag ? 'rgba(var(--palette-yellow))' : 'rgba(239, 72, 128, 1)',
);
const starIcon = computed(() =>
  props.answer.flag ? vkiStarFilled : vkiStarOutlined,
);

const isExpanded = ref(false);
const toggleClick = () => {
    isExpanded.value = !isExpanded.value;
};
// isExpanded.value = true;
</script>

<template>
  <CardComponent
    :class="[
      'recap-question-card',
      isExpanded && 'recap-question-card--expanded',
    ]"
    border
    corner="top-left"
    padding="medium"
  >
    <div class="important">
      <ResponsiveWrapper medium large extra-large huge>
        <!-- <IconButton @click="starClick">
          <IconComponent
            :icon="starIcon"
            :color="starColor"
            size="large"
            ::title="$t('routes.recap.RecapQuestionCard.important-for-me')"
          />
        </IconButton> -->
      </ResponsiveWrapper>
      <ResponsiveWrapper extra-small small>
        <IconButton @click="starClick">
          <IconComponent
            :icon="starIcon"
            :color="starColor"
            size="medium"
            :title="$t('routes.recap.RecapQuestionCard.important-for-me')"
          />
        </IconButton>
      </ResponsiveWrapper>
    </div>
    <div class="details">
      <StackComponent
        centered
        horizontal
        spacing="extra-small"
        spacing-responsive
        style="flex-wrap: wrap; justify-content: space-between;"
      >
        <BodyText size="large" style="margin-bottom: 12px">
          <strong> {{ currentQuestion }}/{{ questionCount }} </strong>
        </BodyText>
        <!-- <BodyText class="desktop" size="small">
          {{ question.name }}
        </BodyText> -->
        <!-- <TagComponent v-for="tag in question.tags" :key="tag">
          {{ tag }}
        </TagComponent> -->
        <div class="edit-btn" style="display: flex;justify-content: center;align-items: center;border: 2px solid #ef4880;padding: 1px 14px;">
          <span class="edit-btn-text">Edit</span>
          <IconButton @click="toggleClick">
              <IconComponent
                :icon="!isExpanded ? mdiChevronUp : mdiChevronDown"
                size="medium"
                :title="$t('routes.recap.RecapQuestionCard.display-details')"
              />
            </IconButton>
        </div>
      </StackComponent>
    </div>
    <StackComponent class="text">
      <BodyText class="desktop" size="medium">
        <strong>{{ question.title }}</strong>
      </BodyText>
      <BodyText class="mobile" size="small">
        {{ question.name }}
      </BodyText>
      <BodyText v-show="isExpanded" class="mobile" size="medium">
        <strong>{{ question.title }}</strong>
      </BodyText>
      <StackComponent class="stack-recap">
        <div class="recap-button-wrapper">
            <!-- v-show="answer.answer === UserAnswerEnum.yes || isExpanded" -->
          <ButtonComponent
            v-show="isExpanded"
            class="in-favour"
            kind="answer"
            color="primary"
            :selected="answer.answer === UserAnswerEnum.yes"
            :read-only="!isExpanded"
            @click="() => (isExpanded ? yesClick() : undefined)"
          >
            <template #icon>
              <IconComponent
                :icon="vkiLogoInFavour"
                :title="
                  isExpanded
                    ? $t('routes.recap.RecapQuestionCard.yes')
                    : undefined
                "
              />
            </template>
            <template v-if="isExpanded" #default>{{
              $t('routes.recap.RecapQuestionCard.yes')
            }}</template>
          </ButtonComponent>
            <!-- v-show="answer.answer === UserAnswerEnum.no || isExpanded" -->
          <ButtonComponent
            v-show="isExpanded"
            class="against"
            kind="answer"
            color="secondary"
            :selected="answer.answer === UserAnswerEnum.no"
            :read-only="!isExpanded"
            @click="() => (isExpanded ? noClick() : undefined)"
          >
            <template #icon>
              <IconComponent
                :icon="vkiLogoAgainst"
                :title="
                  isExpanded
                    ? $t('routes.recap.RecapQuestionCard.no')
                    : undefined
                "
              />
            </template>
            <template v-if="isExpanded" #default>{{
              $t('routes.recap.RecapQuestionCard.no')
            }}</template>
          </ButtonComponent>
          <IconButton style="justify-self: end" @click="starClick"
            v-show="isExpanded"
          >
            <IconComponent
              :icon="starIcon"
              :color="starColor"
              size="large"
              ::title="$t('routes.recap.RecapQuestionCard.important-for-me')"
            />
          </IconButton>
        </div>
      </StackComponent>
    </StackComponent>
    <!-- <StackComponent
      class="answer"
      horizontal
      :spacing="(isExpanded && 'small') || undefined"
      spacing-responsive
    >
      <ResponsiveWrapper extra-small>
        <ButtonComponent
          v-show="answer.answer === UserAnswerEnum.yes || isExpanded"
          class="in-favour"
          kind="answer"
          color="primary"
          :selected="answer.answer === UserAnswerEnum.yes"
          :read-only="!isExpanded"
          @click="() => (isExpanded ? yesClick() : undefined)"
        >
          <template #icon>
            <IconComponent
              :icon="vkiLogoInFavour"
              :title="
                isExpanded
                  ? $t('routes.recap.RecapQuestionCard.yes')
                  : undefined
              "
            />
          </template>
        </ButtonComponent>
        <ButtonComponent
          v-show="answer.answer === UserAnswerEnum.no || isExpanded"
          class="against"
          kind="answer"
          color="secondary"
          :selected="answer.answer === UserAnswerEnum.no"
          :read-only="!isExpanded"
          @click="() => (isExpanded ? yesClick() : undefined)"
        >
          <template #icon>
            <IconComponent
              :icon="vkiLogoAgainst"
              :title="
                isExpanded ? $t('routes.recap.RecapQuestionCard.no') : undefined
              "
            />
          </template>
        </ButtonComponent>
        <ButtonComponent
          v-show="answer.answer === UserAnswerEnum.skip && !isExpanded"
          class="skip"
          kind="answer"
          :read-only="true"
        >
          <template #icon>
            <IconComponent
              :icon="vkiLogoNeutral"
              :title="
                isExpanded
                  ? $t('routes.recap.RecapQuestionCard.without-answer')
                  : undefined
              "
            />
          </template>
        </ButtonComponent>
      </ResponsiveWrapper>
    </StackComponent> -->
    <!-- <div class="toggle">
      <IconButton @click="toggleClick">
        <IconComponent
          :icon="isExpanded ? mdiChevronUp : mdiChevronDown"
          size="medium"
          :title="$t('routes.recap.RecapQuestionCard.display-details')"
        />
      </IconButton>
    </div> -->
    <!-- <StackComponent
      v-show="isExpanded"
      class="expansion"
      spacing="small"
      spacing-responsive
    >
      <BodyText size="medium">{{ question.gist }}</BodyText>
      <CardComponent
        v-if="question.detail"
        corner="top-left"
        background-color="rgb(var(--color-neutral-bg))"
      >
        <BodyText size="medium">{{ question.detail }}</BodyText>
      </CardComponent>
    </StackComponent> -->
  </CardComponent>
</template>

<style lang="scss" scoped>
.recap-question-card {
  display: grid;
  grid-template-columns: min-content 1fr min-content min-content;
  //grid-template-rows: 2rem auto;
  grid-template-areas:
    'important details answer toggle'
    'important text answer toggle';
  column-gap: var(--responsive-spacing-medium);

  .important {
    grid-area: important;
    align-self: center;
    margin-right: calc(-0.5 * var(--responsive-spacing-medium));
    margin-left: calc(-0.5 * var(--responsive-spacing-medium));
  }

  .details {
    grid-area: details;
  }

  .text {
    grid-area: text;
  }

  .answer {
    grid-area: answer;
    align-self: center;
  }

  .toggle {
    grid-area: toggle;
    align-self: center;
    margin-right: calc(-0.5 * var(--responsive-spacing-medium));
    margin-left: calc(-0.5 * var(--responsive-spacing-medium));
  }

  .expansion {
    grid-area: expansion;
  }

  &--expanded {
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'important details whitespace toggle'
      'important text whitespace toggle'
      'answer answer answer answer'
      'expansion expansion expansion expansion';

    .answer {
      display: grid;
      grid-template-columns: auto auto;
      margin-top: var(--responsive-spacing-medium);
    }

    .expansion {
      margin-top: var(--responsive-spacing-medium);
    }
  }

  .desktop,
  .mobile {
    display: none;
  }

  @media (min-width: 700px) {
    .desktop {
      display: initial;
    }
  }

  @media (max-width: 700px) {
    column-gap: var(--spacing-extra-small);

    .mobile {
      display: initial;
    }

    &--expanded {
      grid-template-columns: auto 1fr 1fr auto;
      grid-template-rows: repeat(5, auto);
      grid-template-areas:
        'important answer answer answer toggle'
        'details details details details details'
        'text text text text text'
        'expansion expansion expansion expansion expansion';
      row-gap: var(--responsive-spacing-small);

      .answer,
      .expansion {
        margin-top: 0;
      }
    }
  }
}
</style>
