# StreamStamp Chrome Extension

YouTube 영상에서 타임스탬프를 쉽게 기록하고 관리하는 크롬 확장프로그램입니다.

## 기능

- ⏱️ **타임스탬프 추가**: YouTube 영상을 보면서 현재 시간을 클릭 한 번으로 기록
- 📝 **메모 작성**: 각 타임스탬프에 메모 추가
- 🔗 **빠른 이동**: 타임스탬프 클릭으로 해당 시간으로 즉시 이동
- 📋 **마크다운 내보내기**: 모든 타임스탬프를 마크다운 형식으로 복사
- 💾 **로컬 저장**: 모든 데이터는 브라우저에 로컬로 저장 (로그인 불필요)

## 설치 방법

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단의 **"개발자 모드"** 활성화
3. **"압축해제된 확장 프로그램을 로드합니다"** 클릭
4. 이 `extension` 폴더 선택

## 사용 방법

1. YouTube 영상 페이지로 이동
2. 우측에 나타나는 **StreamStamp 패널** 확인
3. 메모 입력 후 **"타임스탬프 추가"** 클릭
4. 저장된 타임스탬프는 클릭하여 해당 시간으로 이동 가능
5. **"마크다운 복사"** 버튼으로 모든 타임스탬프를 복사

## 파일 구조

```
extension/
├── manifest.json       # 확장프로그램 설정
├── content.js          # YouTube 페이지에 주입되는 스크립트
├── content.css         # UI 스타일
├── popup.html          # 확장프로그램 팝업 UI
├── popup.js            # 팝업 로직
└── icons/              # 아이콘 파일들
```

## 데이터 저장

모든 타임스탬프는 `chrome.storage.local`에 저장됩니다:

```javascript
{
  timestamps: {
    "videoId1": [
      { id, videoId, videoTitle, time, memo, createdAt },
      ...
    ],
    "videoId2": [...],
    ...
  }
}
```

## 웹 앱과의 차이

- **확장프로그램**: 로컬 저장, 로그인 불필요, YouTube에서 바로 사용
- **웹 앱** (http://localhost:3000): 클라우드 저장, 여러 기기 동기화, 공유 기능
