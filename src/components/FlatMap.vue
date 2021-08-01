<template lang="pug">
div(:style="{ position: 'relative' }")
  img(
    src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg",
    :style="{ position: 'relative', width: `${width}px`, height: `${height}px` }"
  )
  template(v-for="user in users")
    img(
      v-if="user.geolocation",
      :src="user.avatarUrl",
      :style="{ position: 'absolute', top: `${inverseLerp(90, -90, user.geolocation.lat) * height - avatarSize / 2}px`, left: `${inverseLerp(-180, 180, user.geolocation.lng) * width - avatarSize / 2}px` }",
      :width="avatarSize",
      :height="avatarSize"
    )
</template>

<script lang="ts">
import { User } from '@/shared/User';
import { defineComponent, PropType, Ref, ref } from 'vue';

export default defineComponent({
  name: 'FlatMap',
  props: {
    users: { type: Array as PropType<User[]>, required: true }
  },
  setup() {
    const width: Ref<number> = ref(960);
    const height: Ref<number> = ref(483);

    const avatarSize: Ref<number> = ref(24);

    const inverseLerp: (a: number, b: number, x: number) => number = (a, b, t) => (t - a) / (b - a);

    return { width, height, avatarSize, inverseLerp };
  }
});
</script>
