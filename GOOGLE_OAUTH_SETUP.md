# Google OAuth 설정 가이드 (상세 버전)

## ⚠️ 중요: Google OAuth 설정 체크리스트

Google OAuth가 작동하려면 **3곳**에서 설정이 필요합니다:
1. ✅ Google Cloud Console
2. ✅ Supabase Dashboard
3. ✅ 코드 (이미 완료)

---

## 1️⃣ Google Cloud Console 설정

### Step 1: 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단의 프로젝트 선택 드롭다운 클릭
3. **새 프로젝트** 클릭
4. 프로젝트 이름: `StreamStamp` 입력
5. **만들기** 클릭
6. 프로젝트가 생성되면 선택

### Step 2: OAuth 동의 화면 구성
1. 좌측 메뉴에서 **APIs & Services** → **OAuth consent screen** 클릭
2. User Type: **External** 선택
3. **만들기** 클릭
4. 다음 정보 입력:
   - **앱 이름**: `StreamStamp`
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처 정보**: 본인 이메일
5. **저장 후 계속** 클릭
6. **범위** 페이지: 그냥 **저장 후 계속** 클릭
7. **테스트 사용자** 페이지: 
   - **+ ADD USERS** 클릭
   - 본인 이메일 추가 (테스트용)
   - **저장 후 계속** 클릭
8. **요약** 페이지: **대시보드로 돌아가기** 클릭

### Step 3: OAuth 2.0 클라이언트 ID 생성
1. 좌측 메뉴에서 **Credentials** 클릭
2. 상단의 **+ CREATE CREDENTIALS** 클릭
3. **OAuth 2.0 Client ID** 선택
4. Application type: **Web application** 선택
5. 이름: `StreamStamp Web Client`
6. **Authorized redirect URIs** 섹션:
   - **+ ADD URI** 클릭
   - 다음 URI 정확히 입력:
     ```
     https://fppivexiawhmvgcddqxz.supabase.co/auth/v1/callback
     ```
   - ⚠️ **주의**: 끝에 슬래시(/) 없어야 함!
7. **CREATE** 클릭
8. 팝업에서 **Client ID**와 **Client Secret** 복사
   - Client ID: `123456789-abcdefg.apps.googleusercontent.com` 형태
   - Client Secret: `GOCSPX-abcd1234efgh5678` 형태
   - ⚠️ **중요**: 이 값들을 메모장에 저장!

---

## 2️⃣ Supabase 설정

### Step 1: Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard/project/fppivexiawhmvgcddqxz/auth/providers) 접속
2. **Authentication** → **Providers** 클릭

### Step 2: Google Provider 설정
1. 스크롤해서 **Google** 찾기
2. Google 클릭하여 펼치기
3. 다음 정보 입력:
   - ✅ **Enable Sign in with Google** 토글 ON
   - **Client ID (for OAuth)**: Google에서 복사한 Client ID 붙여넣기
   - **Client Secret (for OAuth)**: Google에서 복사한 Client Secret 붙여넣기
4. **Save** 클릭

### Step 3: 확인
- Supabase에서 Google이 **Enabled** 상태인지 확인
- Client ID와 Secret이 제대로 입력되었는지 확인

---

## 3️⃣ 테스트

### 브라우저 캐시 삭제
1. Chrome/Edge: `Ctrl+Shift+Delete` (Mac: `Cmd+Shift+Delete`)
2. **쿠키 및 기타 사이트 데이터** 체크
3. **인터넷 사용 기록 삭제** 클릭

또는 **시크릿 모드/프라이빗 브라우징** 사용

### 로그인 테스트
1. http://localhost:3000/login 접속
2. **Google로 로그인** 버튼 클릭
3. Google 계정 선택
4. 권한 동의
5. 자동으로 대시보드로 리다이렉트되어야 함!

---

## 🐛 문제 해결

### "Unable to exchange external code" 에러
**원인**: Supabase에 Google Client ID/Secret이 설정되지 않음

**해결**:
1. Supabase Dashboard → Authentication → Providers → Google 확인
2. Client ID와 Secret이 정확히 입력되었는지 확인
3. **Save** 버튼 눌렀는지 확인

### "redirect_uri_mismatch" 에러
**원인**: Google Cloud Console의 Redirect URI가 잘못됨

**해결**:
1. Google Cloud Console → Credentials 확인
2. Authorized redirect URIs에 정확히 다음이 있는지 확인:
   ```
   https://fppivexiawhmvgcddqxz.supabase.co/auth/v1/callback
   ```
3. 끝에 슬래시(/) 없는지 확인
4. 수정 후 **Save** 클릭

### "Access blocked: This app's request is invalid"
**원인**: OAuth 동의 화면이 설정되지 않음

**해결**:
1. Google Cloud Console → OAuth consent screen
2. 앱 이름, 이메일 등 필수 정보 입력
3. 테스트 사용자에 본인 이메일 추가

### 로그인 후 무한 루프
**원인**: 세션 쿠키 문제

**해결**:
1. 브라우저 캐시 완전 삭제
2. 시크릿 모드로 테스트
3. 개발자 도구(F12) → Console에서 에러 확인

---

## 📋 최종 체크리스트

설정 전에 다음을 확인하세요:

### Google Cloud Console
- [ ] 프로젝트 생성됨
- [ ] OAuth 동의 화면 구성 완료
- [ ] 테스트 사용자에 본인 이메일 추가
- [ ] OAuth 2.0 Client ID 생성됨
- [ ] Redirect URI: `https://fppivexiawhmvgcddqxz.supabase.co/auth/v1/callback`
- [ ] Client ID와 Secret 복사함

### Supabase
- [ ] Google Provider 활성화됨
- [ ] Client ID 입력됨
- [ ] Client Secret 입력됨
- [ ] Save 버튼 눌렀음

### 테스트
- [ ] 브라우저 캐시 삭제
- [ ] 로그인 버튼 클릭 시 Google 로그인 창 뜸
- [ ] 로그인 후 대시보드로 이동

---

## 💡 팁

1. **시크릿 모드 사용**: 캐시 문제를 피하기 위해 시크릿 모드에서 테스트
2. **개발자 도구 확인**: F12 → Console/Network 탭에서 에러 확인
3. **Supabase 로그**: Supabase Dashboard → Logs에서 인증 로그 확인

설정 중 막히는 부분이 있으면 스크린샷과 함께 알려주세요!
