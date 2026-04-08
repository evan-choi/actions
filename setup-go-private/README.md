<div align="center">

<h1>setup-go-private</h1>

<p><strong>Private Go module authentication for GitHub Actions.</strong></p>

<p>
  <a href="https://github.com/evan-choi/actions/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&labelColor=000000" alt="License"></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/node20-runtime-green?style=for-the-badge&labelColor=000000" alt="Node 20"></a>
</p>

<p>
  <a href="#quick-start">Quick Start</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#inputs">Inputs</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#examples">Examples</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#how-it-works">How It Works</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#faq">FAQ</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="README.ko.md">한국어</a>
</p>

</div>

<br>

Configure git credential helpers so `go mod download` can access private modules seamlessly. Supports **per-repo token overrides** and **GitHub Enterprise** hosts. Credentials are **automatically cleaned up** after the job completes.

## Quick Start

```yaml
steps:
  - uses: actions/checkout@v4

  - uses: actions/setup-go@v5
    with:
      go-version: "1.23"

  - uses: evan-choi/actions/setup-go-private@v1
    with:
      token: ${{ secrets.GO_PRIVATE_TOKEN }}
      repos: |
        org/private-sdk
        org/internal-lib:${{ secrets.INTERNAL_LIB_TOKEN }}

  - run: go mod download  # private modules just work
```

## Inputs

| Input | Required | Description |
|-------|:--------:|-------------|
| `token` | | Default GitHub PAT applied to repos without an explicit token override |
| `repos` | **Yes** | Private repos to authenticate, one per line |

### Repo Format

```
org/repo                    # github.com + default token
org/repo:token              # github.com + custom token
host/org/repo               # explicit host + default token
host/org/repo:token         # explicit host + custom token
```

> [!NOTE]
> Blank lines and leading/trailing whitespace in `repos` are ignored.

## Examples

### Per-Repo Tokens

Most repos share a default token. Override only where needed:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.DEFAULT_TOKEN }}
    repos: |
      org/repo-a
      org/repo-b
      org/special-repo:${{ secrets.SPECIAL_TOKEN }}
```

### GitHub Enterprise

Prefix the host before the org/repo path:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.GHE_TOKEN }}
    repos: |
      github.mycompany.com/org/private-repo
      org/public-github-repo
```

### Multiple Hosts

Mix GitHub.com and GitHub Enterprise repos in a single step:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    repos: |
      github.mycompany.com/org/internal-sdk:${{ secrets.GHE_TOKEN }}
      org/oss-private:${{ secrets.GITHUB_TOKEN }}
```

## How It Works

```mermaid
graph LR
    A(Setup) --> B(Configure) --> C(Cleanup)

    style A fill:#2088FF,stroke:none,color:#fff
    style B fill:#2088FF,stroke:none,color:#fff
    style C fill:#2088FF,stroke:none,color:#fff
```

| Phase | Description |
|-------|-------------|
| **Setup** | Creates a git credential helper script in `$RUNNER_TEMP` and registers it via environment variables |
| **Configure** | Maps each repo to its token and sets `GOPRIVATE` to bypass the public Go proxy |
| **Cleanup** | Post-job step automatically removes all generated credential files |

> [!TIP]
> No persistent git config changes. No background processes. Just clean, scoped authentication that disappears when the job ends.

## FAQ

<details>
<summary><b>Why not just use <code>.netrc</code> or <code>git config</code> directly?</b></summary>
<br>

This action handles credential helper registration, `GOPRIVATE` configuration, and automatic cleanup in one step. It also supports per-repo token overrides, which is cumbersome to set up manually.

</details>

<details>
<summary><b>Does this work on all runner types?</b></summary>
<br>

Yes. The credential helper is a Node.js script, so it works on `ubuntu-*`, `macos-*`, and `windows-*` runners.

</details>

<details>
<summary><b>Are credentials safe?</b></summary>
<br>

Credentials are stored as temporary files in `$RUNNER_TEMP` and are automatically deleted in the post-job step. They never persist beyond the workflow run.

</details>

<details>
<summary><b>Can I use <code>GITHUB_TOKEN</code> instead of a PAT?</b></summary>
<br>

`GITHUB_TOKEN` is scoped to the current repo only. For cross-repo private module access, you need a PAT (classic or fine-grained) with `repo` scope, or separate tokens per repo.

</details>

---

<div align="center">
  <a href="..">← Back to actions</a>
</div>
