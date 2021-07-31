import type { User } from '@/shared/User';
// eslint-disable-next-line import/no-unresolved
import { graphql } from 'https://cdn.skypack.dev/@octokit/graphql';

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
  getMentionableUsers(params: GetMentionableUsersQueryParams): Promise<RepositoryResponse>;
}

export default function useGitHub(): UseGitHub {
  const getMentionableUsers: (queryParams: GetMentionableUsersQueryParams) => Promise<RepositoryResponse> = ({
    owner,
    name,
    token,
    after = null
  }) =>
    graphql(
      `
        query ($repoOwner: String!, $repoName: String!, $after: String) {
          repository(owner: $repoOwner, name: $repoName) {
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

  return { getMentionableUsers };
}
