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
template(v-else)
  span(v-text="errorMessage")
</template>

<script lang="ts">
import type { User } from '@/shared/User';
// eslint-disable-next-line import/no-unresolved
import { graphql } from 'https://cdn.skypack.dev/@octokit/graphql';
import type { Ref } from 'vue';
import { defineComponent, ref, watch } from 'vue';

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
    const githubToken: Ref<string> = ref('');
    const repoOwner: Ref<string> = ref('vitejs');
    const repoName: Ref<string> = ref('vite');

    const collaborators: Ref<User[]> = ref([]);

    const errorMessage: Ref<string | undefined> = ref();

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
        } catch (error) {
          console.error(error);
          errorMessage.value = error.message;
        }
      },
      { immediate: true }
    );

    return { githubToken, repoOwner, repoName, collaborators, errorMessage };
  }
});
</script>
