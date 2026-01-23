# Contribution Guide

## 브랜치 전략 (Branch Strategy)
이 프로젝트는 **GitHub Flow**를 따릅니다.
- `main`: 언제든 배포 가능한 상태를 유지합니다.
- 새로운 기능 개발이나 버그 수정 시 `main` 브랜치에서 새로운 브랜치를 생성합니다. (예: `feat/login`, `fix/header`)
- 작업 완료 후 PR(Pull Request)을 통해 `main`에 병합합니다.

---

## 📌 커밋 메시지 헤더 (Header)

형식: `Type: Subject`

### Commit Type

| Tag | Meaning |
| --- | --- |
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | README 문서 수정 등 문서에 관련된 모든 commit |
| style | formatting changes, missing semicolons 등 스타일만 수정한 경우 |
| refactor | 코드 리팩토링 |
| test | 테스트 코드와 관련된 모든 것 |
| design | CSS 등 UI 디자인을 변경한 경우 |
| rename | 파일/폴더명을 수정한 경우 |
| build | 빌드 관련 파일 수정 / 모듈 설치 또는 삭제에 대한 commit |
| chore | .gitignore, .gitattributes 등 configuration 수정과 같은 자잘한 commit |
| remove | 코드(파일) 의 삭제가 있는 경우 ("Clean", "Eliminate" 를 사용하기도 함) |
| comment | 필요한 주석 추가 및 변경 |
| move | 코드의 이동이 있는 경우 |
| perf | 성능 개선에 대한 commit |
| add | 코드나 테스트, 예제, 문서 등의 추가 생성이 있는 경우 |
| improve | 호환성, 검증 기능, 접근성 등 향상이 있는 경우 |
| implement | 코드가 추가된 정도보다 더 주목할만한 구현체를 완성시켰을 때 |

### Scope (선택 사항)
- 영향을 받는 code section을 설명하는 명사

### Subject
- 코드 변경 사항에 대한 짧은 설명
- **50자** 이내 권장
- **대문자**로 시작
- 마침표로 끝내지 않음
- 명령문 사용 (예: "Add feature" O, "Added feature" X)

## 📑 본문 (Body) (선택 사항)
- 부연 설명이 필요하거나 commit의 이유를 설명할 경우 작성
- 무엇을 변경했는 지, 왜 변경했는 지 설명
- 제목과 본문 사이 공백 줄 필수
- 각 줄은 72자 이내로 줄바꿈 권장

## 🚀 푸터 (Footer) (선택 사항)
- Issue Tracker ID 작성 시 사용
- [`keyword #issue-number`](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)로 PR시 직접 issue와 상호작용 가능

### Issue Tracker Keywords

| Keyword | Meaning |
| --- | --- |
| Closes | issue 닫기 |
| Fixes | issue 수정 중 (아직 해결되지 않은 경우) |
| Ref | 참고할 issue가 있을 때 |
| Resolves | issue를 해결했을 때 |
| Related to | 해당 commit에 관련된 issue 번호 |

- 여러 개의 issue 번호는 쉼표(,)로 구분
- 외부 repository의 issue는 `OWNER/REPOSITORY#ISSUE-NUMBER` 형태로 사용

# 👉 예시 (Examples)

```text
feat: Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. In some contexts, the first line is treated as the
subject of the commit and the rest of the text as the body. The
blank line separating the summary from the body is critical (unless
you omit the body entirely); various tools like `log`, `shortlog`
and `rebase` can get confused if you run the two together.

Explain the problem that this commit is solving. Focus on why you
are making this change as opposed to how (the code explains that).
Are there side effects or other unintuitive consequences of this
change? Here's the place to explain them.

Resolves: #123
See also: #456, #789
```
