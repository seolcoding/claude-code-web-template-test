# Troubleshooting Guide

장애 발생 시 복구 절차 가이드입니다.

---

## 의존성 설치 실패

### 증상
```
npm install failed
bun install failed
```

### 원인
- 네트워크 문제
- 패키지 캐시 손상
- lock 파일 충돌

### 해결
```bash
# 1. 캐시 클리어
rm -rf node_modules
rm -rf ~/.bun/install/cache  # bun 사용 시

# 2. lock 파일 삭제 후 재설치
rm bun.lockb  # 또는 package-lock.json
bun install
```

---

## 플러그인 설치 실패

### 증상
```
⚠️ plugin-name (install manually)
```

### 원인
- 네트워크 제한
- 마켓플레이스 미등록
- 권한 문제

### 해결
```bash
# 1. 마켓플레이스 재등록
claude plugin marketplace add anthropics/claude-plugins-official

# 2. 개별 플러그인 설치
claude plugin install feature-dev@claude-plugins-official

# 3. 플러그인 마커 파일 삭제 후 재시도
rm .claude/.plugins_installed
# 새 세션 시작
```

---

## MCP 인증 실패

### 증상
```
MCP: github → 401 (needs OAuth via /mcp)
```

### 원인
- OAuth 토큰 만료
- 인증 미완료

### 해결
```bash
# 세션에서 실행
/mcp

# 팝업에서 OAuth 승인
```

---

## SessionStart 훅 미실행

### 증상
- 의존성 자동 설치 안됨
- session-status.log 미생성

### 원인
- .claude/settings.json 누락
- 훅 설정 오류

### 해결
```bash
# 1. 설정 파일 확인
cat .claude/settings.json

# 2. 수동 실행
./scripts/setup.sh

# 3. 훅 재설정
```

`.claude/settings.json` 예시:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/setup.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Netlify 프리뷰 미생성

### 증상
- PR 생성 후 프리뷰 URL 없음

### 원인
- Netlify 미연결
- Deploy Previews 비활성화
- 빌드 실패

### 해결
```bash
# 1. Netlify 상태 확인
# Netlify Dashboard → Site → Deploys

# 2. Deploy Previews 활성화
# Site settings → Build & deploy → Deploy previews

# 3. 빌드 로그 확인
# Deploys → 해당 deploy 클릭 → Deploy log
```

---

## 환경변수 미인식

### 증상
```
⚠️ NETLIFY_SITE_ID not set
```

### 원인
- 환경 선택기에서 미설정
- 세션 재시작 필요

### 해결
```
1. claude.ai/code 접속
2. 환경 선택기 클릭
3. "환경 추가" 또는 기존 환경 편집
4. NETLIFY_SITE_ID=your-site-id 추가
5. 새 세션 시작
```

---

## verify-setup.ts 실행 오류

### 증상
```
⚠️ Verification script not available
```

### 원인
- bun/npx 미설치
- 스크립트 파일 누락

### 해결
```bash
# 1. 스크립트 존재 확인
ls scripts/verify-setup.ts

# 2. 수동 실행
bun run scripts/verify-setup.ts

# 3. 의존성 설치
bun install
```

---

## 롤백 방법

### 플러그인 재설치
```bash
# 마커 파일 삭제
rm .claude/.plugins_installed

# 새 세션 시작 → 자동 재설치
```

### 의존성 초기화
```bash
rm -rf node_modules
rm bun.lockb  # 또는 해당 lock 파일
bun install
```

### 설정 초기화
```bash
# 템플릿에서 복원
git checkout -- .claude/settings.json
git checkout -- .mcp.json
```

---

## 도움 요청

위 방법으로 해결되지 않는 경우:

1. `/verify` 실행하여 상태 확인
2. `.claude/session-status.log` 내용 확인
3. 에러 메시지와 함께 이슈 등록
