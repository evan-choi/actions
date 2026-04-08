import { RepoEntry } from "./types";
/**
 * repos 입력을 파싱한다.
 *
 * 지원 형식:
 * - org/repo → github.com 기본 호스트, 기본 토큰
 * - host/org/repo → 명시적 호스트, 기본 토큰
 * - org/repo:token → github.com 기본 호스트, 토큰 오버라이드
 * - host/org/repo:token → 명시적 호스트, 토큰 오버라이드
 */
export declare function parseRepos(input: string, defaultToken?: string): RepoEntry[];
