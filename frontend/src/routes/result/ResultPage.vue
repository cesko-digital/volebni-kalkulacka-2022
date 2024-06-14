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
  if (election.key === 'nrsr-2023' || election.key === 'prezidentske-2024' || election.key === 'europske-2024') {
    if (userStore.user || userStore.user === null) {
      const res = await electionStore.saveResults({
        embedName: currentEmbed,
        user: userStore.user as User | null | undefined,
      });
      console.debug(res);
    } else {
      userStore.$subscribe(async (mutation, state) => {
        const res = await electionStore.saveResults({
          embedName: currentEmbed,
          user: state.user as User | null | undefined,
        });
        console.debug(res);
      });
    }
  }
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
  "SK01": "b47f509a-95ff-4e06-b01d-56abb342373f", // Slovenský PATRIOT
  "SK02": "97078ab2-6f60-4c20-a05e-393243ce5d69", // MySlovensko
  "SK03": "3028920e-200e-4aef-bfd0-4b4bda26315e", // Demokrati
  "SK04": "fa3c7b5a-996b-4656-80cf-9da7e68b4289", // Magyar Szövetség - Maďarská aliancia
  "SK05": "19144e50-f8db-4cc2-b30b-00e5c97be97d", // SDKÚ - DS - Slovenská demokratická a kresťanská únia - Demokratická strana
  "SK06": "0b18feba-0513-4f48-9b1c-e656fde32ede", // Spájame Občanov Slovenska - SOSK
  "SK07": "8fca9937-9e52-4927-9535-9eedc13d8fe5", // Pirátska strana - Slovensko
  "SK08": "ab31fd8c-f75d-4cd8-bdd9-d9720015ab6c", // SPOLOČNE OBČANIA SLOVENSKA
  "SK09": "5246f4ce-8716-4f88-b32a-b80ae27d15c6", // Socialisti.sk
  "SK10": "5752be29-edf1-423a-8136-3a5b73db3ae1", // Slovenská národná strana
  "SK11": "781359c0-ca07-421f-9afc-cd6c4f9441e4", // REPUBLIKA
  "SK12": "28b4610a-cd1d-4382-b783-7449e09879d1", // Slovenská ľudová strana Andreja Hlinku
  "SK13": "13c733db-5cb1-46b4-8f62-ee9aec70a639", // SRDCE vlastenci a dôchodcovia - SLOVENSKÁ NÁRODNÁ JEDNOTA
  "SK14": "67380dd6-462b-4ce8-ab60-82673b83d260", // Kotlebovci - Ľudová strana Naše Slovensko
  "SK15": "cea4272a-f63b-4dee-998e-22242b6dbadf", // ZDRAVÝ ROZUM
  "SK16": "cc976651-b0d2-4a52-8a0d-885360d35971", // Komunistická strana Slovenska
  "SK17": "9bd55445-508a-4fbc-a840-925ab5d9ad21", // Kresťanská únia
  "SK18": "13778a7d-79ad-425d-a37d-fec15b95716e", // SMER - sociálna demokracia
  "SK19": "c3fc9d5f-4d4b-47c8-af2f-aa20140fe9b2", // Kresťanskodemokratické hnutie
  "SK20": "d32da6b4-5aaa-42cd-83a8-ca22f225d8e3", // Sloboda a Solidarita
  "SK21": "330d2f4f-4c2d-48de-9710-309188431379", // Progresívne Slovensko
  "SK22": "1ca950fe-7b6e-4736-a379-f50e533ac3a6", // SLOVENSKO, ZA ĽUDÍ
  "SK23": "5bd88a49-2c14-42ce-af27-2a2f681a9d30", // HLAS - sociálna demokracia
  "SK24": "e3b5b9d8-7e0d-41f1-a4ac-5f0a35e3c398"  // Volt Slovensko
};

