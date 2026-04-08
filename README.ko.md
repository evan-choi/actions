<div align="center">

<h1>evan-choi/actions</h1>

<p><strong>모던 개발 워크플로우를 위한 GitHub Actions 컬렉션.</strong></p>

<p>
  <a href="https://github.com/evan-choi/actions/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&labelColor=000000" alt="License"></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white&labelColor=000000" alt="GitHub Actions"></a>
</p>

<p>
  <a href="#제공-actions">Actions</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#빠른-시작">빠른 시작</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#기여">기여</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="README.md">English</a>
</p>

</div>

<br>

## 제공 Actions

| Action | 설명 | 버전 |
|--------|------|:----:|
| **[setup-go-private](setup-go-private)** | repo별 토큰을 지원하는 private Go 모듈 인증 | `v1` |

---

## setup-go-private

private Go 모듈 인증을 위한 git credential helper를 설정합니다.
**repo별 토큰**과 **GitHub Enterprise** 호스트를 지원합니다.

### 빠른 시작

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

  - run: go mod download  # private 모듈이 바로 동작합니다
```

### 입력

| 입력 | 필수 | 설명 |
|------|:----:|------|
| `token` | | 기본 GitHub PAT. 토큰 오버라이드가 없는 repo에 적용 |
| `repos` | **O** | 인증할 private repo 목록 (줄 단위) |

### Repo 형식

```
org/repo                    # github.com + 기본 토큰
org/repo:token              # github.com + 커스텀 토큰
host/org/repo               # 명시적 호스트 + 기본 토큰
host/org/repo:token         # 명시적 호스트 + 커스텀 토큰
```

### Repo별 토큰

기본 토큰을 설정하고 필요한 repo만 오버라이드:

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

호스트를 org/repo 앞에 명시:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.GHE_TOKEN }}
    repos: |
      github.mycompany.com/org/private-repo
      org/public-github-repo
```

### 동작 방식

1. **Setup** &mdash; `$RUNNER_TEMP`에 git credential helper 스크립트를 생성하고 환경변수로 등록
2. **Configure** &mdash; 각 repo를 토큰에 매핑하고 `GOPRIVATE`를 설정하여 public Go proxy 우회
3. **Cleanup** &mdash; job 완료 후 생성된 모든 자격 증명 파일을 자동 삭제

> [!TIP]
> git config 변경 없음. 백그라운드 프로세스 없음. job이 끝나면 사라지는 깔끔하고 범위가 제한된 인증.

---

## FAQ

<details>
<summary><b><code>.netrc</code>나 <code>git config</code>를 직접 설정하면 안 되나요?</b></summary>
<br>

이 action은 credential helper 등록, `GOPRIVATE` 설정, 자동 정리를 한 번에 처리합니다. repo별 토큰 오버라이드도 지원하므로 수동 설정보다 훨씬 간편합니다.

</details>

<details>
<summary><b>모든 러너 타입에서 동작하나요?</b></summary>
<br>

네. credential helper가 Node.js 스크립트이므로 `ubuntu-*`, `macos-*`, `windows-*` 러너 모두에서 동작합니다.

</details>

<details>
<summary><b>자격 증명은 안전한가요?</b></summary>
<br>

자격 증명은 `$RUNNER_TEMP`에 임시 파일로 저장되며, post-job 단계에서 자동 삭제됩니다. 워크플로우 실행이 끝나면 어디에도 남지 않습니다.

</details>

---

## 기여

기여를 환영합니다! [이슈](https://github.com/evan-choi/actions/issues)를 열거나 Pull Request를 제출해 주세요.

## 라이선스

[MIT License](LICENSE)로 배포됩니다.
