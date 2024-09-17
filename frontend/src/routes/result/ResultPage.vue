<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onBeforeUnmount, ref, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  mdiShareVariantOutline,
  mdiCloseCircleOutline,
  mdiArrowLeft,
  mdiArrowRight,
  mdiAccountCircleOutline,
  mdiEmailOutline,
} from '@mdi/js';

import { appRoutes } from '@/main';
import { useElectionStore } from '@/stores/electionStore';
import { useUserStore, type User } from '@/stores/userStore';
import {
  calculateRelativeAgreement,
  encodeResults,
} from '@/common/resultParser';

import type { DeprecatedElection } from '@/types/election';
import type { DeprecatedCandidateAnswer } from '@/types/candidate-answer';

import BackgroundComponent from '@/components/design-system/style/BackgroundComponent.vue';
import BottomBar from '@/components/design-system/navigation/BottomBar.vue';
import BottomBarWrapper from '@/components/design-system/layout/BottomBarWrapper.vue';
import CardComponent from '@/components/design-system/containers/CardComponent.vue';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import NavigationBar from '@/components/design-system/navigation/NavigationBar.vue';
import SecondaryNavigationBar from '@/components/design-system/navigation/SecondaryNavigationBar.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import TextInputComponent from '@/components/design-system/input/TextInputComponent.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';

import EmbedWrapper from '@/components/utilities/embedding/EmbedWrapper.vue';
import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';
import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';

import ResultCategory from './ResultCategory.vue';
import ResultShareModal from './ResultShareModal.vue';
import { getDistrictCode } from '@/common/utils';
import BodyText from '../../components/design-system/typography/BodyText.vue';
import ErrorModal from '../../components/ErrorModal.vue';
import DonateBlock from '../../components/DonateBlock.vue';
import CheckboxComponent from '../../components/design-system/input/CheckboxComponent.vue';
import { inject } from 'vue';
import { EmbedKey } from '@/components/utilities/embedding/EmbedKey';

import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const currentEmbed = inject(EmbedKey);

const router = useRouter();
const route = useRoute();
const electionStore = useElectionStore();

const userStore = useUserStore();

const user = computed(() => userStore.user);

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
    name: appRoutes.recap.name,
    params: { ...route.params },
    query: { ...route.query },
  });
};

const handleStartClick = () => {
  router.push({
    name: appRoutes.question.name,
    params: { ...route.params, nr: 1 },
    query: { ...route.query },
  });
};

const handleShowComparsionClick = () => {
  router.push({
    name: appRoutes.comparison.name,
    params: { ...route.params },
    query: { ...route.query },
  });
};

const handleShareClick = () => {
  shareModal.value?.open();
};
onBeforeMount(async () => {
  // if (userStore.user || userStore.user === null) {
  //   const res = await electionStore.saveResults({
  //     embedName: currentEmbed,
  //     user: userStore.user as User | null | undefined,
  //   });
  //   console.debug(res);
  // } else {
  //   userStore.$subscribe(async (mutation, state) => {
  //     const res = await electionStore.saveResults({
  //       embedName: currentEmbed,
  //       user: state.user as User | null | undefined,
  //     });
  //     console.debug(res);
  //   });
  // }

  const res = await electionStore.saveResults({
    embedName: currentEmbed,
    user: userStore.user as User | null | undefined,
  });
  console.debug(res);
});

const signUpParams = computed(() => {
  const returnPath = router.resolve({
    name: appRoutes.share.name,
    params: { uuid: electionStore.resultsId },
  }).path;

  return {
    name: appRoutes.register.name,
    params: {
      ...route.params,
    },
    query: {
      returnPath,
      answerId: electionStore.resultsId,
      updateToken: electionStore.resultsUpdateToken,
    },
  };
});

const signUpPath = computed(() => {
  return router.resolve(signUpParams.value).fullPath;
});

console.debug(encodeResults(electionStore.answers));

const candidateAnswers: DeprecatedCandidateAnswer[] =
  electionStore.calculator?.answers || [];

