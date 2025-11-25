# StreamStamp 설정 가이드

## 1. Supabase 프로젝트 설정

### 데이터베이스 스키마 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (이미 생성된 프로젝트: `fppivexiawhmvgcddqxz`)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 클릭
5. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭하여 실행

### Google OAuth 설정

1. Supabase Dashboard에서 **Authentication** → **Providers** 클릭
2. **Google** 찾아서 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성:
   - [Google Cloud Console](https://console.cloud.google.com/)
   - **APIs & Services** → **Credentials**
   - **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://fppivexiawhmvgcddqxz.supabase.co/auth/v1/callback`
4. Client ID와 Client Secret을 Supabase의 Google Provider 설정에 입력

## 2. YouTube API 설정 (선택사항)

YouTube 메타데이터를 가져오려면 API 키가 필요합니다.

1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Library**
3. **YouTube Data API v3** 검색 및 활성화
4. **Credentials** → **Create Credentials** → **API Key**
5. `.env.local` 파일에 추가:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```

> **참고**: API 키 없이도 기본 썸네일과 제목은 표시됩니다.

## 3. 의존성 설치

```bash
cd streamstamp
npm install
```

## 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 주요 기능

### ✅ 구현 완료
- YouTube 및 Chzzk URL 자동 감지
- 영상 메타데이터 자동 가져오기
- React Player를 통한 영상 재생
- 타임스탬프 추가/수정/삭제
- 드래그 앤 드롭으로 순서 변경
- 마크다운 형식 복사/다운로드
- Google OAuth 로그인
- 내 타임라인 대시보드
- 공개/비공개 설정
- 공유 링크 생성

### ⚠️ 알려진 제한사항
- **Naver 로그인**: Supabase에서 직접 지원하지 않아 현재 비활성화
- **Chzzk 재생**: React Player가 Chzzk를 완전히 지원하지 않을 수 있음 (외부 링크로 대체)
- **YouTube API 할당량**: 무료 할당량 제한 있음

## 문제 해결

### "로그인이 필요합니다" 오류
- Supabase Google OAuth 설정 확인
- Redirect URI가 정확한지 확인

### 영상 메타데이터를 가져올 수 없음
- YouTube API 키 설정 확인
- Chzzk API 프록시 라우트 확인

### 타임스탬프가 저장되지 않음
- Supabase RLS 정책 확인
- 브라우저 콘솔에서 에러 확인

## 배포

### Vercel 배포 (권장)

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 임포트
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_YOUTUBE_API_KEY` (선택)
4. 배포!

## 라이선스

MIT
