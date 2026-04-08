<div align="center">

<h1>evan-choi/actions</h1>

<p><strong>A curated collection of GitHub Actions for modern development workflows.</strong></p>

<p>
  <a href="https://github.com/evan-choi/actions/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&labelColor=000000" alt="License"></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white&labelColor=000000" alt="GitHub Actions"></a>
</p>

<p>
  <a href="#available-actions">Actions</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#quick-start">Quick Start</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#contributing">Contributing</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="README.ko.md">한국어</a>
</p>

</div>

<br>

## Available Actions

| Action | Description | Version |
|--------|-------------|:-------:|
| **[setup-go-private](setup-go-private)** | Authenticate private Go modules with per-repo token support | `v1` |

---

## setup-go-private

Configures a git credential helper for private Go module authentication.
Supports **per-repository tokens** and **GitHub Enterprise** hosts.

### Quick Start

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

### Inputs

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

### Per-Repo Tokens

Set a default token and override only where needed:

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

### How It Works

1. **Setup** &mdash; Creates a git credential helper script in `$RUNNER_TEMP` and registers it via environment variables
2. **Configure** &mdash; Maps each repo to its token and sets `GOPRIVATE` to bypass the public Go proxy
3. **Cleanup** &mdash; Post-job step automatically removes all generated credential files

> [!TIP]
> No persistent git config changes. No background processes. Just clean, scoped authentication that disappears when the job ends.

---

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

---

## Contributing

Contributions are welcome! Feel free to open an [issue](https://github.com/evan-choi/actions/issues) or submit a pull request.

## License

Released under the [MIT License](LICENSE).
