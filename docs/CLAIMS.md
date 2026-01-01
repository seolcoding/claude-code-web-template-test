# Claims (Verified Facts)

이 문서는 Web Claude Code 환경에서 검증된 사실들을 기록합니다.
CLAUDE.md에서 참조됩니다.

---

## 환경 제약

| Claim ID | 사실 | 근거 |
|----------|------|------|
| `NO_LOCALHOST` | localhost:* 접근 불가. dev server 실행해도 외부에서 볼 수 없음 | 공식 문서: 격리된 VM |
| `HTTP_MCP_ONLY` | stdio MCP 불가. npx로 로컬 프로세스 실행하는 MCP 작동 안함 | 샌드박스 제한 |
| `GITHUB_ONLY` | GitLab 등 비-GitHub 저장소는 클라우드 세션 불가 | 공식 문서 명시 |
| `SESSION_EPHEMERAL` | 세션 종료 시 상태 소멸. Git commit만이 영속성 보장 | 격리된 VM 특성 |

---

## 환경 설정

| Claim ID | 사실 | 근거 |
|----------|------|------|
| `ENV_CONFIGURABLE` | 환경 선택기에서 .env 형식으로 환경변수 설정 가능 | 공식 문서 |
| `SESSION_START_HOOK` | SessionStart 훅으로 스크립트 자동 실행 가능 | 공식 문서 |
| `REMOTE_CHECK` | `$CLAUDE_CODE_REMOTE=true`로 원격/로컬 구분 가능 | 공식 문서 |
| `ENV_FILE_PERSIST` | `$CLAUDE_ENV_FILE`에 작성하면 후속 명령에서 환경변수 유지 | 공식 문서 |

---

## 네트워크

| Claim ID | 사실 | 근거 |
|----------|------|------|
| `NETWORK_ALLOWLIST` | 기본 허용 목록 도메인만 접근 가능 (npm, pypi, github 등) | 공식 문서 |
| `CUSTOM_NETWORK` | 환경 설정에서 네트워크 액세스 수준 변경 가능 | 공식 문서 |
| `PROXY_REQUIRED` | 모든 HTTP/HTTPS 트래픽은 보안 프록시 통과 | 공식 문서 |

---

## 워크플로우 규칙

| Claim ID | 사실 |
|----------|------|
| `GIT_IS_PERSISTENCE` | 모든 변경사항은 Git commit → push로 영속화해야 함 |
| `SKILL_NEW_SESSION` | 스킬/MCP 변경 후 새 세션 필요 (/clear 또는 새 Task) |
| `NETLIFY_FOR_PREVIEW` | 시각적 확인은 Netlify/Vercel 프리뷰 URL로만 가능 |
| `PR_AUTO_PREVIEW` | PR 생성 시 Netlify가 프리뷰 URL 자동 생성 |

---

## 유저 책임 (Claude가 할 수 없는 것)

| 항목 | 이유 |
|------|------|
| GitHub 저장소 연결 | OAuth 팝업 승인 필요 |
| 환경 선택기에서 환경변수 설정 | 웹 UI 조작 필요 |
| MCP OAuth 인증 (/mcp) | 브라우저 팝업 승인 필요 |
| Netlify 연결 | 외부 서비스 설정 필요 |
| 시각적 UI 확인 | 스크린샷 도구 없음 |
