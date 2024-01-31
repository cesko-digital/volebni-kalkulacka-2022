<script setup lang="ts">
import { computed, ref } from 'vue';

import type { DeprecatedQuestion } from '@/types/question';
import type { DeprecatedCandidate } from '@/types/candidate';
import type { DeprecatedCandidateAnswer } from '@/types/candidate-answer';
import { UserAnswerEnum, type UserAnswer } from '@/stores/electionStore';

import { calculateRelativeAgreement } from '@/common/resultParser';

import BodyText from '@/components/design-system/typography/BodyText.vue';
import DividerComponent from '@/components/design-system/containers/DividerComponent.vue';
import FilledCircle from '@/components/design-system/containers/FilledCircle.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';

import {
  vkiLogoInFavour,
  vkiLogoAgainst,
  vkiLogoNeutral,
} from '@/components/design-system/icons';

import QuestionCard from '@/components/QuestionCard.vue';
import CardComponent from '../../components/design-system/containers/CardComponent.vue';

import { useI18n } from 'vue-i18n';

export interface Props {
  questions: DeprecatedQuestion[];
  answers: UserAnswer[];
  candidates: DeprecatedCandidate[];
  candidateAnswers: DeprecatedCandidateAnswer[];
  selectedTags?: Set<string>;
  selectedCandidateIds?: Set<string>;
}

const { t, locale } = useI18n();

const props = defineProps<Props>();
const isQuestionInTagSet = (question: DeprecatedQuestion) => {
  if (!props.selectedTags) {
    return true;
  }
  return (
    question.tags?.find((tag) => {
      return props.selectedTags?.has(tag);
    }) !== undefined
  );
};

const isCandidateInCandidateSet = (candidate: DeprecatedCandidate) => {
  if (!props.selectedCandidateIds) {
    return true;
  } else {
    return props.selectedCandidateIds?.has(candidate.id);
  }
};

const questionsToShow = computed(() =>
  props.questions.filter((x) => isQuestionInTagSet(x)),
);
const candidatesToShow = computed(() =>
  props.candidates.filter((x) => isCandidateInCandidateSet(x)),
);
console.debug(candidatesToShow);
const results = calculateRelativeAgreement(
  props.candidateAnswers,
  props.answers,
);
const candidateOrder = computed(() =>
  results
    .filter((x) =>
      props.selectedCandidateIds ? props.selectedCandidateIds.has(x.cId) : true,
    )
    .map((response) => response.cId),
);

const mapAnswerToIcon = (answer: string | UserAnswerEnum) => {
  switch (answer) {
    //case 0:
    case UserAnswerEnum.yes:
    case 'yes':
      return vkiLogoInFavour;
    case UserAnswerEnum.no:
    case 'no':
      return vkiLogoAgainst;
    case UserAnswerEnum.skip:
    case 'dont_know':
      return vkiLogoNeutral;
    case undefined:
      return '';
    default:
      // TODO Track error
      // new Error(`Unexpected answer value: \`${answer}\``)
      return vkiLogoNeutral;
  }
};

const mapAnswerToColor = (answer: string | UserAnswerEnum) => {
  switch (answer) {
    //case 0:
    case UserAnswerEnum.yes:
    case 'yes':
      return 'primary';
    case UserAnswerEnum.no:
    case 'no':
      return 'secondary';
    case UserAnswerEnum.skip:
    case 'dont_know':
      return 'neutral';
    case undefined:
      return 'undefined-color';
    default:
      // TODO Track error
      // new Error(`Unexpected answer value: \`${answer}\``)
      return 'neutral';
  }
};

//this ensures stickiness of the header
const calculateStickeHeaderPos = () => {
  const bot = document
    .getElementsByClassName('sticky-header')[0]
    ?.getBoundingClientRect().bottom;
  const headers = document.querySelectorAll('#comparison-grid > .header');
  for (let index = 0; index < headers.length; index++) {
    const element = headers[index] as HTMLElement;
    element.style.top = `${bot}px`;
  }
};
window.onload = calculateStickeHeaderPos;
window.onresize = calculateStickeHeaderPos;
window.onscroll = calculateStickeHeaderPos;

export interface Source {
  title?: string;
  url: string;
}
</script>

