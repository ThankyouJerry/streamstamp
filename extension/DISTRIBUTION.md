# StreamStamp Chrome 확장 프로그램 배포 가이드

## 배포 방법

Chrome 확장 프로그램을 배포하는 방법은 크게 3가지가 있습니다:

### 1. 🌐 Chrome 웹 스토어 배포 (공식 배포)

가장 일반적인 방법으로, 누구나 Chrome 웹 스토어에서 설치할 수 있습니다.

#### 준비 사항
- Google 계정
- 개발자 등록 비용: **$5 (일회성)**
- 확장 프로그램 아이콘 (128x128, 48x48, 16x16)
- 스크린샷 (최소 1개, 권장 3-5개)
- 홍보용 이미지 (선택사항)

#### 배포 단계

1. **Chrome 웹 스토어 개발자 대시보드 등록**
   - https://chrome.google.com/webstore/devconsole 방문
   - Google 계정으로 로그인
   - $5 개발자 등록 비용 지불

2. **확장 프로그램 패키징**
   ```bash
   cd /Users/hvs/.gemini/antigravity/scratch/streamstamp/extension
   zip -r streamstamp-extension.zip . -x "*.DS_Store" -x "__MACOSX"
   ```

3. **새 항목 업로드**
   - 대시보드에서 "새 항목" 클릭
   - `streamstamp-extension.zip` 파일 업로드

4. **스토어 등록 정보 작성**
   - **이름**: StreamStamp - YouTube Timestamp Manager
   - **요약**: YouTube 영상에서 타임스탬프를 쉽게 기록하고 관리하세요
   - **설명**: 자세한 기능 설명 작성
   - **카테고리**: 생산성
   - **언어**: 한국어

5. **스크린샷 및 아이콘 업로드**
   - 확장 프로그램 사용 화면 캡처
   - 최소 1개, 권장 3-5개
   - 크기: 1280x800 또는 640x400

6. **개인정보 보호 설정**
   - 데이터 수집 여부 명시
   - 개인정보 처리방침 URL (필요시)

7. **검토 제출**
   - "검토를 위해 제출" 클릭
   - 보통 1-3일 내 검토 완료

---

### 2. 📦 직접 배포 (.crx 파일)

Chrome 웹 스토어를 거치지 않고 직접 배포하는 방법입니다.

#### 장점
- 무료
- 즉시 배포 가능
- 내부 테스트나 소규모 배포에 적합

#### 단점
- 사용자가 수동으로 설치해야 함
- Chrome이 "알 수 없는 출처" 경고 표시
- 자동 업데이트 불가

#### 배포 방법

1. **확장 프로그램 패키징**
   - Chrome에서 `chrome://extensions/` 열기
   - 개발자 모드 활성화
   - "확장 프로그램 패키징" 클릭
   - extension 폴더 선택
   - `.crx` 파일 생성

2. **배포**
   - 생성된 `.crx` 파일을 사용자에게 전달
   - 사용자는 파일을 Chrome으로 드래그 앤 드롭하여 설치

---

### 3. 📂 압축 파일 배포 (개발자 모드)

가장 간단하지만 기술적 지식이 필요한 방법입니다.

#### 장점
- 완전 무료
- 즉시 배포 가능

#### 단점
- 사용자가 개발자 모드를 활성화해야 함
- 기술적 지식 필요
- 자동 업데이트 불가

#### 배포 방법

1. **압축 파일 생성**
   ```bash
   cd /Users/hvs/.gemini/antigravity/scratch/streamstamp
   zip -r streamstamp-extension.zip extension/ -x "*.DS_Store" -x "__MACOSX"
   ```

2. **사용자 설치 가이드 제공**
   - ZIP 파일 다운로드
   - 압축 해제
   - Chrome에서 `chrome://extensions/` 열기
   - 개발자 모드 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - 압축 해제한 폴더 선택

---

## 권장 배포 방법

### 개인/소규모 사용
→ **방법 3 (압축 파일 배포)** 추천
- 무료이고 간단함
- GitHub 등에 올려서 공유 가능

### 공개 배포
→ **방법 1 (Chrome 웹 스토어)** 추천
- 신뢰성 높음
- 자동 업데이트 지원
- 사용자가 쉽게 설치 가능
- $5 비용은 일회성

---

## 배포 전 체크리스트

- [ ] manifest.json 버전 확인
- [ ] 모든 기능 테스트 완료
- [ ] 아이콘 파일 준비 (16x16, 48x48, 128x128)
- [ ] README.md 작성
- [ ] 스크린샷 준비 (Chrome 웹 스토어용)
- [ ] 개인정보 처리방침 작성 (필요시)
- [ ] 라이선스 파일 추가 (선택사항)

---

## GitHub를 통한 배포 (추천)

무료로 배포하고 버전 관리도 할 수 있는 방법:

1. **GitHub 저장소 생성**
   ```bash
   cd /Users/hvs/.gemini/antigravity/scratch/streamstamp
   git init
   git add extension/
   git commit -m "Initial commit: StreamStamp Chrome Extension"
   ```

2. **GitHub에 푸시**
   - GitHub에서 새 저장소 생성
   - 로컬 저장소를 GitHub에 푸시

3. **Release 생성**
   - GitHub에서 "Releases" → "Create a new release"
   - ZIP 파일 첨부
   - 설치 가이드 작성

4. **사용자 안내**
   - README.md에 설치 방법 작성
   - Release 페이지 링크 공유

---

## 업데이트 배포

### Chrome 웹 스토어
1. manifest.json의 version 업데이트
2. 새 ZIP 파일 생성
3. 개발자 대시보드에서 업로드
4. 자동으로 사용자에게 배포됨

### 직접 배포
1. manifest.json의 version 업데이트
2. 새 파일 생성 및 배포
3. 사용자가 수동으로 재설치 필요

---

## 추가 리소스

- [Chrome 웹 스토어 개발자 문서](https://developer.chrome.com/docs/webstore/)
- [확장 프로그램 배포 가이드](https://developer.chrome.com/docs/webstore/publish/)
- [확장 프로그램 정책](https://developer.chrome.com/docs/webstore/program-policies/)