const hasAllCandidatesInactive =
  electionStore.calculator?.candidates.filter(
    (candidate) => !candidate.is_active,
  ).length === electionStore.calculator?.candidates.length;

const hasActiveCandidatesBtn = hasAllCandidatesInactive
  ? false
  : electionStore.calculator?.candidates.some((x) => !x.is_active);

const showNotActiveCandidates = ref(false);
const filteredCandidateAnswers: Ref<DeprecatedCandidateAnswer[]> =
  ref(candidateAnswers);
const handleActiveCandidatesClicked = (isActive: boolean) => {
  showNotActiveCandidates.value = isActive;
  if (!hasAllCandidatesInactive && !showNotActiveCandidates.value) {
    filteredCandidateAnswers.value = filteredCandidateAnswers.value.filter(
      (x) => {
        return electionStore.calculator?.candidates.find(
          (cnd) => x.candidate_id === cnd.id && cnd.is_active,
        );
      },
    );
  } else if (electionStore.calculator?.answers) {
    filteredCandidateAnswers.value = candidateAnswers;
  }
};
handleActiveCandidatesClicked(false);

const resultsGeneral = computed(() => {
  const ra = calculateRelativeAgreement(
    filteredCandidateAnswers.value,
    electionStore.answers,
  );
  return ra;
});
const shareModal = ref<InstanceType<typeof ResultShareModal> | null>(null);

// Temporary subscribe
const email = ref('');
const emailError = ref();
const posting = ref();
const success = ref();
const message = ref();

const handleSubscribe = async () => {
  if (email.value === '') {
    emailError.value = t('routes.index.IndexPage.empty-email-error');
    return;
  } else {
    emailError.value = undefined;
  }

  posting.value = true;

  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email.value }),
  });

  if (response.ok) {
    posting.value = false;
    success.value = true;
    message.value = t('routes.index.IndexPage.success');
  } else {
    posting.value = false;
    success.value = false;
    message.value = t('routes.index.IndexPage.error');
  }
};

// VoteMatch integration

const scriptElement = ref<null | HTMLScriptElement>(null);

const loadExternalScript = () => {
  const script = document.createElement('script');
  script.src = 'https://assets.votematch.eu/embed.min.js';
  script.async = true;
  document.body.appendChild(script);
  scriptElement.value = script;
};

const removeExternalScript = () => {
  if (scriptElement.value) {
    document.body.removeChild(scriptElement.value);
  }
};

const questionMapping = {
  1: "1687289f-5c80-4ba7-970d-193dbd92dd7d",
  2: "34fc9af7-cb43-4081-8e21-a32bb176174e",
  3: "d5525dd2-3460-4960-95b8-e80fb76336a3",
  4: "594d25eb-955d-420b-892a-16f1e440c976",
  5: "1892f2a0-15b1-4a87-b1ee-3ea2bfe62807",
  6: "fe511b84-e29e-441d-ac17-efcaa2c3d592",
  7: "ac59bb82-2670-4c89-a856-8ca8ee3c3cf0",
  8: "71349d6f-6495-4b41-af41-571e16723c7a",
  9: "978eabc6-4b90-42bd-8779-bdd1a4273239",
  10: "dd7bacb7-80f1-4730-8000-58f52f5cb8aa",
  11: "097000bd-ecf3-4219-94b2-5f33ba3ef516",
  12: "8a2962b1-32b8-4eb6-9a99-a165492b9e5b",
  13: "3a9a1367-76c1-4696-bae1-74fa891cfe7b",
  14: "f59d633a-ee3b-44f5-9611-e0cf6765783a",
  15: "fbe6cf2b-878f-4031-9edf-883e684eba54",
  16: "856aa09a-3368-4570-ae78-559dd0ad009f",
  17: "e406e6aa-f9ba-4667-b7ba-d21527df7f2d",
  18: "d5bb5b9d-b5bf-4404-adae-c166c0c00026",
  19: "29464668-00cb-45a1-bafe-8436aa552cbc",
  20: "9569ce88-4ba1-46df-8cf6-b9aeb0917f74",
  21: "90d8acec-2741-4dd4-83d6-4adc260d49be",
  22: "0936db85-56c2-4d63-89ee-ae6b329ba7d9",
  23: "d431ef34-8499-4895-93b7-a0d208d4543f",
  24: "1c97cbfb-bc4e-4a73-93bc-103d3fe9baa2",
  25: "1cbc2791-3803-4688-91e5-3f8c357593a5",
};

