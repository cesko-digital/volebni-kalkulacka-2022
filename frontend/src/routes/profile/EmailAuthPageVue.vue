<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { mdiArrowLeft, mdiArrowRight, mdiEmailOutline } from '@mdi/js';
import { appRoutes } from '@/main';

import BackgroundComponent from '@/components/design-system/style/BackgroundComponent.vue';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import BodyText from '@/components/design-system/typography/BodyText.vue';
import CardComponent from '@/components/design-system/containers/CardComponent.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';
import SecondaryNavigationBar from '@/components/design-system/navigation/SecondaryNavigationBar.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import StaticContentLayout from '@/components/layouts/StaticContentLayout.vue';
import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';
import TextInputComponent from '@/components/design-system/input/TextInputComponent.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

export interface Props {
  type?: 'registration' | 'login';
}

withDefaults(defineProps<Props>(), {
  type: 'login',
});

const router = useRouter();
const emailAddress = ref('');
const posting = ref();

const handlePreviousClick = () => router.go(-1);

const handleGoToLoginClick = () => router.push(appRoutes.login.name);

// const handleEmailSubmitClick = () => true;

const handleSubmit = async () => {
  posting.value = true;

  const response = await fetch('/api/auth/magiclogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destination: emailAddress.value }),
  });

  if (response.ok) {
    console.log('OK!');
    // formSavedSuccess.value = 'Vaše změny byly úspěšne zapsány';
    posting.value = false;
    // userStore.fetchUser();
  } else {
    posting.value = false;
    throw Error('User update failed');
  }
};
</script>

<template>
  <BackgroundComponent>
    <StickyHeaderLayout>
      <template #header>
        <ResponsiveWrapper extra-small small>
          <SecondaryNavigationBar centered-title transparent>
            <template #before>
              <IconButton @click="handlePreviousClick">
                <IconComponent
                  :icon="mdiArrowLeft"
                  title=" $t('routes.profile.EmailAuthPageVue.title-close')"
                />
              </IconButton>
            </template>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
        <ResponsiveWrapper medium large extra-large huge>
          <SecondaryNavigationBar transparent>
            <template #before>
              <IconButton @click="handlePreviousClick">
                <IconComponent
                  :icon="mdiArrowLeft"
                  title=" $t('routes.profile.EmailAuthPageVue.title-close')"
                />
              </IconButton>
            </template>
          </SecondaryNavigationBar>
        </ResponsiveWrapper>
      </template>
      <StaticContentLayout size="small">
        <StackComponent spacing="medium" centered>
          <TitleText tag="p" size="medium">
            <template v-if="type === 'registration'">{{
              $t('routes.profile.EmailAuthPageVue.create-profile')
            }}</template>
            <template v-else>{{
              $t('routes.profile.EmailAuthPageVue.log-in')
            }}</template>
          </TitleText>

          <BodyText strong size="medium">
            {{ $t('routes.profile.EmailAuthPageVue.message') }}
          </BodyText>

          <BodyText tag="p" size="medium" centered>
            <template v-if="type === 'registration'">{{
              $t('routes.profile.EmailAuthPageVue.message-verification-first')
            }}</template>
            <template v-else>{{
              $t('routes.profile.EmailAuthPageVue.message-verification-second')
            }}</template>
          </BodyText>

          <form
            id="register-form"
            ref="form"
            @submit.prevent="() => handleSubmit"
          >
            <CardComponent
              corner="top-left"
              :padding="Object('medium')"
              border
              border-radius="medium"
              shadow
              class="form-wrapper"
            >
              <StackComponent spacing="medium" centered stretched>
                <TextInputComponent
                  v-model="emailAddress"
                  required
                  label="E-mail"
                  type="email"
                  placeholder="E-mail"
                  :value="emailAddress"
                  :icon="mdiEmailOutline"
                  :disabled="posting"
                />

                <ButtonComponent
                  kind="filled"
                  color="primary"
                  :loading="posting"
                  @click.prevent="handleSubmit"
                >
                  {{ $t('routes.profile.EmailAuthPageVue.confirmation') }}
                  <template #iconAfter>
                    <IconComponent :icon="mdiArrowRight" />
                  </template>
                </ButtonComponent>
              </StackComponent>
            </CardComponent>
          </form>
        </StackComponent>
      </StaticContentLayout>
    </StickyHeaderLayout>
  </BackgroundComponent>
</template>
