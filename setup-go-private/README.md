# setup-go-private

private Go 모듈 인증을 위한 GitHub Action. repo별 토큰을 지원합니다.

git credential helper를 설정하여 `go mod download`가 private 모듈에 접근할 수 있도록 합니다. job 완료 후 자격 증명은 자동으로 정리됩니다.

## 사용법

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

## 입력

| 입력 | 필수 | 설명 |
|------|------|------|
| `token` | X | 기본 GitHub PAT. 토큰 오버라이드가 없는 repo에 적용 |
| `repos` | O | private repo 목록 (줄 단위). 아래 형식 참고 |

### `repos` 형식

```
org/repo                        # github.com 기본 호스트, 기본 토큰
org/repo:token                  # github.com 기본 호스트, 토큰 오버라이드
host/org/repo                   # 명시적 호스트, 기본 토큰
host/org/repo:token             # 명시적 호스트, 토큰 오버라이드
```

## 동작 방식

1. **Setup** 단계에서 git credential helper 스크립트를 `$RUNNER_TEMP`에 생성
2. 환경변수를 통해 git이 credential helper를 사용하도록 설정 (`useHttpPath` 활성화)
3. 각 repo를 토큰에 매핑 — 별도 토큰이 없는 repo는 기본 `token` 입력값 사용
4. `GOPRIVATE`를 자동 설정하여 Go가 해당 모듈에 대해 public proxy를 건너뜀
5. **Post** 단계에서 생성된 모든 파일을 자동 삭제

## repo별 토큰

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

## GitHub Enterprise

호스트를 repo 앞에 명시:

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.GHE_TOKEN }}
    repos: |
      github.mycompany.com/org/private-repo
      org/public-github-repo
```

## 라이선스

MIT
