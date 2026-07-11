# Chrome Web Store Listing - StreamStamp

## Store Listing Information

### Name
StreamStamp - YouTube Timestamp Manager

### Summary (132 characters max)
YouTube의 중요한 순간을 메모와 함께 저장하고, 검색·백업·마크다운 내보내기로 관리하세요.

### Description

**YouTube 영상을 더 효율적으로 관리하세요!**

StreamStamp는 YouTube 영상을 시청하면서 중요한 순간을 타임스탬프로 기록하고 관리할 수 있는 Chrome 확장 프로그램입니다.

**✨ 주요 기능**

📝 **간편한 타임스탬프 기록**
- YouTube 영상 재생 중 언제든지 타임스탬프 추가
- 메모와 함께 저장하여 나중에 쉽게 찾기
- 현재 재생 시간이 자동으로 기록됨

🎯 **직관적인 인터페이스**
- 플로팅 버튼으로 화면을 가리지 않음
- 드래그하여 원하는 위치로 이동 가능
- 깔끔하고 사용하기 쉬운 디자인

📋 **효율적인 관리**
- 모든 저장된 영상을 한눈에 확인
- 영상 제목과 메모 검색
- 저장한 메모 수정
- 타임스탬프 클릭으로 해당 시간으로 바로 이동
- 개별 타임스탬프 또는 전체 삭제 가능

📤 **마크다운 내보내기**
- 타임스탬프를 마크다운 형식으로 복사
- 노트, 블로그, 문서에 바로 붙여넣기
- 공유와 백업이 간편함

💾 **JSON 백업과 복원**
- 전체 타임스탬프와 메모를 JSON 파일로 저장
- 기존 기록을 지우지 않고 백업 데이터 병합

🔒 **로컬 중심의 개인정보 보호**
- 모든 데이터는 로컬에만 저장
- 서버 전송 없음
- 기록 데이터는 Chrome 로컬 저장소에만 보관
- 개인정보 수집 없음

**💡 사용 방법**

1. YouTube 영상 페이지로 이동
2. 화면의 StreamStamp `S` 버튼 클릭
3. 메모 입력 후 현재 시간이 표시된 "저장" 버튼 클릭
4. 저장된 타임스탬프는 확장 프로그램 아이콘에서 확인

**🎓 이런 분들께 추천합니다**

- 강의 영상을 정리하는 학생
- 튜토리얼 영상을 참고하는 개발자
- 리뷰 영상을 분석하는 마케터
- 긴 영상을 효율적으로 관리하고 싶은 모든 분

**🌟 특징**

✅ 완전 무료
✅ 광고 없음
✅ 로그인 불필요
✅ 별도 계정과 동기화 서버 불필요
✅ 데이터 수집 없음
✅ 가볍고 빠름

지금 바로 StreamStamp로 YouTube 시청을 더 생산적으로 만들어보세요!

---

### Category
생산성 (Productivity)

### Language
한국어 (Korean)

### Screenshots Required

최소 1개, 권장 3-5개의 스크린샷이 필요합니다:

1. **메인 기능 스크린샷** (1280x800 권장)
   - YouTube 페이지에서 플로팅 버튼과 타임스탬프 패널이 보이는 화면
   - 타임스탬프가 몇 개 추가된 상태

2. **확장 프로그램 팝업** (1280x800 권장)
   - 확장 프로그램 아이콘 클릭 시 나타나는 팝업
   - 여러 영상이 저장된 목록

3. **타임스탬프 추가 화면** (1280x800 권장)
   - 메모 입력 중인 화면
   - 타임스탬프 목록이 보이는 상태

4. **마크다운 내보내기 예시** (선택사항)
   - 복사된 마크다운 형식 예시

5. **드래그 기능 시연** (선택사항)
   - 플로팅 버튼이나 패널을 드래그하는 모습

### Promotional Images (Optional)

- **Small tile**: 440x280 (선택사항)
- **Large tile**: 920x680 (선택사항)
- **Marquee**: 1400x560 (선택사항)

### Support URL
https://github.com/ThankyouJerry/streamstamp

### Homepage URL
https://github.com/ThankyouJerry/streamstamp

---

## Single Purpose Description

**For Chrome Web Store Review:**

StreamStamp's single purpose is to help users create and manage timestamps for YouTube videos. The extension provides a simple interface to record specific moments in videos with notes, view all saved timestamps, and export them in markdown format. All functionality is focused on timestamp management for YouTube content.

---

## Permission Justifications

**For Chrome Web Store Review:**

### Storage Permission
Used to save user-created timestamps and UI preferences locally on the user's device. No data is transmitted to external servers.

### ActiveTab Permission
Used to access the URL of the current tab only when the user opens the extension popup. This allows the extension to determine whether the current tab is a YouTube video and send a request to open the timestamp panel on that tab.

### Content Scripts
The extension uses declarative content scripts on `*://*.youtube.com/*` so the timestamp UI remains available after YouTube's client-side navigation. The script renders the floating button and panel only when the current URL is a valid `/watch?v=...` video page. This is the core functionality of the extension.

---

## Privacy Practices

**Data Usage Disclosure:**

- ✅ This extension does NOT collect any user data
- ✅ This extension does NOT transmit any data
- ✅ All data is stored locally on the user's device
- ✅ No analytics or tracking
- ✅ No third-party services

---

## Testing Instructions for Reviewers

1. Install the extension
2. Navigate to any YouTube video (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
3. Click the floating `S` button in the bottom-right corner
4. Enter a memo and click the time-labelled "저장" button
5. Verify the timestamp appears in the list
6. Click the extension icon to see all saved videos
7. Test the markdown export feature
8. Verify all data is stored locally (check Chrome DevTools → Application → Storage)
