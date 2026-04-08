# setup-go-private

GitHub Action to authenticate private Go modules using per-repo token support.

Configures a git credential helper and `.netrc` for seamless `go mod download` of private modules. Automatically cleans up credentials after the job completes.

## Usage

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

  - run: go mod download
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `token` | Yes | — | Default GitHub PAT for repo authentication |
| `repos` | Yes | — | Private repos (one per line). `owner/repo` or `owner/repo:token` |
| `host` | No | `github.com` | Git host for GitHub Enterprise support |

## How It Works

1. **Setup** generates a git credential helper script and a `.netrc` file in `$RUNNER_TEMP`
2. Git is configured via environment variables to use the credential helper with `useHttpPath` enabled
3. Each repo is mapped to its token — repos without an explicit token use the default `token` input
4. `GOPRIVATE` is set automatically so Go skips the public proxy for these modules
5. **Post** step automatically removes all generated files

## Per-Repo Tokens

If most repos share the same token, set it as the default. Override individual repos with `owner/repo:token` syntax:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.DEFAULT_TOKEN }}
    repos: |
      org/repo-a
      org/repo-b
      org/special-repo:${{ secrets.SPECIAL_TOKEN }}
```

## GitHub Enterprise

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.GHE_TOKEN }}
    repos: org/private-repo
    host: github.mycompany.com
```

## License

MIT
