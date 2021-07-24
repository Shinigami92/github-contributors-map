export interface User {
  id: string;
  /** The username used to login. */
  login: string;
  /** The user's public profile name. */
  name: string;
  /** A URL pointing to the user's public avatar. */
  avatarUrl: string;
  /** The user's public profile location. */
  location: string | null;
  /** The HTTP URL for this user. */
  url: string;
}
