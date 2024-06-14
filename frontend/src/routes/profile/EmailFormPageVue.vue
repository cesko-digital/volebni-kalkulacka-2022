<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiEmailOutline,
  mdiCloseCircleOutline,
} from '@mdi/js';
import { appRoutes } from '@/main';

import BackgroundComponent from '@/components/design-system/style/BackgroundComponent.vue';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import BodyText from '@/components/design-system/typography/BodyText.vue';
import FormComponent from '@/components/design-system/input/FormComponent.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import NavigationBar from '@/components/design-system/navigation/NavigationBar.vue';
import ResponsiveWrapper from '@/components/utilities/ResponsiveWrapper.vue';
import SecondaryNavigationBar from '@/components/design-system/navigation/SecondaryNavigationBar.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import StaticContentLayout from '@/components/layouts/StaticContentLayout.vue';
import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';
import TextInputComponent from '@/components/design-system/input/TextInputComponent.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';

export interface Props {
  type?: 'registration' | 'login';
}

withDefaults(defineProps<Props>(), {
  type: 'login',
});

const router = useRouter();
const route = useRoute();
const emailAddress = ref('');
const emailAddressError = ref();
const posting = ref();
const step = ref(0);

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const texts = {
  0: {
    registration: {
      title: "$t('routes.profile.EmailFormPageVue.registration-title')",
      info: " $t('routes.profile.EmailFormPageVue.registration-info')",
    },
    login: {
      title: "$t('routes.profile.EmailFormPageVue.login-title')",
      info: "$t('routes.profile.EmailFormPageVue.login-info')",
    },
  },
  1: {
    registration: {
      title: "$t('routes.profile.EmailFormPageVue.confirm-title')",
      info: "$t('routes.profile.EmailFormPageVue.confirm-info')",
    },
    login: {
      title: "$t('routes.profile.EmailFormPageVue.notification-title')",
      info: "$t('routes.profile.EmailFormPageVue.notification-info')",
    },
  },
};

const handlePreviousClick = () => router.go(-1);

const validateEmail = (value: string | undefined) => {
  const expression = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  if (value)
    return expression.test(value)
      ? null
      : t('routes.profile.EmailFormPageVue.error-email');
};

const handleClose = () => {
  router.push({
    name: appRoutes.index.name,
    query: { ...route.query },
  });
  // }
};

const handleSubmit = async () => {
  const validate = validateEmail(emailAddress.value);

  if (emailAddress.value === '') {
    emailAddressError.value = t(
      'routes.profile.EmailFormPageVue.error-empty-field',
    );
    return;
  }
  if (validate) {
    emailAddressError.value = validate;
    return;
  } else {
    emailAddressError.value = null;
  }

  posting.value = true;

  const response = await fetch('/api/auth/magiclogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destination: emailAddress.value }),
  });

  if (response.ok) {
    posting.value = false;
    step.value = 1;
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
        <template v-if="step === 0">
          <ResponsiveWrapper extra-small small>
            <SecondaryNavigationBar centered-title transparent>
              <template #before>
                <IconButton @click="handlePreviousClick">
                  <IconComponent
                    :icon="mdiArrowLeft"
                    :title="$t('routes.profile.EmailFormPageVue.title-back')"
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
                    :title="$t('routes.profile.EmailFormPageVue.title-back')"
                  />
                </IconButton>
              </template>
            </SecondaryNavigationBar>
          </ResponsiveWrapper>
        </template>

        <NavigationBar v-if="step === 1" transparent :with-logo="false">
          <template #right>
            <IconButton kind="link" @click="handleClose">
              <IconComponent
                :icon="mdiCloseCircleOutline"
                :title="$t('routes.profile.EmailFormPageVue.title-close')"
              />
            </IconButton>
          </template>
        </NavigationBar>
      </template>
      <StaticContentLayout size="small">
        <StackComponent spacing="medium" centered>
          <TitleText v-if="step === 0" tag="p" size="medium">
            {{ texts[step][type].title }}
          </TitleText>

          <template v-if="step === 1">
            <img :src="'/images/email.svg'" />

            <TitleText tag="span" size="medium" centered>
              {{ texts[step][type].title }}
            </TitleText>
          </template>

          <BodyText v-if="step === 0" strong size="medium">
            {{ $t('routes.profile.EmailFormPageVue.notification') }}
          </BodyText>

          <BodyText v-if="step === 1" size="medium" centered>
            {{ texts[step][type].info }}
            <BodyText strong size="medium"> {{ emailAddress }} </BodyText>
          </BodyText>

          <BodyText v-if="step === 0" tag="p" size="medium" centered>
            {{ texts[step][type].info }}
          </BodyText>

          <BodyText v-if="step === 1" tag="p" size="medium" centered>
            {{ $t('routes.profile.EmailFormPageVue.about-spam') }}
          </BodyText>

          <FormComponent v-if="step === 0" @submit.prevent="handleSubmit">
            <TextInputComponent
              v-model="emailAddress"
              required
              label="E-mail"
              type="email"
              placeholder="E-mail"
              :value="emailAddress"
              :icon="mdiEmailOutline"
              :disabled="posting"
              :error="emailAddressError"
            />

            <ButtonComponent
              kind="filled"
              color="primary"
              :loading="posting"
              @click.prevent="handleSubmit"
            >
              {{ $t('routes.profile.EmailFormPageVue.send-confirm') }}
              <template #iconAfter>
                <IconComponent :icon="mdiArrowRight" />
              </template>
            </ButtonComponent>
          </FormComponent>
        </StackComponent>
      </StaticContentLayout>
    </StickyHeaderLayout>
  </BackgroundComponent>
</template>
