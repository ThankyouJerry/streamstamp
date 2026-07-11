# StreamStamp Chrome Extension

이 폴더에는 Chrome Web Store와 GitHub Release에 배포하는 Manifest V3 확장 프로그램 소스가
들어 있습니다. 사용법, 권한과 개발 방법은 [프로젝트 README](../README.md)를 확인해 주세요.

## 파일 구조

```text
extension/
├── manifest.json
├── shared.js
├── content.js
├── content.css
├── popup.html
├── popup.css
├── popup.js
└── icons/
```

## 저장 데이터

```javascript
{
  timestamps: {
    "videoId": [
      { id, videoId, videoTitle, time, memo, createdAt }
    ]
  },
  streamstampUi: {
    toggle: { top, left },
    panel: { top, left }
  }
}
```

모든 데이터는 `chrome.storage.local`에만 저장됩니다.
