# StreamStamp

YouTube 영상에서 타임스탬프와 메모를 기록하고 다시 찾는 Chrome 확장 프로그램입니다.

이 저장소의 주 제품은 `extension/` 폴더의 로컬 저장형 Chrome 확장 프로그램입니다. 저장소 루트의 Next.js/Supabase 코드는 여러 기기 동기화를 실험하기 위한 웹 프로토타입이며, 현재 일반 사용자용 배포본으로 제공하지 않습니다.

## Chrome 확장 프로그램

### 주요 기능

- 현재 YouTube 재생 위치를 메모와 함께 저장
- 저장한 시점으로 바로 이동
- 영상별 타임스탬프 목록 관리
- 마크다운 형식으로 복사
- 플로팅 버튼과 패널 위치 조정
- 로그인 없이 Chrome 로컬 저장소 사용

### 설치

1. [Releases](https://github.com/ThankyouJerry/streamstamp/releases)에서 최신 확장 프로그램 ZIP을 내려받아 압축을 풉니다.
2. Chrome에서 `chrome://extensions`를 엽니다.
3. `개발자 모드`를 켭니다.
4. `압축해제된 확장 프로그램을 로드합니다`를 누르고 압축을 푼 폴더를 선택합니다.

소스 저장소를 직접 받았다면 `extension/` 폴더를 선택하면 됩니다.

### 개인정보 보호

Chrome 확장 프로그램의 타임스탬프, 메모와 UI 위치는 사용자의 기기에만 저장됩니다. 별도 서버, 광고 또는 분석 도구로 전송하지 않습니다.

자세한 내용은 [확장 프로그램 개인정보 처리방침](extension/PRIVACY_POLICY.md)을 확인해주세요.

## 웹 프로토타입

저장소 루트의 Next.js 앱은 Supabase 데이터베이스와 Google 로그인을 사용하는 실험 코드입니다.

- 로컬 전용이 아닙니다.
- 사용자가 입력한 영상 정보와 타임스탬프를 Supabase에 저장합니다.
- 운영하려면 별도의 Supabase 프로젝트와 OAuth 설정이 필요합니다.
- 현재 공식 서비스 URL이나 사용자 지원을 제공하지 않습니다.

개발 및 데이터 처리 범위는 [웹 프로토타입 안내](WEB_PROTOTYPE.md)를 확인해주세요.

## 개발

### 확장 프로그램

확장 프로그램은 빌드 단계 없이 `extension/` 폴더에서 동작합니다.

```bash
node tests/validate-extension.mjs
```

### 웹 프로토타입

```bash
npm install
cp .env.example .env.local
npm run dev
```

환경 변수에는 직접 만든 Supabase 프로젝트의 URL과 anon key를 입력해야 합니다.

## 프로젝트 위치

- 대표 프로젝트: [ClipCatcher](https://github.com/ThankyouJerry/ClipCatcher)
- 하이라이트 분석: [ClipRadar](https://github.com/ThankyouJerry/ClipRadar)
- 보조 프로젝트: StreamStamp

## 라이선스

MIT License
