import { describe, it, expect } from "vitest";
import { parseRepos } from "../config";

describe("parseRepos", () => {
  it("org/repo → github.com 기본 호스트, 기본 토큰", () => {
    const result = parseRepos("org/repo-a", "default-token");
    expect(result).toEqual([
      { host: "github.com", repo: "org/repo-a", token: "default-token" },
    ]);
  });

  it("org/repo:token → github.com 기본 호스트, 토큰 오버라이드", () => {
    const result = parseRepos("org/repo-a:custom-token", "default-token");
    expect(result).toEqual([
      { host: "github.com", repo: "org/repo-a", token: "custom-token" },
    ]);
  });

  it("host/org/repo → 명시적 호스트, 기본 토큰", () => {
    const result = parseRepos(
      "github.mycompany.com/org/repo-a",
      "default-token"
    );
    expect(result).toEqual([
      {
        host: "github.mycompany.com",
        repo: "org/repo-a",
        token: "default-token",
      },
    ]);
  });

  it("host/org/repo:token → 명시적 호스트, 토큰 오버라이드", () => {
    const result = parseRepos(
      "github.mycompany.com/org/repo-a:ghe-token",
      "default-token"
    );
    expect(result).toEqual([
      {
        host: "github.mycompany.com",
        repo: "org/repo-a",
        token: "ghe-token",
      },
    ]);
  });

  it("멀티라인 혼합 형식", () => {
    const input = `
      org/repo-a
      org/repo-b:token-b
      github.mycompany.com/org/repo-c
    `;
    const result = parseRepos(input, "default-token");
    expect(result).toEqual([
      { host: "github.com", repo: "org/repo-a", token: "default-token" },
      { host: "github.com", repo: "org/repo-b", token: "token-b" },
      {
        host: "github.mycompany.com",
        repo: "org/repo-c",
        token: "default-token",
      },
    ]);
  });

  it("빈 줄과 공백 무시", () => {
    const input = `
      org/repo-a

      org/repo-b
    `;
    const result = parseRepos(input, "default-token");
    expect(result).toHaveLength(2);
  });

  it("토큰에 콜론 포함 허용", () => {
    const result = parseRepos("org/repo:abc:def:ghi", "default-token");
    expect(result).toEqual([
      { host: "github.com", repo: "org/repo", token: "abc:def:ghi" },
    ]);
  });

  it("슬래시 없는 형식은 에러", () => {
    expect(() => parseRepos("invalid-repo", "token")).toThrow(/Invalid repo format/);
  });

  it("빈 입력은 에러", () => {
    expect(() => parseRepos("", "token")).toThrow(/no repos/i);
  });

  it("공백만 있는 입력은 에러", () => {
    expect(() => parseRepos("   \n  \n  ", "token")).toThrow(/no repos/i);
  });

  it("4개 이상 세그먼트는 에러", () => {
    expect(() => parseRepos("a/b/c/d", "token")).toThrow(/Invalid repo format/);
  });

  it("기본 토큰 없이 명시 토큰만으로 동작", () => {
    const result = parseRepos("org/repo-a:explicit-token");
    expect(result).toEqual([
      { host: "github.com", repo: "org/repo-a", token: "explicit-token" },
    ]);
  });

  it("기본 토큰도 명시 토큰도 없으면 에러", () => {
    expect(() => parseRepos("org/repo-a")).toThrow(/No token/);
  });
});
