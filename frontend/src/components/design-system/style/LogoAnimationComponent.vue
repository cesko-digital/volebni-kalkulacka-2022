<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { appRoutes } from '@/main';

import { computed, onMounted } from 'vue';

import gsap from 'gsap';
import { TweenMax } from 'gsap/gsap-core';
import DrawSVGPlugin from 'gsap/DrawSVGPlugin';
import MotionPathPlugin from 'gsap/MotionPathPlugin';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

const timeline = gsap.timeline();

export interface Props {
  monochromatic?: string;
  text?: boolean;
  size?: 'small' | 'medium' | 'large' | 'extra-large' | 'extra-huge';
  link?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  monochromatic: undefined,
  text: true,
  size: 'small',
  link: false,
});

const router = useRouter();
const route = useRoute();

const classes = computed(() => ({
  [`logo--${props.size}`]: props.size,
}));

const logoMonochromatic = computed(() => ({
  'logo--monochromatic': props.monochromatic,
}));

const handleClick = () => {
  if (props.link) {
    router.push({ name: appRoutes.index.name, query: { ...route.query } });
  }
};

onMounted(() => {
  TweenMax.set(['#headline', '#logo'], {
    xPercent: -50,
    yPercent: -50,
    left: '50%',
    top: '50%',
  });

  timeline.to(
    ['#linediagonal', '#bluecircle', '#redcircle'],
    {
      x: -15,
      duration: 0,
    },
    0,
  );

  timeline.fromTo(
    ['#linepercentage', '#linediagonal', '#bluecircle', '#redcircle'],
    {
      scale: 0,
      transformOrigin: 'center center',
    },
    {
      duration: 0.3,
      scale: 1,
      ease: 'back.out(2.1)',
    },
    0,
  );

  timeline.to('#polycheck', {
    opacity: 1,
    duration: 0,
  });

  timeline.from(
    '#polycheck',
    {
      duration: 0.3,
      drawSVG: 0,
    },
    '<',
  );

  timeline.to(
    '#bluecircle',
    {
      motionPath: {
        path: [
          { x: -56, y: 35 },
          { x: -70, y: 28 },
        ],
      },
      duration: 0.3,
      scale: 0,
    },
    '<',
  );

  timeline.to('#linediagonal', {
    x: 0,
    duration: 0.3,
  });

  timeline.to(
    '#redcircle',
    {
      x: 33,
      duration: 0.3,
    },
    '<',
  );

  timeline.fromTo(
    '#bluecirclePercentage',
    {
      scale: 0,
      transformOrigin: 'center center',
    },
    {
      scale: 1,
      ease: 'back.out(1.8)',
    },
    '<',
  );

  timeline.to(['#linecrossleft', '#linecrossright'], {
    opacity: 1,
    duration: 0,
  });

  timeline.from(
    '#linecrossleft',
    {
      drawSVG: 0,
      duration: 0.3,
    },
    '<',
  );

  timeline.to(
    '#redcircle',
    {
      motionPath: {
        path: [{ x: 63, y: -28 }],
      },
      duration: 0.3,
      scale: 0,
    },
    '<',
  );

  timeline.from('#linecrossright', {
    drawSVG: 0,
    duration: 0.3,
  });

  timeline.fromTo(
    '#redcirclePercentage',
    {
      scale: 0,
      transformOrigin: 'center center',
    },
    {
      scale: 1,
      ease: 'back.out(1.8)',
    },
  );

  timeline.to(
    '#headline',
    {
      y: -21,
      duration: 0,
    },
    '<',
  );

  timeline.to('#logo', {
    x: -190,
    duration: 0.3,
  });

  timeline.to(
    '#headline',
    {
      x: 190,
      opacity: 1,
      duration: 0.3,
    },
    '<',
  );
});
</script>

<template>
  <div
    :class="['logo-wrapper', props.link ? 'logo-wrapper--link' : '']"
    @click="handleClick"
  >
    <div :class="['logo', 'container', classes, logoMonochromatic]">
      <svg
        id="logo"
        viewBox="0 0 300 85"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          id="polycheck"
          points="73,16 28,61 8,42"
          :stroke="props.monochromatic || 'rgb(var(--color-primary-fg))'"
          stroke-width="17"
          fill="none"
        />

        <circle
          id="bluecircle"
          cx="86"
          cy="20"
          r="10"
          :fill="props.monochromatic || 'rgb(var(--color-primary-fg))'"
        />

        <line
          id="linediagonal"
          x1="81"
          y1="68"
          x2="133"
          y2="16"
          :stroke="props.monochromatic || 'rgb(var(--color-neutral-fg-strong))'"
          stroke-width="17"
          fill="none"
        />

        <circle
          id="redcircle"
          cx="131"
          cy="64"
          r="10"
          :fill="props.monochromatic || 'rgb(var(--color-secondary-fg))'"
        />

        <line
          id="linecrossleft"
          x1="161"
          y1="67"
          x2="212"
          y2="16"
          :stroke="props.monochromatic || 'rgb(var(--color-secondary-fg))'"
          stroke-width="17"
          fill="none"
        />

        <line
          id="linecrossright"
          x1="161"
          y1="16"
          x2="212"
          y2="67"
          :stroke="props.monochromatic || 'rgb(var(--color-secondary-fg))'"
          stroke-width="17"
          fill="none"
        />

        <circle
          id="bluecirclePercentage"
          cx="245"
          cy="20"
          r="10"
          :fill="props.monochromatic || 'rgb(var(--color-primary-fg))'"
        />

        <line
          id="linepercentage"
          x1="241"
          y1="67"
          x2="292"
          y2="16"
          :stroke="props.monochromatic || 'rgb(var(--color-neutral-fg-strong))'"
          stroke-width="17"
          fill="none"
        />

        <circle
          id="redcirclePercentage"
          cx="289"
          cy="64"
          r="10"
          :fill="props.monochromatic || 'rgb(var(--color-secondary-fg))'"
        />
      </svg>

      <h1 id="headline">Volební kalkulačka</h1>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logo-wrapper {
  display: flex;
  align-items: center;

  .logo--text {
    transition: color 0.3s ease-in;
  }

  svg * {
    transition: fill 0.3s ease-in;
  }

  &--link:hover {
    cursor: pointer;

    .logo--text {
      color: rgb(var(--color-neutral-fg));
    }

    svg * {
      fill: rgb(var(--color-neutral-fg));
    }
  }
}

.logo {
  &--small {
    width: 5.953rem;
    height: 1.25rem;
  }

  &--medium {
    width: 18.75rem;
    height: 4rem;
  }

  &--text {
    text-transform: uppercase;
    font-family: var(--typography-title-family);
    color: rgb(var(--color-neutral-fg-strong));

    &-medium {
      font-size: 1.75rem;
      margin-left: calc(var(--spacing-medium) - var(--spacing-tiny));
    }

    &-small {
      font-size: var(--typography-body-small-size);
      margin-left: 0.563rem;
    }
  }

  &--monochromatic {
    color: rgb(var(--color-neutral-fg));
  }
}

#polycheck,
#linecrossleft,
#linecrossright {
  opacity: 0;
}

.container {
  svg {
    position: absolute;
    max-width: 300px;
  }

  #headline {
    position: absolute;
    font-size: 2rem;
    font-family: 'Radio Canada', sans-serif;
    text-transform: uppercase;
    opacity: 0;
    letter-spacing: 0.2rem;
  }
}
</style>
