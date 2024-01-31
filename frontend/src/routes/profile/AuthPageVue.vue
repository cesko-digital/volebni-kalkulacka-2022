<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { mdiCloseCircleOutline, mdiEmailOutline } from '@mdi/js';

import { appRoutes } from '@/main';
import ButtonComponent from '@/components/design-system/input/ButtonComponent.vue';
import BackgroundComponent from '@/components/design-system/style/BackgroundComponent.vue';
import StickyHeaderLayout from '@/components/layouts/StickyHeaderLayout.vue';
import BodyText from '@/components/design-system/typography/BodyText.vue';
import StackComponent from '@/components/design-system/layout/StackComponent.vue';
import StaticContentLayout from '@/components/layouts/StaticContentLayout.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';
import NavigationBar from '@/components/design-system/navigation/NavigationBar.vue';
import IconButton from '@/components/design-system/input/IconButton.vue';
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
import SocialMediaConnectComponent from './SocialMediaConnectComponent.vue';

export interface Props {
  type?: 'registration' | 'login';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'login',
});

const router = useRouter();
const route = useRoute();

const returnPath = computed(() => route.query.returnPath as string);
const answerId = computed(() => route.query.answerId as string);
const updateToken = computed(() => route.query.updateToken as string);

const href = ({
  provider,
  returnPath,
  answerId,
  updateToken,
}: {
  provider: string;
  returnPath?: string;
  answerId?: string;
  updateToken?: string;
}) => {
  // TODO: PUBLIC_URL
  const PUBLIC_URL =
    import.meta.env.VITE_PUBLIC_URL ||
    `https://${import.meta.env.VITE_VERCEL_URL}`;
  const url = new URL(`/api/auth/${provider}`, PUBLIC_URL);

  if (returnPath) {
    url.searchParams.append('returnTo', returnPath);
  }

  if (answerId && updateToken) {
    url.searchParams.append('answerId', answerId);
    url.searchParams.append('updateToken', updateToken);
  }

  return url.href;
};

// TODO: see https://stackoverflow.com/questions/62358716/check-if-there-is-a-previous-page-in-vue-route
const handleClose = () => {
  // if (window.history.length > 1) {
  //   router.go(-1);
  // } else {
  router.push({
    name: appRoutes.index.name,
    query: { ...route.query },
  });
  // }
};

const handleGoToEmailFormClick = () => {
  router.push({
    name:
      props.type === 'login'
        ? appRoutes.loginForm.name
        : appRoutes.registerForm.name,
  });
};

import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <BackgroundComponent>
    <StickyHeaderLayout>
      <template #header>
        <NavigationBar transparent :with-logo="false">
          <template #right>
            <IconButton kind="link" @click="handleClose">
              <IconComponent
                :icon="mdiCloseCircleOutline"
                title=" $t('routes.profile.AuthPageVue.title-close')"
              />
            </IconButton>
          </template>
        </NavigationBar>
      </template>
      <StaticContentLayout size="small">
        <StackComponent spacing="large" centered>
          <StackComponent spacing="small" centered>
            <TitleText tag="p" size="medium">
              <template v-if="type === 'registration'"
                >{{ $t('routes.profile.AuthPageVue.registration') }}
              </template>
              <template v-else>{{
                $t('routes.profile.AuthPageVue.log-in')
              }}</template>
            </TitleText>
            <BodyText v-if="type === 'registration'" strong size="small">
              {{ $t('routes.profile.AuthPageVue.opinion') }}
            </BodyText>
          </StackComponent>
          <StackComponent spacing="medium" centered stretched>
            <SocialMediaConnectComponent
              :google-url="
                href({
                  provider: 'google',
                  returnPath,
                  answerId,
                  updateToken,
                })
              "
              :facebook-url="
                href({
                  provider: 'facebook',
                  returnPath,
                  answerId,
                  updateToken,
                })
              "
            />

            <ButtonComponent
              kind="outlined"
              color="neutral"
              class="w-full"
              @click="handleGoToEmailFormClick"
            >
              <template #icon>
                <IconComponent :icon="mdiEmailOutline" />
              </template>

              <template v-if="type === 'registration'">{{
                $t('routes.profile.AuthPageVue.create-profile-email')
              }}</template>
              <template v-else>{{
                $t('routes.profile.AuthPageVue.use-email')
              }}</template>
            </ButtonComponent>
          </StackComponent>
          <StackComponent centered spacing="large">
            <BodyText size="small" centered>
              {{ $t('routes.profile.AuthPageVue.notification') }}
              <router-link to="/ochrana-dat">{{
                $t('routes.profile.AuthPageVue.link-title')
              }}</router-link
              >.
            </BodyText>
            <StackComponent horizontal centered spacing="extra-small">
              <BodyText v-if="type === 'registration'" size="medium" strong
                >{{ $t('routes.profile.AuthPageVue.question-one') }}
                <router-link to="/prihlaseni">
                  {{ $t('routes.profile.AuthPageVue.logged-in') }}
                </router-link>
              </BodyText>
              <BodyText v-else size="medium" strong
                >{{ $t('routes.profile.AuthPageVue.question-two') }}
                <router-link to="/registrace">
                  {{ $t('routes.profile.AuthPageVue.create-it') }}
                </router-link>
              </BodyText>
            </StackComponent>
          </StackComponent>
        </StackComponent>
      </StaticContentLayout>
    </StickyHeaderLayout>
  </BackgroundComponent>
</template>

<style scoped lang="scss">
.auth-layout {
  display: grid;
  grid-template-columns: 1fr 21rem 1fr;
}
.auth-layout__col {
  grid-column-start: 2;
}
</style>
