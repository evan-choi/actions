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
  <a href="#usage">Usage</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#contributing">Contributing</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="README.ko.md">한국어</a>
</p>

</div>

<br>

## Available Actions

### [`setup-go-private`](setup-go-private) &nbsp; `v1`

> Authenticate private Go modules with per-repo token support.

Configure git credential helpers for `go mod download` to access private modules seamlessly. Supports **per-repo token overrides** and **GitHub Enterprise** hosts. Credentials are automatically cleaned up after the job.

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.GO_PRIVATE_TOKEN }}
    repos: |
      org/private-sdk
      org/internal-lib:${{ secrets.INTERNAL_LIB_TOKEN }}
```

<div align="right">
  <a href="setup-go-private/README.md">Documentation &rarr;</a>
</div>

---

## Usage

Each action is located in its own directory and can be referenced directly:

```yaml
- uses: evan-choi/actions/<action-name>@<version>
```

Refer to the individual action's README for detailed inputs, examples, and configuration options.

## Contributing

Contributions are welcome! Feel free to open an [issue](https://github.com/evan-choi/actions/issues) or submit a pull request.

## License

Released under the [MIT License](LICENSE).
