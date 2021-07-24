<template lang="pug">
h1 GitHub Contributors Map
h2 Collaborators
table
  thead
    tr
      th Avatar
      //- th ID
      th Login
      th Name
      th Location
      th URL
  tbody
    tr(v-for="collaborator in collaborators", :key="collaborator.id")
      td
        img(:src="collaborator.avatarUrl", width="128")
      //- td {{ collaborator.id }}
      td {{ collaborator.login }}
      td {{ collaborator.name }}
      td {{ collaborator.location }}
      td {{ collaborator.url }}
</template>

<script lang="ts">
import type { User } from '@/shared/User';
// eslint-disable-next-line import/no-unresolved
import { graphql } from 'https://cdn.skypack.dev/@octokit/graphql';
import type { Ref } from 'vue';
import { defineComponent, onBeforeMount, ref } from 'vue';

const TOKEN: string = import.meta.env.VITE_GITHUB_TOKEN as string;

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
  setup() {
    const collaborators: Ref<User[]> = ref([]);

    onBeforeMount(async () => {
      try {
        const response: RepositoryResponse = await graphql(
          `
            query {
              repository(owner: "vitejs", name: "vite") {
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
              authorization: `token ${TOKEN}`
            }
          }
        );
        console.log(response);
        collaborators.value = response.repository.collaborators.nodes;
      } catch (error) {
        console.error(error);
      }
    });

    return { collaborators };
  }
});
</script>