<template>
  <div id="comparison-grid" class="grid">
    <template v-for="i in candidateOrder.length + 1" :key="i">
      <DividerComponent
        :class="['line', i === 1 ? 'user-line' : '']"
        vertical
        line-style="dotted"
        :color="i === 1 ? 'rgb(var(--color-neutral-border-strong))' : undefined"
        :style="{
          'grid-column': i === 1 ? 1 : 2 * (i - 1),
          'grid-row': `1 / span ${2 * questionsToShow.length + 1}`,
        }"
      />
    </template>
    <div
      class="header user-header user-answers"
      :style="{ 'grid-column': 1, 'grid-row': 1, 'z-index': 999 }"
    >
      <FilledCircle
        size="extra-large"
        background-color="rgb(var(--color-primary-bg))"
      >
        <BodyText size="small" :style="{ 'text-align': 'center' }">
          <strong>
            {{ $t('routes.comparison.ComparisonGrid.my') }} <br />
            {{ $t('routes.comparison.ComparisonGrid.answers') }}
          </strong>
        </BodyText>
      </FilledCircle>
    </div>
    <template v-for="(candidateId, index) in candidateOrder" :key="candidateId">
      <div
        class="header"
        :style="{ 'grid-column': 2 * index + 2, 'grid-row': 1 }"
      >
        <FilledCircle
          size="extra-large"
          style="padding: var(--spacing-extra-small)"
        >
          <BodyText
            size="extra-small"
            color="rgb(var(--color-neutral-fg-inverse))"
            :style="{ 'text-align': 'center' }"
          >
            <strong>
              {{
                candidatesToShow.filter(
                  (candidate) => candidate.id === candidateId,
                )[0].short_name
              }}</strong
            >
          </BodyText>
        </FilledCircle>
      </div>
    </template>
    <template
      v-for="(question, questionIndex) in questionsToShow"
      :key="question.id"
    >
      <QuestionCard
        class="question-card"
        :style="{
          'grid-column': `1 / span ${2 * candidateOrder.length + 2}`,
          'grid-row': 2 * questionIndex + 2,
        }"
        :question="question"
        :current-question="questions.findIndex((x) => x.id === question.id) + 1"
        :question-count="$props.questions.length"
      />
      <div
        class="user-answers"
        :style="{
          'grid-column': 1,
          'grid-row': 2 * questionIndex + 3,
        }"
      >
        <FilledCircle
          :background-color="`rgb(var(--color-${mapAnswerToColor(
            answers.filter((answer) => answer.id === question.id)[0]?.answer,
          )}-bg-strong))`"
        >
          <IconComponent
            :icon="
              mapAnswerToIcon(
                answers.filter((answer) => answer.id === question.id)[0]
                  ?.answer,
              )
            "
            color="rgb(var(--color-neutral-fg-inverse))"
          />
        </FilledCircle>
      </div>
      <template
        v-for="(candidateId, candidateIndex) in candidateOrder"
        :key="candidateId"
      >
        <div
          :style="{
            'grid-column': 2 * candidateIndex + 2,
            'grid-row': 2 * questionIndex + 3,
          }"
        >
          <FilledCircle
            :background-color="`rgb(var(--color-${mapAnswerToColor(
              candidateAnswers.filter(
                (answer) =>
                  answer.candidate_id === candidateId &&
                  answer.question_id === question.id,
              )[0]?.answer as string,
            )}-bg-strong))`"
          >
            <IconComponent
              :icon="
                mapAnswerToIcon(
                  candidateAnswers.filter(
                    (answer) =>
                      answer.candidate_id === candidateId &&
                      answer.question_id === question.id,
                  )[0]?.answer as string,
                )
              "
              color="rgb(var(--color-neutral-fg-inverse))"
            />
          </FilledCircle>
        </div>

        <div
          v-if="
            candidateAnswers.filter(
              (answer) =>
                answer.candidate_id === candidateId &&
                answer.question_id === question.id,
            )[0]?.comment ||
            candidateAnswers.filter(
              (answer) =>
                answer.candidate_id === candidateId &&
                answer.question_id === question.id,
            )[0]?.expert
          "
          class="comment"
          :style="{
            'grid-column': 2 * candidateIndex + 3,
            'grid-row': 2 * questionIndex + 3,
          }"
        >
          <CardComponent corner="top-left" :padding="Object('medium')">
            <BodyText size="small">
              <template
                v-if="
                  candidateAnswers.filter(
                    (answer) =>
                      answer.candidate_id === candidateId &&
                      answer.question_id === question.id,
                  )[0]?.expert
                "
              >
                <strong>Odôvodnenie postoja</strong><br />
              </template>
              {{
                candidateAnswers.filter(
                  (answer) =>
                    answer.candidate_id === candidateId &&
                    answer.question_id === question.id,
                )[0]?.comment
              }}
              <template
                v-if="
                  candidateAnswers.filter(
                    (answer) =>
                      answer.candidate_id === candidateId &&
                      answer.question_id === question.id,
                  )[0]?.sources
                "
              >
                <ul
                  v-for="source in candidateAnswers.filter(
                    (answer) =>
                      answer.candidate_id === candidateId &&
                      answer.question_id === question.id,
                  )[0]?.sources as Source[]"
                  :key="source.url"
                >
                  <li>
                    <a :href="source.url">{{
                      source.title || source.url.substring(8, 18) + '…'
                    }}</a>
                  </li>
                </ul>
              </template>
            </BodyText>
          </CardComponent>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.header {
  padding-top: var(--spacing-extra-small);
  position: sticky;
  // top: calc(
  //   2 * var(--responsive-spacing-large) + var(--spacing-medium) + 2 *
  //     var(--spacing-extra-small) + var(--responsive-spacing-large)
  // );
  z-index: 100;
}

.grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  justify-items: center;
  column-gap: var(--responsive-spacing-large);
  row-gap: var(--spacing-medium);
}

.column {
  display: grid;
  grid-template-columns: 1fr;
}

.line {
  margin-top: var(--spacing-extra-small);
  grid-row: 1 / span 2;
  justify-self: center;
}

.question-card {
  justify-self: start;
  max-width: calc(100vw - 2 * var(--responsive-spacing-large));
}

.question-card,
.user-answers {
  position: sticky;
  left: var(--responsive-spacing-large);
}

.user-line {
  position: sticky;
  left: calc(var(--responsive-spacing-large) + 18px);
}

.user-header {
  left: calc(var(--responsive-spacing-large) - 18px);
}

.comment {
  max-width: calc(6 * var(--spacing-large));
  margin-top: calc(var(--spacing-extra-large) / 2);
  margin-left: calc(-1 * var(--responsive-spacing-large));
}
</style>