const candidateMapping = {
  "CZ01": "2c529b17-560b-44e1-9885-cb294277cf60", // Klub angažovaných nestraníků
  "CZ02": "fe1a28dc-7f0e-4b83-bc32-cf9573e9cc82", // Liberální aliance nezávislých občanů
  "CZ03": "eff380ec-9263-4c50-949a-5acc02e14256", // Koalice SPD a Trikolora
  "CZ04": "ca663776-598c-4e63-a8ae-4ee3a8bba5c8", // Mourek - politická strana
  "CZ05": "363a063e-7c05-4873-b5a3-a9664aceb950", // Lepší život pro lidi
  "CZ06": "1644aae2-6b9d-4ec4-94a1-a581ee40fed5", // PRO - Jindřicha Rajchla
  "CZ07": "e0420818-21e6-4277-8fe2-2166f0b223ee", // Nevolte Urza.cz
  "CZ08": "9fe601e8-a7e3-41b7-a03a-b786886c8cf7", // Referendum o vstupu do EU bylo zmanipulované státem placenou kampaní
  "CZ09": "dc748e90-c070-46be-9f0a-62b1f2425270", // PŘÍSAHA a MOTORISTÉ
  "CZ10": "5ff0b882-8c50-486b-b0de-1093cdb65d43", // SEN 21 a Volt Česko
  "CZ11": "c931470e-ea31-45ee-9efe-b6c7e12b15e5", // ČR na 1. místě
  "CZ12": "0676c825-41e6-4a38-bdd0-21c771787f67", // Strana zelených
  "CZ13": "9f6bb08d-9572-4596-9de4-e0909d6d89cc", // Česká suverenita sociální demokracie
  "CZ14": "a680c88a-b814-4f19-9ea9-975c34e852e1", // ANO 2011
  "CZ15": "b4eabdd1-f5b7-4c30-9665-db1d9a60c14f", // ALIANCE ZA NEZÁVISLOST ČR – proti přijetí eura!
  "CZ16": "7bd3bb22-4538-455b-a622-644996e26fee", // ANO Lepší EU s mimozemšťany (zastavíme drahotu a válku)
  "CZ17": "200b9f3f-0dda-4599-ab8f-c2ea3da74c99", // Koalice SPOLU
  "CZ18": "20b1a66e-313b-479e-9f18-39d01158c72e", // REFERENDUM - Hlas lidu
  "CZ19": "d1910743-c3f1-4ab8-9176-751a372c1747", // Svobodní
  "CZ20": "57ea25cc-85e0-407b-bbb0-4c6be77e7794", // Sociální demokracie
  "CZ21": "cd3d3032-dac6-43a9-8645-2307a00048d1", // Starostové a osobnosti pro Evropu
  "CZ22": "c12317ce-c5ee-4e21-b5a0-de5917922005", // HLAS za uzákonění EUTANAZIE, HLAS za rovnoprávnost ŽEN, HLAS za bezpečnou a spolupracující EVROPU! (www.hnutihlas.cz)
  "CZ23": "c3061e2e-bcef-4a24-a1aa-1acbd9b3d793", // Česká pirátská strana
  "CZ24": "fa9ed29e-8548-4ee3-8a2d-ade18d8b1e6a", // PRO vystoupení z EU
  "CZ25": "26886fe9-b454-4249-8c66-458d9691a996", // Nový směr
  "CZ26": "741ee958-4e2e-47d6-8838-8136cffc6c2b", // Koalice Stačilo!
  "CZ27": "621b0519-e187-42ea-b1f6-15fbe67bea16", // DSZ - ZA PRÁVA ZVÍŘAT
  "CZ28": "11b1a495-281c-426e-be3d-dbbcebd2a3e2", // Volte Pravý Blok www.cibulka.net
  "CZ29": "37f57139-111d-4535-815b-4fb2b9b9a8db", // Senioři sobě
  "CZ30": "4cbb5267-0843-41f5-8264-a5b2e4534c55"  // Levice
};

