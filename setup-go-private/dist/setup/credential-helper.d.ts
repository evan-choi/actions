import type { RepoEntry, CredentialsConfig } from "./types";
/**
 * RepoEntry 배열로부터 credentials 설정을 생성한다.
 * 형식: { [host]: { [owner/repo]: token } }
 */
export declare function createCredentialsConfig(entries: RepoEntry[]): CredentialsConfig;
/**
 * git credential helper로 동작하는 독립 Node.js 스크립트의 소스 코드를 반환한다.
 *
 * 같은 디렉토리의 go-private-credentials.json을 읽어
 * git credential "get" 요청에 응답한다.
 */
export declare function getHelperSource(): string;
