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
  <a href="#사용법">사용법</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="#기여">기여</a>
  <span>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
  <a href="README.md">English</a>
</p>

</div>

<br>

## 제공 Actions

### [`setup-go-private`](setup-go-private) &nbsp; `v1`

> repo별 토큰을 지원하는 private Go 모듈 인증.

`go mod download`가 private 모듈에 접근할 수 있도록 git credential helper를 설정합니다. **repo별 토큰 오버라이드**와 **GitHub Enterprise** 호스트를 지원하며, job 완료 후 자격 증명은 자동으로 정리됩니다.

```yaml
- uses: evan-choi/actions/setup-go-private@v1
  with:
    token: ${{ secrets.GO_PRIVATE_TOKEN }}
    repos: |
      org/private-sdk
      org/internal-lib:${{ secrets.INTERNAL_LIB_TOKEN }}
```

<div align="right">
  <a href="setup-go-private/README.md">문서 보기 &rarr;</a>
</div>

---

## 사용법

각 action은 독립된 디렉토리에 위치하며 직접 참조할 수 있습니다:

```yaml
- uses: evan-choi/actions/<action-name>@<version>
```

상세한 입력값, 예제, 설정 옵션은 각 action의 README를 참고해 주세요.

## 기여

기여를 환영합니다! [이슈](https://github.com/evan-choi/actions/issues)를 열거나 Pull Request를 제출해 주세요.

## 라이선스

[MIT License](LICENSE)로 배포됩니다.
