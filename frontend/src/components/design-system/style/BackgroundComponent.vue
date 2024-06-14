<script setup lang="ts">
import { computed, inject } from 'vue';
import { EmbedKey } from '@/components/utilities/embedding/EmbedKey';

export interface Props {
  hasBlobs?: boolean;
  blobsHeight?: string;
  redBlobX?: string;
  redBlobY?: string;
  blueBlobX?: string;
  blueBlobY?: string;

  // TODO: add responsivity
}
const props = withDefaults(defineProps<Props>(), {
  hasBlobs: true,
  blueBlobX: '5%',
  blueBlobY: '10%',
  redBlobX: '50%',
  redBlobY: '20%',
  blobsHeight: '80%',
});

const currentEmbed = inject(EmbedKey);
</script>

<template>
  <template v-if="currentEmbed === 'infovolby'">
    <!-- <slot /> -->
    <div class="background new-gradient-background">
      <template v-if="props.hasBlobs">
        <!-- <div class="blobs">
          <img src="@/assets/background/blue-blob.svg" class="blue-blob" />
          <img src="@/assets/background/red-blob.svg" class="red-blob" />
        </div> -->
      </template>
      <slot />
    </div>
  </template>
  <template v-else>
    <div class="background">
      <template v-if="props.hasBlobs">
        <div class="blobs">
          <img src="@/assets/background/blue-blob.svg" class="blue-blob" />
          <img src="@/assets/background/red-blob.svg" class="red-blob" />
        </div>
      </template>
      <slot />
    </div>
  </template>
</template>

<style scoped lang="scss">
.new-gradient-background{
  background: rgb(255,118,108);
  background: linear-gradient(149deg, rgba(255,118,108,1) 29%, rgba(248,11,37,1) 69%, rgba(237,89,149,1) 90%);
}

.background {
  display: grid;
  width: 100%;
  height: 100%;
}

.blobs {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;

  .blue-blob,
  .red-blob {
    height: v-bind('blobsHeight');
    position: fixed;
    filter: blur(120px);
  }

  .blue-blob {
    left: v-bind('blueBlobX');
    top: v-bind('blueBlobY');
  }

  .red-blob {
    left: v-bind('redBlobX');
    top: v-bind('redBlobY');
  }
}
</style>
