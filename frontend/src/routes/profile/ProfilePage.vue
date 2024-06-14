<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { appRoutes } from '@/main';

import BackgroundComponent from '@/components/design-system/style/BackgroundComponent.vue';
import BodyText from '@/components/design-system/typography/BodyText.vue';
import DonateBlock from '@/components/DonateBlock.vue';
import ElectionCardWrapperComponent from './ElectionCardWrapperComponent.vue';
import FooterMultiWord from '@/components/FooterMultiWord.vue';
import HeadlineText from '@/components/design-system/typography/HeadlineText.vue';
import NavigationBar from '@/components/design-system/navigation/NavigationBar.vue';
import ProfileCardComponent from './ProfileCardComponent.vue';
import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import StaticContentLayout from '@/components/layouts/StaticContentLayout.vue';
import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';
import TimelineComponent from '@/components/design-system/containers/TimelineComponent.vue';
import TimelineItemComponent from '@/components/design-system/containers/TimelineItemComponent.vue';
import { useUserStore } from '@/stores/userStore';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const userStore = useUserStore();

const user = computed(() => userStore.user);

const res = await fetch('/api/answers');
const answers = await res.json();

const router = useRouter();
if (!userStore.user) router.push(appRoutes.login);
</script>

<template>
  <BackgroundComponent>
    <StickyHeaderLayout>
      <template #header>
        <NavigationBar transparent style="position: absolute" />
      </template>
    </StickyHeaderLayout>
    <StaticContentLayout size="medium" class="main">
      <ResponsiveWrapper extra-small small>
        <StackComponent stretched spacing="medium">
          <HeadlineText tag="h1" size="extra-small">
            {{ $t('routes.profile.ProfilePage.main-title') }}
          </HeadlineText>
          <ProfileCardComponent
            :name="user?.displayName"
            :email="user?.email"
          />
        </StackComponent>
      </ResponsiveWrapper>
      <ResponsiveWrapper medium large extra-large huge>
        <StackComponent spacing="large" horizontal space-between>
          <HeadlineText tag="h1" size="small">
            {{ $t('routes.profile.ProfilePage.main-title') }}</HeadlineText
          >
          <ProfileCardComponent
            :name="user?.displayName"
            :email="user?.email"
          />
        </StackComponent>
      </ResponsiveWrapper>

      <TimelineComponent style="margin-top: 2rem">
        <TimelineItemComponent v-for="(answer, idx) in answers" :key="idx">
          <ElectionCardWrapperComponent :answer="answer" />
        </TimelineItemComponent>

        <TimelineItemComponent last>
          <BodyText size="small">
            {{ $t('routes.profile.ProfilePage.message') }}
          </BodyText>
        </TimelineItemComponent>
      </TimelineComponent>
    </StaticContentLayout>
    <StaticContentLayout>
      <DonateBlock />
      <FooterMultiWord />
    </StaticContentLayout>
  </BackgroundComponent>
</template>

<style lang="scss" scoped>
.main {
  padding-top: 15%;
  padding-bottom: 15%;

  @media (min-width: 767px) {
    padding-top: 6%;
    padding-bottom: 6%;
  }
}
</style>