const voteMatchLanguage = 'CS';
const voteMatchCountry = 'CZ';

const mappedAnswers = computed(
  () => electionStore.answers.map(answer => {
    const answerMapping = { 1: 1, 3: 0, 2: -1 };
    const swappedQuestionMapping = Object.fromEntries(
      Object.entries(questionMapping).map(([key, value]) => [value, key])
    );
    if (swappedQuestionMapping[answer.id] === undefined) return [];
    let voteMatchID = swappedQuestionMapping[answer.id];
    voteMatchID = voteMatchID.toString().padStart(2, "0");
    return {
      [`answer${voteMatchID}`]: answerMapping[answer.answer]
    };
  })
    .filter(item => Object.keys(item).length > 0)
    .reduce((result, item) => ({ ...result, ...item }), {})
);

const voteMatchCalculators = ['kalkulacka', 'expres'];
const showVoteMatch = computed(
  () =>
    !!(Object.keys(mappedAnswers.value).length >= 15) &&
    route.params.first === 'evropske-2024' &&
    voteMatchCalculators.includes(route.params.second as string),
);

onMounted(() => {
  if (showVoteMatch.value) {
    loadExternalScript();

    const swappedCandidateMapping = Object.fromEntries(
      Object.entries(candidateMapping).map(([key, value]) => [value, key])
    );
    let bestmatch: string[] = [];
    resultsGeneral.value.forEach((result, index) => {
      if (index === 0) {
        bestmatch.push(swappedCandidateMapping[result.cId]);
      } else if (result.result.result_percent === resultsGeneral.value[0].result.result_percent) {
        bestmatch.push(swappedCandidateMapping[result.cId]);
      }
    });

    const bestscore = resultsGeneral.value[0].result.result_percent;

    document.addEventListener('VotematchEU-ready', function() {
      (window as any).VotematchEU.update({
        lang: voteMatchLanguage,
        // action:'https://acc-app.votematch.eu',
      });
      (window as any).VotematchEU.results({
        country: voteMatchCountry,
        bestmatch: bestmatch,
        bestscore: bestscore,
        ...mappedAnswers.value,
      });
    });
  }
});

