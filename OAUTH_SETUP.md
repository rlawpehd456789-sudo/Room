# OAuth 설정 가이드

이 문서는 Google과 LINE OAuth 로그인을 설정하는 상세한 가이드를 제공합니다.

## 빠른 시작

1. 프로젝트 루트에 `.env.local` 파일 생성
2. 아래 템플릿을 복사하여 붙여넣기
3. 각 OAuth 제공자의 설정 단계를 따라 값 입력

## 환경 변수 템플릿

```env
# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# LINE OAuth
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=
LINE_REDIRECT_URI=http://localhost:3000/api/auth/line/callback
```

---

## Google OAuth 설정 (단계별)

### 1단계: Google Cloud Console 접속
- https://console.cloud.google.com/ 접속
- Google 계정으로 로그인

### 2단계: 프로젝트 생성
1. 상단의 프로젝트 선택 드롭다운 클릭
2. **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: "ROOMING")
4. **만들기** 클릭
5. 프로젝트가 생성될 때까지 대기 (몇 초 소요)

### 3단계: OAuth 동의 화면 설정
1. 왼쪽 메뉴에서 **API 및 서비스** > **OAuth 동의 화면** 선택
2. **외부** 선택 후 **만들기** 클릭
3. 앱 정보 입력:
   - **앱 이름**: ROOMING (또는 원하는 이름)
   - **사용자 지원 이메일**: 본인 이메일
   - **앱 로고**: 선택사항
4. **저장 후 계속** 클릭
5. **범위** 단계에서 **저장 후 계속** 클릭
6. **테스트 사용자** 단계에서 (선택사항) **저장 후 계속** 클릭
7. **요약** 단계에서 **대시보드로 돌아가기** 클릭

### 4단계: OAuth 클라이언트 ID 생성
1. **API 및 서비스** > **사용자 인증 정보** 선택
2. 상단의 **+ 사용자 인증 정보 만들기** 클릭
3. **OAuth 클라이언트 ID** 선택
4. **애플리케이션 유형**: **웹 애플리케이션** 선택
5. **이름**: 원하는 이름 입력 (예: "ROOMING Web Client")
6. **승인된 리디렉션 URI** 섹션에서:
   - **+ URI 추가** 클릭
   - `http://localhost:3000/api/auth/google/callback` 입력
   - (배포 시) 실제 도메인도 추가 (예: `https://yourdomain.com/api/auth/google/callback`)
7. **만들기** 클릭
8. 팝업에서 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사
   - ⚠️ 클라이언트 보안 비밀번호는 이 창을 닫으면 다시 볼 수 없으니 반드시 복사!

### 5단계: 환경 변수에 입력
`.env.local` 파일에 복사한 값 입력:
```env
GOOGLE_CLIENT_ID=복사한_클라이언트_ID_여기에_붙여넣기
GOOGLE_CLIENT_SECRET=복사한_클라이언트_보안_비밀번호_여기에_붙여넣기
```

---

## LINE OAuth 설정 (단계별)

### 1단계: LINE Developers Console 접속
- https://developers.line.biz/ 접속
- LINE 계정으로 로그인

### 2단계: Provider 생성 (처음 사용하는 경우)
1. 상단의 **Providers** 메뉴 클릭
2. **Create** 버튼 클릭
3. Provider 이름 입력 (예: "ROOMING")
4. **Create** 클릭

### 3단계: Channel 생성
1. 생성한 Provider 선택
2. **Create a channel** 클릭
3. **LINE Login** 선택
4. 채널 정보 입력:
   - **Channel name**: ROOMING (또는 원하는 이름)
   - **Channel description**: 앱 설명 입력
   - **App type**: Web app 선택
   - **Email address**: 본인 이메일
5. 이용약관 및 개인정보 처리방침에 동의 체크
6. **Create** 클릭

### 4단계: 채널 설정
1. 생성된 채널 선택
2. **LINE Login settings** 탭 클릭
3. **Callback URL** 섹션에서:
   - **Add** 버튼 클릭
   - `http://localhost:3000/api/auth/line/callback` 입력
   - (배포 시) 실제 도메인도 추가
4. **OpenID Connect** 섹션에서:
   - **Use email address** 활성화 (이메일 정보를 받기 위해)
5. **Save** 클릭

### 5단계: Channel ID와 Channel Secret 확인
1. **Basic settings** 탭 클릭
2. **Channel ID** 복사
3. **Channel secret** 옆의 **Show** 클릭하여 표시 후 복사
   - ⚠️ Channel secret은 보안상 중요하니 안전하게 보관!

### 6단계: 환경 변수에 입력
`.env.local` 파일에 복사한 값 입력:
```env
LINE_CLIENT_ID=복사한_Channel_ID_여기에_붙여넣기
LINE_CLIENT_SECRET=복사한_Channel_secret_여기에_붙여넣기
```

---

## 설정 완료 후

1. `.env.local` 파일이 올바르게 설정되었는지 확인
2. 개발 서버 재시작:
   ```bash
   # Ctrl+C로 서버 중지 후
   npm run dev
   ```
3. http://localhost:3000/auth/register 접속
4. Google 또는 LINE 버튼 클릭하여 테스트

---

## 문제 해결

### "Google OAuth is not configured" 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (대소문자 구분)
- 개발 서버를 재시작했는지 확인

### "redirect_uri_mismatch" 오류 (Google)
- Google Cloud Console의 승인된 리디렉션 URI에 정확한 URL이 등록되었는지 확인
- URL에 `http://` 또는 `https://`가 포함되어 있는지 확인
- URL 끝에 슬래시(`/`)가 없는지 확인

### "Invalid client" 오류 (LINE)
- Channel ID와 Channel secret이 정확한지 확인
- LINE Developers Console에서 채널이 활성화되어 있는지 확인

### 로그인 후 이메일이 없는 경우 (LINE)
- LINE Developers Console에서 **OpenID Connect** 설정이 활성화되어 있는지 확인
- 채널 설정에서 **Use email address** 옵션이 켜져 있는지 확인

---

## 프로덕션 배포 시 주의사항

1. **환경 변수 설정**:
   - Vercel: 프로젝트 설정 > Environment Variables
   - AWS: 환경 변수 설정
   - 기타 플랫폼: 해당 플랫폼의 환경 변수 설정 사용

2. **리디렉션 URI 업데이트**:
   - Google Cloud Console에서 프로덕션 도메인 추가
   - LINE Developers Console에서 프로덕션 도메인 추가
   - 예: `https://yourdomain.com/api/auth/google/callback`

3. **NEXT_PUBLIC_BASE_URL 업데이트**:
   ```env
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

---

## 보안 참고사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- 클라이언트 ID와 Secret은 외부에 노출되지 않도록 주의하세요
- 프로덕션에서는 HTTPS를 사용하세요
- 정기적으로 Secret을 갱신하는 것을 권장합니다

