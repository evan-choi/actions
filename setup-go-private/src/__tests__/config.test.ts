import { describe, it, expect } from "vitest";
import { parseRepos } from "../config";

describe("parseRepos", () => {
  it("parses single repo with default token", () => {
    const result = parseRepos("org/repo-a", "default-token");
    expect(result).toEqual([{ repo: "org/repo-a", token: "default-token" }]);
  });

  it("parses single repo with explicit token", () => {
    const result = parseRepos("org/repo-a:custom-token", "default-token");
    expect(result).toEqual([{ repo: "org/repo-a", token: "custom-token" }]);
  });

  it("parses multiple repos (multiline)", () => {
    const input = `
      org/repo-a
      org/repo-b:token-b
    `;
    const result = parseRepos(input, "default-token");
    expect(result).toEqual([
      { repo: "org/repo-a", token: "default-token" },
      { repo: "org/repo-b", token: "token-b" },
    ]);
  });

  it("ignores blank lines and whitespace", () => {
    const input = `
      org/repo-a

      org/repo-b
    `;
    const result = parseRepos(input, "default-token");
    expect(result).toHaveLength(2);
  });

  it("allows colons in token value", () => {
    const result = parseRepos("org/repo:abc:def:ghi", "default-token");
    expect(result).toEqual([{ repo: "org/repo", token: "abc:def:ghi" }]);
  });

  it("throws on invalid repo format (no slash)", () => {
    expect(() => parseRepos("invalid-repo", "token")).toThrow(
      /invalid repo format/i
    );
  });

  it("throws on empty repos input", () => {
    expect(() => parseRepos("", "token")).toThrow(/no repos/i);
  });

  it("throws on empty line content with only whitespace", () => {
    expect(() => parseRepos("   \n  \n  ", "token")).toThrow(/no repos/i);
  });
});
