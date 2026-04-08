import { RepoEntry } from "./types";

const DEFAULT_HOST = "github.com";

/**
 * repos 입력을 파싱한다.
 *
 * 지원 형식:
 * - org/repo → github.com 기본 호스트, 기본 토큰
 * - host/org/repo → 명시적 호스트, 기본 토큰
 * - org/repo:token → github.com 기본 호스트, 토큰 오버라이드
 * - host/org/repo:token → 명시적 호스트, 토큰 오버라이드
 */
export function parseRepos(input: string, defaultToken: string): RepoEntry[] {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("No repos provided");
  }

  return lines.map((line) => parseLine(line, defaultToken));
}

function parseLine(line: string, defaultToken: string): RepoEntry {
  // 슬래시가 없으면 유효하지 않은 형식
  const firstSlash = line.indexOf("/");
  if (firstSlash === -1) {
    throw new Error(`잘못된 repo 형식: "${line}". org/repo 또는 host/org/repo 형식이어야 합니다`);
  }

  // 마지막 슬래시 이후에 콜론이 있으면 토큰 분리
  const lastSlash = line.lastIndexOf("/");
  const colonIndex = line.indexOf(":", lastSlash);

  let path: string;
  let token: string;

  if (colonIndex === -1) {
    path = line;
    token = defaultToken;
  } else {
    path = line.substring(0, colonIndex);
    token = line.substring(colonIndex + 1);
  }

  // 슬래시 개수로 호스트 유무 판단
  const segments = path.split("/");

  if (segments.length === 2) {
    // org/repo → github.com 기본값
    validateSegments(segments, line);
    return { host: DEFAULT_HOST, repo: path, token };
  }

  if (segments.length === 3) {
    // host/org/repo → 명시적 호스트
    validateSegments(segments, line);
    const host = segments[0];
    const repo = `${segments[1]}/${segments[2]}`;
    return { host, repo, token };
  }

  throw new Error(`잘못된 repo 형식: "${line}". org/repo 또는 host/org/repo 형식이어야 합니다`);
}

function validateSegments(segments: string[], original: string): void {
  if (segments.some((s) => s.length === 0)) {
    throw new Error(`잘못된 repo 형식: "${original}". 빈 세그먼트가 있습니다`);
  }
}
