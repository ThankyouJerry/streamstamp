# GitHub 업로드 가이드

## 1단계: Git 저장소 초기화 (아직 안 했다면)

```bash
cd /Users/hvs/.gemini/antigravity/scratch/streamstamp
git init
```

## 2단계: 파일 추가

```bash
# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: StreamStamp Chrome Extension"
```

## 3단계: GitHub 저장소 생성

1. https://github.com 접속
2. 오른쪽 상단 "+" → "New repository" 클릭
3. 저장소 정보 입력:
   - **Repository name**: `streamstamp` (또는 원하는 이름)
   - **Description**: `YouTube timestamp manager Chrome extension`
   - **Public** 선택 (개인정보처리방침 URL로 사용하려면 Public 필수)
   - **README, .gitignore, license 추가 안 함** (이미 있음)
4. "Create repository" 클릭

## 4단계: GitHub에 푸시

GitHub에서 생성한 저장소 페이지에 나오는 명령어를 복사해서 실행:

```bash
# GitHub 저장소 연결
git remote add origin https://github.com/[your-username]/streamstamp.git

# 기본 브랜치 이름 설정
git branch -M main

# 푸시
git push -u origin main
```

**또는 SSH 사용:**
```bash
git remote add origin git@github.com:[your-username]/streamstamp.git
git branch -M main
git push -u origin main
```

## 5단계: GitHub Pages 활성화 (개인정보처리방침 URL용)

1. GitHub 저장소 페이지에서 **Settings** 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. Source: **Deploy from a branch** 선택
4. Branch: **main** 선택, 폴더: **/ (root)** 선택
5. **Save** 클릭

몇 분 후 다음 URL에서 개인정보처리방침을 확인할 수 있습니다:
```
https://[your-username].github.io/streamstamp/extension/PRIVACY_POLICY
```

이 URL을 Chrome 웹 스토어 제출 시 개인정보처리방침 링크로 사용하세요!

## 6단계: Release 생성 (선택사항)

사용자가 쉽게 다운로드할 수 있도록 Release를 만들 수 있습니다:

1. GitHub 저장소 페이지에서 **Releases** 클릭
2. **Create a new release** 클릭
3. Tag: `v1.0.0` 입력
4. Release title: `v1.0.0 - Initial Release`
5. Description 작성:
   ```markdown
   ## StreamStamp v1.0.0
   
   YouTube 타임스탬프 관리 Chrome 확장 프로그램 첫 번째 릴리스입니다.
   
   ### 주요 기능
   - YouTube 영상 타임스탬프 기록
   - 드래그 가능한 UI
   - 마크다운 내보내기
   - 완전한 오프라인 작동
   
   ### 설치 방법
   1. `streamstamp-extension.zip` 다운로드
   2. 압축 해제
   3. Chrome에서 `chrome://extensions/` 열기
   4. 개발자 모드 활성화
   5. "압축해제된 확장 프로그램 로드" 클릭
   6. 압축 해제한 폴더 선택
   ```
6. ZIP 파일 첨부:
   - `streamstamp-chrome-extension-v1.0.1.zip` 파일을 드래그 앤 드롭
7. **Publish release** 클릭

## 빠른 명령어 모음

```bash
# 저장소로 이동
cd /Users/hvs/.gemini/antigravity/scratch/streamstamp

# Git 초기화 (처음만)
git init

# 파일 추가 및 커밋
git add .
git commit -m "Initial commit: StreamStamp Chrome Extension"

# GitHub 저장소 연결 (your-username을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/your-username/streamstamp.git

# 푸시
git branch -M main
git push -u origin main
```

## 이후 업데이트 시

```bash
# 변경사항 추가
git add .

# 커밋
git commit -m "Update: [변경 내용 설명]"

# 푸시
git push
```

## 문제 해결

### "remote origin already exists" 오류
```bash
git remote remove origin
git remote add origin https://github.com/your-username/streamstamp.git
```

### GitHub 인증 필요
- Personal Access Token 사용 권장
- Settings → Developer settings → Personal access tokens → Generate new token
- repo 권한 선택
- 생성된 토큰을 비밀번호 대신 사용

### SSH 키 설정 (권장)
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your_email@example.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub Settings → SSH and GPG keys → New SSH key에 붙여넣기
```
