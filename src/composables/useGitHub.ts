import type { User } from '@/shared/User';
// eslint-disable-next-line import/no-unresolved
import { graphql } from 'https://cdn.skypack.dev/@octokit/graphql';

export interface SearchRepositoriesQueryParams {
  search: string;
  token: string;
}

export interface SearchRepositoriesResponse {
  search: {
    nodes: Array<{
      id: string;
      name: string;
      owner: { login: string };
      nameWithOwner: string;
    }>;
  };
}

export interface GetMentionableUsersQueryParams {
  owner: string;
  name: string;
  token: string;
  after: string | null;
}

export interface RepositoryResponse {
  repository: {
    mentionableUsers: {
      nodes: User[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      totalCount: number;
    };
  };
}

export interface UseGitHub {
  searchRepositories(queryParams: SearchRepositoriesQueryParams): Promise<SearchRepositoriesResponse>;
  getMentionableUsers(queryParams: GetMentionableUsersQueryParams): Promise<RepositoryResponse>;
}

export default function useGitHub(): UseGitHub {
  const searchRepositories: (queryParams: SearchRepositoriesQueryParams) => Promise<SearchRepositoriesResponse> = ({
    search,
    token
  }) =>
    graphql(
      `
        query searchRepositories($search: String!) {
          search(type: REPOSITORY, query: $search, first: 5) {
            nodes {
              ... on Repository {
                id
                name
                owner {
                  login
                }
                nameWithOwner
              }
            }
          }
        }
      `,
      {
        headers: {
          authorization: `token ${token}`
        },
        search
      }
    );

  const getMentionableUsers: (queryParams: GetMentionableUsersQueryParams) => Promise<RepositoryResponse> = ({
    owner,
    name,
    token,
    after = null
  }) =>
    graphql(
      `
        query getMentionableUsers($owner: String!, $name: String!, $after: String) {
          repository(owner: $owner, name: $name) {
            mentionableUsers(first: 100, after: $after) {
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
                endCursor
              }
              totalCount
            }
          }
        }
      `,
      {
        headers: {
          authorization: `token ${token}`
        },
        owner,
        name,
        after
      }
    );

  return { searchRepositories, getMentionableUsers };
}
