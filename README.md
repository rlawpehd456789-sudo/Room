# ROOMING

일본 시장 타겟 인테리어 공유 SNS 플랫폼

## 기술 스택

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- React Hook Form

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## OAuth 설정 (Google & LINE 로그인)

소셜 로그인 기능을 사용하려면 환경 변수를 설정해야 합니다.

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# LINE OAuth
LINE_CLIENT_ID=your_line_channel_id_here
LINE_CLIENT_SECRET=your_line_channel_secret_here
LINE_REDIRECT_URI=http://localhost:3000/api/auth/line/callback
```

### 2. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** > **사용자 인증 정보**로 이동
4. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
5. **애플리케이션 유형**: 웹 애플리케이션 선택
6. **승인된 리디렉션 URI**에 다음 추가:
   - `http://localhost:3000/api/auth/google/callback` (개발 환경)
   - 배포 시에는 실제 도메인으로 변경
7. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀번호**를 `.env.local`에 입력

### 3. LINE OAuth 설정

1. [LINE Developers Console](https://developers.line.biz/)에 접속
2. **Provider** 생성 (처음 사용하는 경우)
3. **Channel** 생성 > **LINE Login** 선택
4. 채널 정보 입력:
   - **App name**: 앱 이름 입력
   - **App description**: 앱 설명 입력
5. **Callback URL**에 다음 추가:
   - `http://localhost:3000/api/auth/line/callback` (개발 환경)
   - 배포 시에는 실제 도메인으로 변경
6. **OpenID Connect** 사용 설정 (이메일 정보를 받기 위해)
7. 생성된 **Channel ID**와 **Channel secret**을 `.env.local`에 입력:
   - `LINE_CLIENT_ID` = Channel ID
   - `LINE_CLIENT_SECRET` = Channel secret

### 4. 환경 변수 적용

환경 변수를 설정한 후 개발 서버를 재시작하세요:

```bash
# 서버 중지 후
npm run dev
```

### 참고사항

- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- 프로덕션 환경에서는 배포 플랫폼(Vercel, AWS 등)의 환경 변수 설정에서 값을 입력하세요
- 배포 시 `NEXT_PUBLIC_BASE_URL`과 리디렉션 URI를 실제 도메인으로 변경해야 합니다

## 주요 기능

- 회원가입/로그인
- 온보딩 (관심 스타일 선택)
- 게시물 작성 (사진 업로드)
- 피드 보기 (Masonry 레이아웃)
- 좋아요/댓글
- 프로필 페이지


