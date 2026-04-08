export interface RepoEntry {
  /** Repository in owner/repo format */
  repo: string;
  /** GitHub PAT for this repo */
  token: string;
}

export interface CredentialsConfig {
  /** Git host (e.g. github.com) */
  host: string;
  /** Map of owner/repo → token */
  repos: Record<string, string>;
}
