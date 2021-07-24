<template lang="pug">
h1 GitHub Contributors Map
div
  form
    label(for="personal-github-token") Your GitHub Token:
    input#personal-github-token(v-model="githubToken", name="personal-github-token")
    label(for="repo-owner") Repository Owner:
    input#repo-owner(v-model="repoOwner", name="repo-owner", placeholder="owner")
    label(for="repo-name") Repository Name:
    input#repo-name(v-model="repoName", name="repo-name", placeholder="name")
template(v-if="!errorMessage")
  h2 Collaborators
  ThreeCanvas
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
import type { User } from '@/shared/User';
// eslint-disable-next-line import/no-unresolved
import { graphql } from 'https://cdn.skypack.dev/@octokit/graphql';
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { Geolocation } from './shared/Geolocation';

interface RepositoryResponse {
  repository: {
    collaborators: {
      nodes: User[];
      pageInfo: {
        hasNextPage: boolean;
      };
      totalCount: number;
    };
    mentionableUsers: {
      nodes: User[];
      pageInfo: {
        hasNextPage: boolean;
      };
      totalCount: number;
    };
  };
}

export default defineComponent({
  name: 'App',
  components: { ThreeCanvas },
  setup() {
    const githubToken: Ref<string> = ref('');
    const repoOwner: Ref<string> = ref('vitejs');
    const repoName: Ref<string> = ref('vite');

    const collaborators: Ref<User[]> = ref([]);

    const errorMessage: Ref<string | undefined> = ref();

    let worldcitiesCsv: string = '';

    const findGeoLocation: (user: User) => Geolocation | undefined = (user) => {
      const { location } = user;
      if (!location) {
        return undefined;
      }
      console.log(location);
      let index: number = worldcitiesCsv.indexOf(location);
      // console.log({ index });
      if (index > 0) {
        const startIndex: number = worldcitiesCsv.slice(0, index).lastIndexOf('\n');
        const endIndex: number = worldcitiesCsv.indexOf('\n', index);
        const line: string = worldcitiesCsv.slice(startIndex + 1, endIndex - 1);
        const parts: string[] = line.split(',').map((cell) => cell.slice(1, -1));
        // console.log({ startIndex, endIndex, line, lat, lng });
        return { lat: Number(parts[2]), lng: Number(parts[3]) };
      }
      return undefined;
    };

    watch(
      [githubToken, repoOwner, repoName],
      async () => {
        collaborators.value = [];
        errorMessage.value = undefined;

        try {
          const response: RepositoryResponse = await graphql(
            `
              query ($repoOwner: String!, $repoName: String!) {
                repository(owner: $repoOwner, name: $repoName) {
                  collaborators {
                    nodes {
                      id
                      login
                      name
                      avatarUrl
                      location
                      url
                    }
                    pageInfo {
                      hasNextPage
                    }
                    totalCount
                  }
                  mentionableUsers(first: 10) {
                    nodes {
                      id
                      login
                      name
                      avatarUrl
                      location
                      url
                    }
                    pageInfo {
                      hasNextPage
                    }
                    totalCount
                  }
                }
              }
            `,
            {
              headers: {
                authorization: `token ${githubToken.value}`
              },
              repoOwner: repoOwner.value,
              repoName: repoName.value
            }
          );
          console.log(response);
          collaborators.value = response.repository.collaborators.nodes;
          for (const collaborator of collaborators.value) {
            collaborator.geolocation = findGeoLocation(collaborator);
          }
        } catch (error) {
          console.error(error);
          errorMessage.value = error.message;
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      import('@/assets/worldcities/worldcities.csv?raw').then((module) => {
        worldcitiesCsv = module.default;
        console.log(worldcitiesCsv);
      });
    });

    return { githubToken, repoOwner, repoName, collaborators, errorMessage };
  }
});
</script>