onBeforeUnmount(removeExternalScript);
</script>
<template>
  <BackgroundComponent :is-image="false">
    <StickyHeaderLayout>
      <template #header>
        <NavigationBar>
          <template #title>{{ breadcrumbs }}</template>
          <template #right>
            <EmbedWrapper>
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
                  {{ $t('routes.result.ResultPage.back-to-main-page') }}
                  <template #iconAfter>
                    <IconComponent :icon="mdiCloseCircleOutline" />
                  </template>
                </ButtonComponent>
              </ResponsiveWrapper>
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
                      :title="$t('routes.result.ResultPage.back-to-main-page')"
                    />
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
                  :title="$t('routes.result.ResultPage.recapitulation')"
                />
              </IconButton>
            </template>
            <TitleText tag="h2" size="medium">{{
              $t('routes.result.ResultPage.my-match')
            }}</TitleText>
            <template #after>
              <ButtonComponent
                kind="link"
                color="primary"
                @click="handleShareClick"
              >
                <template #icon>
                  <IconComponent :icon="mdiShareVariantOutline" />
                </template>
                Sdílet
              </ButtonComponent>
            </template>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
        <ResponsiveWrapper medium large extra-large huge>
          <SecondaryNavigationBar>
            <template #before>
              <IconButton @click="handlePreviousClick">
                <IconComponent
                  :icon="mdiArrowLeft"
                  :title="$t('routes.result.ResultPage.recapitulation')"
                />
              </IconButton>
            </template>
            <TitleText tag="h2" size="large">{{
              $t('routes.result.ResultPage.my-match')
            }}</TitleText>
            <template #after>
              <div class="navbar-btn-wrapper">
                <ButtonComponent
                  kind="link"
                  color="primary"
                  @click="handleShareClick"
                >
                  <template #icon>
                    <IconComponent :icon="mdiShareVariantOutline" />
                  </template>
                  {{ $t('routes.result.ResultPage.share') }}
                </ButtonComponent>
                <ButtonComponent
                  class="desktop"
                  kind="filled"
                  color="primary"
                  @click="handleShowComparsionClick"
                >
                  {{ $t('routes.result.ResultPage.compare-answers') }}
                  <template #iconAfter>
                    <IconComponent :icon="mdiArrowRight" />
                  </template>
                </ButtonComponent>
              </div>
            </template>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
      </template>
      <BottomBarWrapper>
        <StackComponent centered spacing="medium" class="main">
          <StackComponent
            v-if="electionStore.answerCount > 0"
            stretched
            spacing="small"
          >
            <CardComponent
              v-if="showVoteMatch"
              background-color="#153288"
              corner="bottom-left"
            >
              <StackComponent spacing="medium">
                <img style="max-height: 1rem;" :src="'/images/votematcheurope-logo.svg'" />
                <StackComponent spacing="medium">
                  <TitleText tag="p" size="medium" color="white">
                    Se kterou stranou v EU se nejvíc shodujete?
                  </TitleText>
                  <BodyText tag="p" size="medium" color="white">
                    Porovnejte své výsledky s politickými stranami v dalších evropských zemích.
                  </BodyText>
                </StackComponent>
                <ButtonComponent
                  kind="outlined"
                  color="white"
                  target="_blank"
                  class="VotematchEU-button"
                >
                  Zobrazit výsledky ve VoteMatch Europe
                </ButtonComponent>
              </StackComponent>
            </CardComponent>
            <CheckboxComponent
              v-if="hasActiveCandidatesBtn"
              group-name="test"
              @update:check="handleActiveCandidatesClicked"
            >
              {{
                $t('routes.result.ResultPage.display-not-advancing-candidates')
              }}
            </CheckboxComponent>
            <ResultCategory
              :result="resultsGeneral"
              category="general"
              :max-visible-candidates="10"
            />




            <!-- <CardComponent
              v-if="!user && election.key === 'prezidentske-2023'"
              corner="bottom-left"
              style="max-width: 32rem; justify-self: center"
            >
              <StackComponent centered spacing="medium">
                <StackComponent spacing="medium">
                  <TitleText tag="p" size="medium">
                    {{ $t('routes.result.ResultPage.text-in-time') }}
                  </TitleText>
                  <BodyText tag="p" size="medium">
                    {{ $t('routes.result.ResultPage.text-save-calc') }}
                  </BodyText>
                </StackComponent>
                <ButtonComponent
                  kind="outlined"
                  color="primary"
                  :href="signUpPath"
                  target="_blank"
                >
                  <template #icon>
                    <IconComponent :icon="mdiAccountCircleOutline" />
                  </template>
                  Vytvořit profil
                </ButtonComponent>
              </StackComponent>
            </CardComponent> -->
          </StackComponent>
          <StackComponent v-else class="main" spacing="medium">
            <CardComponent corner="bottom-left">
              <StackComponent spacing="medium">
                <TitleText tag="p" size="medium">
                  {{ $t('routes.result.ResultPage.text-at-least-one-answer') }}
                </TitleText>
                <BodyText tag="p" size="medium">
                  {{ $t('routes.result.ResultPage.you-may') }}
                  <a
                    :href="
                      router.resolve({
                        name: appRoutes.question.name,
                        params: { ...route.params, nr: 1 },
                        query: { ...route.query },
                      }).path
                    "
                    @click.prevent="handleStartClick"
                    >{{ $t('routes.result.ResultPage.back-to-start') }}</a
                  >
                  {{ $t('routes.result.ResultPage.text-and-answer') }}
                  <a
                    :href="
                      router.resolve({
                        name: appRoutes.comparison.name,
                        params: { ...route.params },
                        query: { ...route.query },
                      }).path
                    "
                    @click.prevent="handleShowComparsionClick"
                  >
                    {{ $t('routes.result.ResultPage.text-display-answers') }} </a
                  >.
                </BodyText>
                <StackComponent horizontal spacing="medium" wrap>
                  <ButtonComponent
                    kind="outlined"
                    color="primary"
                    @click="handleStartClick"
                  >
                    {{ $t('routes.result.ResultPage.fill-calc') }}
                    <template #iconAfter>
                      <IconComponent :icon="mdiArrowRight" />
                    </template>
                  </ButtonComponent>
                  <ButtonComponent
                    kind="outlined"
                    color="primary"
                    @click="handleShowComparsionClick"
                  >
                    {{ $t('routes.result.ResultPage.candidates-answers') }}
                    <template #iconAfter>
                      <IconComponent :icon="mdiArrowRight" />
                    </template>
                  </ButtonComponent>
                </StackComponent>
              </StackComponent>
            </CardComponent>
          </StackComponent>
          <section class="subscribe">
            <StackComponent spacing="small" centered>
              <BodyText size="small" centered>
                Nechejte nám váš e-mail a my vám dáme vědět vždy, když spustíme novou kalkulačku.
              </BodyText>
              <BodyText v-if="success" size="small">
                {{ message }}
              </BodyText>
              <form v-if="!success">
                <StackComponent
                  horizontal
                  spacing="small"
                  stretched
                  wrap
                  style="justify-content: center"
                >
                  <TextInputComponent
                    v-model="email"
                    required
                    type="email"
                    :placeholder="t('routes.index.IndexPage.input-label')"
                    :value="email"
                    :icon="mdiEmailOutline"
                    :disabled="posting"
                    :error="emailError"
                  />
                  <ButtonComponent
                    kind="filled"
                    color="primary"
                    :loading="posting"
                    @click.prevent="handleSubscribe"
                  >
                    Odeslat
                  </ButtonComponent>
                </StackComponent>
              </form>
              <BodyText v-if="!success" tag="p" size="small">
                Odesláním souhlasíte se zasíláním novinek o volební kalkulačce a <a href="/ochrana-dat" target="_blank">zásadami ochrany osobních údajů</a>.
              </BodyText>
            </StackComponent>
          </section>
          <CardComponent corner="bottom-left">
            <DonateBlock />
          </CardComponent>
        </StackComponent>
        <template #bottom-bar>
          <ResponsiveWrapper
            extra-small
            small
          >
            <BottomBar>
              <div class="bottom-bar-grid">
                <ButtonComponent
                  kind="filled"
                  color="primary"
                  @click="handleShowComparsionClick"
                >
                  {{ $t('routes.result.ResultPage.compare-answers') }}
                  <template #iconAfter>
                    <IconComponent :icon="mdiArrowRight" />
                  </template>
                </ButtonComponent>
              </div>
            </BottomBar>
          </ResponsiveWrapper>
        </template>
      </BottomBarWrapper>
    </StickyHeaderLayout>
  </BackgroundComponent>
  <ResultShareModal
    v-if="electionStore.resultsId"
    ref="shareModal"
    :relative-agreement="resultsGeneral"
  />
  <ErrorModal
    v-else
    ref="shareModal"
    :title="$t('routes.result.ResultPage.something-went-wrong')"
  >
    {{ $t('routes.result.ResultPage.something-went-wrong-text') }}
  </ErrorModal>
</template>

<style lang="scss" scoped>
.navbar-btn-wrapper {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-small);
}
.results-header-note {
  text-align: center;
}
.results-footer-note {
  text-align: center;
}
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
}

.bottom-bar-grid {
  display: grid;
  grid-template-columns: 1fr;
}
</style>
