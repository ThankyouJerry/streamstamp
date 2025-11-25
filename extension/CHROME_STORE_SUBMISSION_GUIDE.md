# Chrome 웹 스토어 제출 가이드

## 제출 시 입력해야 할 정보

### 1. 개인정보처리방침 링크

개인정보처리방침을 온라인에 게시하고 그 URL을 입력해야 합니다.

**옵션 A: GitHub Pages 사용 (무료, 권장)**
1. GitHub 저장소 생성
2. `PRIVACY_POLICY.md` 파일 업로드
3. Settings → Pages에서 GitHub Pages 활성화
4. URL 예시: `https://[your-username].github.io/streamstamp/PRIVACY_POLICY.html`

**옵션 B: 간단한 호스팅 사용**
- Google Sites, Notion 등에 개인정보처리방침 게시
- 공개 URL 복사

**임시 해결책:**
- 일단 제출하려면 아무 유효한 URL이라도 입력 (예: GitHub 저장소 URL)
- 나중에 업데이트 가능

---

### 2. 상세 설명 (최소 25자)

**현재 설명:**
```
Create and manage timestamps for YouTube videos directly in the browser.
```
(78자 - 충분함)

이미 충분하지만, 혹시 더 자세하게 원한다면:

```
Create and manage timestamps for YouTube videos directly in your browser. Record important moments with notes, organize all your timestamps, and export them in markdown format. Works completely offline with no data collection.
```

---

### 3. 언어 선택

**입력할 값:**
- 기본 언어: **Korean (한국어)** 또는 **English**
- 확장 프로그램이 한국어 UI를 사용하므로 Korean 권장

---

### 4. 카테고리 선택

**입력할 값:**
- **Productivity (생산성)**

---

### 5. 개인 정보 보호 관행 탭 - 권한 정당화

Chrome 웹 스토어 대시보드의 "개인 정보 보호 관행" 탭에서 각 권한에 대한 설명을 입력해야 합니다.

#### Storage 권한
**Single purpose (단일 목적):**
```
To save user-created timestamps and UI position preferences locally on the user's device.
```

**Permission use (권한 사용):**
```
This extension uses the storage permission to save timestamps (video ID, time, and user notes) and UI preferences (floating button and panel positions) in Chrome's local storage. All data stays on the user's device and is never transmitted to any server.
```

#### ActiveTab 권한
**Single purpose (단일 목적):**
```
To check if the user is currently on a YouTube video page when opening the extension popup.
```

**Permission use (권한 사용):**
```
This extension uses the activeTab permission to access the current tab's URL only when the user clicks the extension icon. This allows the popup to display relevant options (e.g., "Record current video" button) when the user is on a YouTube video page.
```

#### Host 권한 (Content Scripts)
**참고:** `host_permissions`를 제거했지만, `content_scripts`의 `matches` 패턴 때문에 여전히 설명이 필요할 수 있습니다.

**Single purpose (단일 목적):**
```
To inject the timestamp recording interface into YouTube video pages.
```

**Permission use (권한 사용):**
```
This extension uses content scripts to inject a floating button and timestamp panel into YouTube video pages (youtube.com/watch*). This is the core functionality that allows users to create timestamps while watching videos. The extension only runs on YouTube video pages and does not access any user data.
```

---

## 데이터 사용 공개 (Data Usage Disclosure)

"개인 정보 보호 관행" 탭에서 다음 질문들에 답변해야 합니다:

### Does this item collect user data?
**답변:** No

### Does this item use or transfer user data?
**답변:** No

### Does this item sell user data?
**답변:** No

---

## 체크리스트

제출 전 확인사항:

- [ ] 개인정보처리방침 URL 입력 (유효한 공개 URL)
- [ ] 상세 설명 25자 이상 입력
- [ ] 언어 선택: Korean 또는 English
- [ ] 카테고리 선택: Productivity
- [ ] Storage 권한 정당화 입력
- [ ] ActiveTab 권한 정당화 입력
- [ ] Host 권한/Content Scripts 정당화 입력
- [ ] 데이터 수집 여부: No
- [ ] 스크린샷 최소 1개 업로드 (1280x800 권장)
- [ ] 아이콘 확인 (128x128, 48x48, 16x16)

---

## 빠른 해결 방법

### 지금 당장 제출하려면:

1. **개인정보처리방침 URL**: 
   - 임시로 GitHub 저장소 URL 입력
   - 예: `https://github.com/[username]/streamstamp`

2. **언어**: Korean 선택

3. **카테고리**: Productivity 선택

4. **권한 정당화**: 위의 텍스트를 복사해서 붙여넣기

5. **데이터 사용**: 모두 "No" 선택

이렇게 하면 제출이 가능하고, 나중에 정식 개인정보처리방침 URL로 업데이트할 수 있습니다.
