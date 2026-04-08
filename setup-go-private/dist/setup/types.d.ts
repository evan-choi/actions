export interface RepoEntry {
    /** Git 호스트 (예: github.com) */
    host: string;
    /** owner/repo 형식의 저장소 */
    repo: string;
    /** 이 repo에 대한 GitHub PAT */
    token: string;
}
/** host → { owner/repo → token } 매핑 */
export type CredentialsConfig = Record<string, Record<string, string>>;
