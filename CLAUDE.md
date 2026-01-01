# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

---

## ⚠️ FIRST ACTION

**세션 시작 시 `.claude/session-status.log` 파일을 읽어라.**

```bash
cat .claude/session-status.log
```

이 파일에 현재 세션의 ✅ 동작 기능, ⚠️ 문제, 🔧 해결방법이 기록되어 있다.
파일이 없으면 `/verify` 실행.

---

## CRITICAL CLAIMS

이 환경의 핵심 제약사항:

| Claim | 사실 |
|-------|------|
| `NO_LOCALHOST` | localhost 접근 불가 → Netlify 프리뷰 사용 |
| `HTTP_MCP_ONLY` | stdio MCP 불가 → `.mcp.json`의 HTTP MCP만 사용 |
| `SESSION_EPHEMERAL` | 세션 종료 시 상태 소멸 → Git commit이 유일한 영속성 |
| `GIT_IS_PERSISTENCE` | 모든 변경은 commit → push로 저장 |

자세한 Claims는 `docs/CLAIMS.md` 참조.

---

## User Setup (Claude가 할 수 없는 것)

1. **GitHub**: 템플릿 fork → claude.ai/code 연결
2. **Netlify**: 계정 생성 → GitHub 저장소 연결 → Deploy Previews 활성화
3. **환경변수**: 환경 선택기에서 `NETLIFY_SITE_ID=your-id` 설정
4. **MCP 인증**: 세션에서 `/mcp` 실행 → OAuth 팝업 승인

---

## Commands

| Command | Description |
|---------|-------------|
| `/init-project <framework>` | React/Vue/Svelte/Next.js/Astro 초기화 |
| `/preview` | Netlify 프리뷰 URL 확인 |
| `/check-env` | 환경변수 검증 |
| `/verify` | 템플릿 설정 검증 |

---

## MCP Servers (HTTP Only)

**OAuth 필요:**
- `github`, `figma`, `netlify`, `notion`

**인증 불필요:**
- `exa-search`, `aws-docs`, `huggingface`

설정: `.mcp.json` 참조

---

## Workflow

```
1. 세션 시작 → session-status.log 확인
2. /mcp로 OAuth 인증 (필요시)
3. 개발 작업
4. PR 생성 → Netlify 프리뷰 자동 생성
5. WebFetch로 프리뷰 검증
6. commit → push
```
