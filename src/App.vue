<template lang="pug">
.h-screen.grid(class="grid-rows-[4em,1fr,32px]")
  .header.flex.flex-row.items-center.bg-dark-800.text-light-100
    .w-16.h-16.flex.justify-center.items-center
      a.icon-globe-alt.icon-lg(
        href="https://github.com/Shinigami92/github-contributors-map",
        title="GitHub Contributors Map Repo",
        target="_blank"
      )
    .text-lg GitHub Contributors Map
  .body.overflow-auto.bg-dark-100.text-light-300
    form.grid.grid-col-3.gap-y-4.mb-4(@submit.prevent="submit")
      .flex.justify-center
        label(for="personal-github-token") Your GitHub Token:
        input#personal-github-token.w-390px.ml-2.px-1.bg-true-gray-100.text-dark-900.border.border-purple-500(
          v-model="githubToken",
          name="personal-github-token",
          placeholder="ghp_************************************"
        )
        .hint.px-2
          .inline You need a GitHub private access token:
          a.ml-1.text-purple-400.underline(
            href="https://github.com/settings/tokens/new?description=GitHub%20Contributors%20Map&scopes=public_repo",
            target="_blank"
          ) Generate a personal token
      .flex.justify-center
        div
          label(for="search-repo") Search Repo:
          input#search-repo.ml-2.bg-true-gray-100.text-dark-900.border.border-purple-500.px-1(
            v-model="search",
            name="search-repo",
            placeholder="owner/name",
            list="repositories"
          )
          datalist#repositories
            option(v-for="repository in repositories") {{ repository }}
        div
          select.ml-2.bg-true-gray-100.text-dark-900.border.border-purple-500.px-1(v-model="mode")
            option(value="2D") 2D
            option(value="3D") 3D
            option(value="table") Table
      .flex.justify-center
        button.border-2.border-purple-500.rounded-1xl.px-2.py-1(type="submit") Search
    template(v-if="!errorMessage")
      .flex.justify-center
        FlatMap(v-if="mode === '2D'", :users="collaborators")
        ThreeCanvas(v-if="mode === '3D'", :users="collaborators")
        table(v-if="mode === 'table'")
          thead
            tr
              th Avatar
              //- th ID
              th Login
              th Name
              th Location
              th URL
              th Geolocation
          tbody
            tr(v-for="collaborator in collaborators", :key="collaborator.id")
              td
                img(:src="collaborator.avatarUrl", width="128")
              //- td {{ collaborator.id }}
              td {{ collaborator.login }}
              td {{ collaborator.name }}
              td {{ collaborator.location }}
              td {{ collaborator.url }}
              td {{ collaborator.geolocation }}
    template(v-else)
      span(v-text="errorMessage")
  .footer.flex.items-center.px-2.bg-dark-800.text-light-100
    .text-base Currently showing {{ collaborators.length }} contributors.
</template>

<script lang="ts">
import FlatMap from '@/components/FlatMap.vue';
import ThreeCanvas from '@/components/ThreeCanvas.vue';
import type { Geolocation } from '@/shared/Geolocation';
import type { User } from '@/shared/User';
import type { WorldCity } from '@/shared/WorldCity';
import type { Ref } from 'vue';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import type { RepositoryResponse, SearchRepositoriesResponse } from './composables/useGitHub';
import useGitHub from './composables/useGitHub';

type Mode = '2D' | '3D' | 'table';

function logWorldCity(rank: number, user: User, worldCity: WorldCity): void {
  console.debug(
    // eslint-disable-next-line max-len
    `Found (${rank}): ${user.name}, "${user.location}" -> "${worldCity.city}", "${worldCity.adminName}", "${worldCity.country}" (${worldCity.lat}, ${worldCity.lng})`
  );
}