const voteMatchLanguage = 'SK';
const voteMatchCountry = 'SK';

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
    route.params.first === 'europske-2024' &&
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
        <NavigationBar v-if="currentEmbed !== 'infovolby'">
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
            <template v-if="election.key === 'nrsr-2023' || election.key === 'prezidentske-2024' || election.key === 'europske-2024'" #after>
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
        <ResponsiveWrapper v-if="currentEmbed === 'infovolby'" medium large extra-large huge>
          <SecondaryNavigationBar>
            <template #before>
              <IconButton @click="handlePreviousClick">
                <IconComponent
                  color="white"
                  :icon="mdiArrowLeft"
                  :title="$t('routes.result.ResultPage.recapitulation')"
                />
              </IconButton>
            </template>
            <TitleText tag="h2" size="large" color="white">{{
              $t('routes.result.ResultPage.my-match')
            }}</TitleText>
            <template #after>
              <!-- <div class="navbar-btn-wrapper">
                <ButtonComponent
                  v-if="election.key === 'nrsr-2023'"
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
                  v-if="
                    !(
                      route.params.first === 'nrsr-2023' &&
                      route.params.second === 'inventura-2020-2023'
                    )
                  "
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
              </div> -->
            </template>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
        <ResponsiveWrapper v-else medium large extra-large huge>
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
                  v-if="election.key === 'nrsr-2023' || election.key === 'prezidentske-2024' || election.key === 'europske-2024'"
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
                  v-if="
                    !(
                      route.params.first === 'nrsr-2023' &&
                      route.params.second === 'inventura-2020-2023'
                    )
                  "
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
        <StackComponent
          v-if="electionStore.answerCount > 0"
          class="main"
          spacing="medium"
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
                  S ktorou stranou v EÚ sa najviac zhodujete?
                </TitleText>
                <BodyText tag="p" size="medium" color="white">
                  Porovnajte svoje výsledky s politickými stranami v iných európskych krajinách.
                </BodyText>
              </StackComponent>
              <ButtonComponent
                kind="outlined"
                color="white"
                target="_blank"
                class="VotematchEU-button"
              >
                Zobraziť moje výsledky vo VoteMatch Europe
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
          <BodyText
            v-if="
              route.params.first === 'nrsr-2023' &&
              route.params.second === 'inventura-2020-2023'
            "
            size="medium"
          >
            {{ $t('routes.result.ResultPage.text-table') }}
            <a
              target="_blank"
              href="https://docs.google.com/spreadsheets/d/1UzaiDq-NRdgoPSiSv3uxDqk0wpGC7wlJUdGsTAQnLus"
              >{{ $t('routes.result.ResultPage.in-table') }}</a
            >.
          </BodyText>
          <ResultCategory
            :result="resultsGeneral"
            category="general"
            :max-visible-candidates="5"
          />
          <section class="subscribe">
            <StackComponent spacing="small" centered>
              <BodyText size="small" centered>
                Zanechajte nám váš e-mail a dáme vám vedieť vždy, keď spustíme
                novú kalkulačku.
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
                    Informujte ma o nových kalkulačkách
                  </ButtonComponent>
                </StackComponent>
              </form>
              <BodyText v-if="!success" tag="p" size="small">{{
                $t('routes.index.IndexPage.disclaimer')
              }}</BodyText>
            </StackComponent>
          </section>
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
          <CardComponent corner="bottom-left">
            <DonateBlock />
          </CardComponent>
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
                  v-if="
                    !(
                      route.params.first === 'nrsr-2023' &&
                      route.params.second === 'inventura-2020-2023'
                    )
                  "
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
              <StackComponent horizontal spacing="medium">
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
                  v-if="
                    !(
                      route.params.first === 'nrsr-2023' &&
                      route.params.second === 'inventura-2020-2023'
                    )
                  "
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
          <CardComponent corner="bottom-left">
            <DonateBlock />
          </CardComponent>
        </StackComponent>
        <template #bottom-bar>
          <ResponsiveWrapper v-if="currentEmbed === 'infovolby' || !(
                route.params.first === 'nrsr-2023' &&
                route.params.second === 'inventura-2020-2023'
              )" medium large extra-large>
            <BottomBar>
              <div class="my-match-bottom-bar">
                <div class="before"></div>
                <div class="main">
                  <div class="wrapper">
                    <ButtonComponent
                      kind="outlined"
                      color="white"
                  @click="handleShowComparsionClick"
                >
                  {{ $t('routes.result.ResultPage.compare-answers') }}
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

          <ResponsiveWrapper
            v-else
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
          <!-- <ResponsiveWrapper
            v-if="
              !(
                route.params.first === 'nrsr-2023' &&
                route.params.second === 'inventura-2020-2023'
              )
            "
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
          </ResponsiveWrapper> -->
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
