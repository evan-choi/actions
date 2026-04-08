<div align="center">

<h1>setup-go-private</h1>

<p><strong>GitHub Actions를 위한 private Go 모듈 인증.</strong></p>

<p>
  <a href="https://github.com/evan-choi/actions/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&labelColor=000000" alt="License"></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/node24-runtime-green?style=for-the-badge&labelColor=000000" alt="Node 24"></a>
</p>

<p>
  <a href="#빠른-시작">빠른 시작</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#입력">입력</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#예제">예제</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#동작-방식">동작 방식</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#faq">FAQ</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="README.md">English</a>
</p>

</div>

<br>

`go mod download`가 private 모듈에 접근할 수 있도록 git credential helper를 설정합니다. **repo별 토큰 오버라이드**와 **GitHub Enterprise** 호스트를 지원하며, job 완료 후 자격 증명은 **자동으로 정리**됩니다.

## 빠른 시작

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

## 입력

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

> [!NOTE]
> `repos`의 빈 줄과 앞뒤 공백은 무시됩니다.

## 예제

### Repo별 토큰

대부분의 repo가 같은 토큰을 사용하면 기본값으로 설정하고, 특정 repo만 오버라이드:

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

### 복수 호스트

GitHub.com과 GitHub Enterprise repo를 한 step에서 혼합:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    repos: |
      github.mycompany.com/org/internal-sdk:${{ secrets.GHE_TOKEN }}
      org/oss-private:${{ secrets.GITHUB_TOKEN }}
```

## 동작 방식

```mermaid
graph LR
    A(Setup) --> B(Configure) --> C(Cleanup)

    style A fill:#2088FF,stroke:none,color:#fff
    style B fill:#2088FF,stroke:none,color:#fff
    style C fill:#2088FF,stroke:none,color:#fff
```

| 단계 | 설명 |
|------|------|
| **Setup** | `$RUNNER_TEMP`에 git credential helper 스크립트를 생성하고 환경변수로 등록 |
| **Configure** | 각 repo를 토큰에 매핑하고 `GOPRIVATE`를 설정하여 public Go proxy 우회 |
| **Cleanup** | job 완료 후 생성된 모든 자격 증명 파일을 자동 삭제 |

> [!TIP]
> git config 변경 없음. 백그라운드 프로세스 없음. job이 끝나면 사라지는 깔끔하고 범위가 제한된 인증.

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

<details>
<summary><b><code>GITHUB_TOKEN</code>을 PAT 대신 사용할 수 있나요?</b></summary>
<br>

`GITHUB_TOKEN`은 현재 repo에만 범위가 제한됩니다. 다른 repo의 private 모듈에 접근하려면 `repo` 스코프가 있는 PAT (classic 또는 fine-grained)이나 repo별 토큰이 필요합니다.

</details>

---

<div align="center">
  <a href="..">← Actions 목록으로</a>
</div>
