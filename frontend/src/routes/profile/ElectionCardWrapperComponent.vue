<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiCogOutline } from '@mdi/js';

import { fetchCalculator, fetchCalculators } from '@/common/dataFetch';
import { appRoutes } from '@/main';

import ElectionCardComponent from '@/components/design-system/containers/ElectionCardComponent.vue';

export interface Answer {
  id: string;
  calculatorId: string;
  answers: { answer: boolean; questionId: string };
  matches: { candidateId: string; score: number };
  createdAt: Date;
  updatedAt: string;
}

export interface Props {
  answer: Answer;
}

const props = withDefaults(defineProps<Props>(), {
  answer: undefined,
});

const calculators = await fetchCalculators();
const calculator = calculators.find(
  (c) => props.answer.calculatorId === c.calculator_id
);

const { election } = await fetchCalculator(
  calculator?.election_id as string,
  calculator?.district_code as string
);

const name = computed(() => `${election?.name} (${calculator?.name})`);
</script>

<template>
  <ElectionCardComponent
    :election-name="name"
    :district="calculator?.district_code"
    :election="calculator?.election_id"
    :uuid="answer?.id"
  />
</template>

<style scoped lang="scss"></style>