<template lang="pug">
h1 GitHub Contributors Map
div
  p
    a(href="https://github.com/Shinigami92/github-contributors-map", target="_blank") GitHub Repo
  p You need a GitHub private access token:
    |
    |
    a(
      href="https://github.com/settings/tokens/new?description=GitHub%20Contributors%20Map&scopes=public_repo",
      target="_blank"
    ) Generate a personal token
  form(@submit.prevent="submit")
    label(for="personal-github-token") Your GitHub Token:
    input#personal-github-token(
      v-model="githubToken",
      name="personal-github-token",
      placeholder="ghp_************************************"
    )
    label(for="search-repo") Search Repo:
    input#search-repo(v-model="search", name="search-repo", placeholder="owner/name", list="repositories")
    datalist#repositories
      option(v-for="repository in repositories") {{ repository }}
    button(type="submit") Search
template(v-if="!errorMessage")
  h2 Collaborators
  ThreeCanvas(:users="collaborators")
  table
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
</template>

<script lang="ts">
import ThreeCanvas from '@/components/ThreeCanvas.vue';
import type { Geolocation } from '@/shared/Geolocation';
import type { User } from '@/shared/User';
import type { WorldCity } from '@/shared/WorldCity';
import type { Ref } from 'vue';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import type { RepositoryResponse, SearchRepositoriesResponse } from './composables/useGitHub';
import useGitHub from './composables/useGitHub';

function logWorldCity(rank: number, user: User, worldCity: WorldCity): void {
  console.log(
    // eslint-disable-next-line max-len
    `Found (${rank}): ${user.name}, "${user.location}" -> "${worldCity.city}", "${worldCity.adminName}", "${worldCity.country}" (${worldCity.lat}, ${worldCity.lng})`
  );
}

export default defineComponent({
  name: 'App',
  components: { ThreeCanvas },
  setup() {
    const githubToken: Ref<string> = ref('');
    const search: Ref<string> = ref('vitejs/vite');

    const repoOwner: Ref<string> = computed(() => search.value.split('/')[0] ?? '');
    const repoName: Ref<string> = computed(() => search.value.split('/')[1] ?? '');

    const { searchRepositories, getMentionableUsers } = useGitHub();

    const repositories: Ref<string[]> = ref([]);
    const collaborators: Ref<User[]> = ref([]);

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

    return { githubToken, search, repositories, collaborators, errorMessage, submit };
  }
});
</script>
