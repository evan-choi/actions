import type { RepoEntry, CredentialsConfig } from "./types";
export declare function createCredentialsConfig(host: string, entries: RepoEntry[]): CredentialsConfig;
/**
 * Returns the source code of a standalone Node.js script
 * that acts as a git credential helper.
 *
 * The script reads go-private-credentials.json from the same directory
 * and responds to git credential "get" requests.
 */
export declare function getHelperSource(): string;
