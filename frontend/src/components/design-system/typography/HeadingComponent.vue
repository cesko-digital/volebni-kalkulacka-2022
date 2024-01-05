<script setup lang="ts">
import HeadlineText from '@/components/design-system/typography/HeadlineText.vue';
import TitleText from '@/components/design-system/typography/TitleText.vue';

export interface Props {
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  kind?: 'title' | 'headline' | 'title-embed' | 'headline-embed';
  size?: 'extra-small' | 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span',
  kind: 'headline',
  size: 'extra-small',
});
</script>

<template>
  <span>
    <component :is="props.tag" v-if="props.kind === 'headline-embed'">
      <HeadlineText :tag="'span'" :size="props.size" :color="'rgb(var(--palette-neutral-100))'">
        <slot />
      </HeadlineText>
      <HeadlineText
        :tag="'span'"
        :size="props.size"
        :color="'rgb(var(--palette-neutral-100))'"
      >
        <slot name="secondary" />
      </HeadlineText>
    </component>
    <component :is="props.tag" v-if="props.kind === 'headline'">
      <HeadlineText :tag="'span'" :size="props.size">
        <slot />
      </HeadlineText>
      <HeadlineText
        :tag="'span'"
        :size="props.size"
        :color="'rgb(var(--color-neutral-fg))'"
      >
        <slot name="secondary" />
      </HeadlineText>
    </component>
    <component :is="props.tag" v-if="props.kind === 'title'">
      <TitleText :tag="'span'" :size="props.size">
        <slot />
      </TitleText>
      <TitleText
        :tag="'span'"
        :size="props.size"
        :color="'rgb(var(--color-neutral-fg))'"
      >
        <slot name="secondary" />
      </TitleText>
    </component>
    <component :is="props.tag" v-if="props.kind === 'title-embed'">
      <TitleText :tag="'span'" :size="props.size" :color="'rgb(var(--palette-neutral-100))'">
        <slot />
      </TitleText>
      <TitleText
        :tag="'span'"
        :size="props.size"
        :color="'rgb(var(--palette-neutral-100))'"
      >
        <slot name="secondary" />
      </TitleText>
    </component>
  </span>
</template>