export default defineComponent({
  name: 'App',
  components: { FlatMap, ThreeCanvas },
  setup() {
    const githubToken: Ref<string> = ref('');
    const search: Ref<string> = ref('vitejs/vite');

    const repoOwner: Ref<string> = computed(() => search.value.split('/')[0] ?? '');
    const repoName: Ref<string> = computed(() => search.value.split('/')[1] ?? '');

    const { searchRepositories, getMentionableUsers } = useGitHub();

    const repositories: Ref<string[]> = ref([]);
    const collaborators: Ref<User[]> = ref([]);

    const mode: Ref<Mode> = ref('2D');

    const errorMessage: Ref<string | undefined> = ref();

    const worldCities: WorldCity[] = [];

    const findGeoLocation: (user: User) => Geolocation | undefined = (user) => {
      let geoLocation: Geolocation | undefined = undefined;
      const { location } = user;
      if (!location) {
        return geoLocation;
      }

      let rank: number = 999;

      for (const worldCity of worldCities) {
        if (worldCity.city === location && rank > 1) {
          geoLocation = { lat: worldCity.lat, lng: worldCity.lng };
          rank = 1;
          logWorldCity(rank, user, worldCity);
        } else if (worldCity.adminName === location && rank > 2) {
          geoLocation = { lat: worldCity.lat, lng: worldCity.lng };
          rank = 2;
          logWorldCity(rank, user, worldCity);
        } else if (worldCity.country === location && rank > 3) {
          geoLocation = { lat: worldCity.lat, lng: worldCity.lng };
          rank = 3;
          logWorldCity(rank, user, worldCity);
        } else if (location.includes(worldCity.city) && rank > 4) {
          geoLocation = { lat: worldCity.lat, lng: worldCity.lng };
          rank = 4;
          logWorldCity(rank, user, worldCity);
        } else if (worldCity.adminName && location.includes(worldCity.adminName) && rank > 5) {
          geoLocation = { lat: worldCity.lat, lng: worldCity.lng };
          rank = 5;
          logWorldCity(rank, user, worldCity);
        } else if (location.includes(worldCity.country) && rank > 6) {
          geoLocation = { lat: worldCity.lat, lng: worldCity.lng };
          rank = 6;
          logWorldCity(rank, user, worldCity);
        }
      }

      return geoLocation;
    };

    const submit: () => Promise<void> = async () => {
      collaborators.value = [];
      errorMessage.value = undefined;

      if (!githubToken.value || !repoOwner.value || !repoName.value) {
        return;
      }

      try {
        let hasNextPage: boolean = true;
        let after: string | null = null;
        const users: User[] = [];

        do {
          const response: RepositoryResponse = await getMentionableUsers({
            owner: repoOwner.value,
            name: repoName.value,
            token: githubToken.value,
            after
          });

          hasNextPage = response.repository.mentionableUsers.pageInfo.hasNextPage;
          after = response.repository.mentionableUsers.pageInfo.endCursor;

          const mentionableUsers: User[] = response.repository.mentionableUsers.nodes;
          if (mentionableUsers.length > 0) {
            for (const collaborator of mentionableUsers) {
              collaborator.geolocation = findGeoLocation(collaborator);
            }
            users.push(...mentionableUsers);
          }
        } while (hasNextPage);

        collaborators.value = users;
      } catch (error) {
        console.error(error);
        errorMessage.value = error.message;
      }
    };

    watch([githubToken, search], async ([tokenValue, searchValue]) => {
      repositories.value = [];
      errorMessage.value = undefined;

      if (!tokenValue || !searchValue) {
        return;
      }

      try {
        const response: SearchRepositoriesResponse = await searchRepositories({
          token: tokenValue,
          search: searchValue
        });

        repositories.value = response.search.nodes.map((node) => node.nameWithOwner);
      } catch (error) {
        console.error(error);
        errorMessage.value = error.message;
      }
    });

    onMounted(() => {
      import('@/assets/worldcities.json').then((module) => {
        worldCities.push(...module.default);
        // console.log(worldcitiesCsv);
      });
    });

    return { githubToken, search, repositories, mode, collaborators, errorMessage, submit };
  }
});
</script>
