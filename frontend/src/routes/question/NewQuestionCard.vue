<script setup lang="ts">
import type { DeprecatedQuestion } from '@/types/question';
import {inject} from 'vue';

import AccordionComponent from '@/components/design-system/containers/AccordionComponent.vue';
import BodyText from '@/components/design-system/typography/BodyText.vue';
import CardComponent from '@/components/design-system/containers/CardComponent.vue';
import HeadingComponent from '@/components/design-system/typography/HeadingComponent.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import TagComponent from '@/components/design-system/containers/TagComponent.vue';

import { EmbedKey } from '@/components/utilities/embedding/EmbedKey'; // GH: Update

export interface Props {
  question: DeprecatedQuestion;
  currentQuestion: number;
  questionCount: number;
}

defineProps<Props>();

const currentEmbed = inject(EmbedKey);

</script>

<template>
  <CardComponent
    class="question-card"
    corner="top-left"
  >
    <StackComponent spacing="large" spacing-responsive>
      <!-- <StackComponent
        horizontal
        centered
        spacing="small"
        wrap
        spacing-responsive
      >
        <BodyText size="small">
          {{ currentQuestion }}/{{ questionCount }}
        </BodyText>
        <BodyText size="small">{{ question.name }}</BodyText>
        <TagComponent v-for="tag in question.tags" :key="tag">
          {{ tag }}
        </TagComponent>
      </StackComponent> -->
      <HeadingComponent class="heading--desktop" :kind="currentEmbed === 'infovolby' ? 'headline-embed' : 'headline'" size="small">
        {{ question.title }}
      </HeadingComponent>
      <HeadingComponent class="heading--mobile" kind="title" size="medium">
        {{ question.title }}
      </HeadingComponent>
      <BodyText v-if="question.gist" size="medium" :color="currentEmbed === 'infovolby' ? 'white': ''">{{
        question.gist
      }}</BodyText>
      <AccordionComponent v-if="question.detail" class="detail">
        <template #content>
          <BodyText size="medium" :color="currentEmbed === 'infovolby' ? 'white': ''">{{ question.detail }}</BodyText>
        </template>
      </AccordionComponent>
    </StackComponent>
  </CardComponent>
</template>

<style lang="scss" scoped>
.question-card{
    background: transparent !important;
}
.detail {
  width: 100%;
}

.heading--mobile {
  display: none;
}

@media (max-width: 700px) {
  .heading--desktop {
    display: none;
  }

  .heading--mobile {
    display: initial;
  }
}
</style>
