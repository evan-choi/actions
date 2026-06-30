import { describe, expect, it } from "vitest";
import {
  buildPrivateRepoIdentityRewrites,
  hasOverridingInsteadOf,
} from "../git-config";

const repos = [
  { host: "github.com", repo: "chequer-io/duplo-go-sdk", token: "token" },
];

describe("hasOverridingInsteadOf", () => {
  it("host-wide insteadOf가 private repo URL을 덮으면 true", () => {
    const configs = [
      "url.https://old-token@github.com/.insteadof https://github.com/",
    ];

    expect(hasOverridingInsteadOf(repos, configs)).toBe(true);
  });

  it("private repo와 무관한 insteadOf는 false", () => {
    const configs = [
      "url.https://old-token@gitlab.com/.insteadof https://gitlab.com/",
    ];

    expect(hasOverridingInsteadOf(repos, configs)).toBe(false);
  });
});

describe("buildPrivateRepoIdentityRewrites", () => {
  it("host-wide rewrite보다 긴 repo-specific identity rewrite를 만든다", () => {
    expect(buildPrivateRepoIdentityRewrites(repos)).toEqual([
      {
        key: "url.https://github.com/chequer-io/duplo-go-sdk.insteadOf",
        value: "https://github.com/chequer-io/duplo-go-sdk",
      },
      {
        key: "url.https://github.com/chequer-io/duplo-go-sdk/.insteadOf",
        value: "https://github.com/chequer-io/duplo-go-sdk/",
      },
      {
        key: "url.https://github.com/chequer-io/duplo-go-sdk.git.insteadOf",
        value: "https://github.com/chequer-io/duplo-go-sdk.git",
      },
    ]);
  });
});
