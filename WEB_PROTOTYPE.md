# StreamStamp 웹 프로토타입

저장소 루트의 Next.js 앱은 여러 기기에서 타임스탬프를 동기화하고 공유하는 흐름을 검증하기 위한 실험 코드입니다. Chrome 확장 프로그램과 달리 로컬 전용 제품이 아닙니다.

## 사용하는 외부 서비스

- Supabase Authentication: Google 로그인 세션 관리
- Supabase Database: 영상 정보, 타임스탬프와 메모 저장
- YouTube: 영상 재생 및 공개 메타데이터 조회

## 저장 데이터

- 로그인 계정 식별자와 이메일
- YouTube 영상 ID, 제목, 썸네일과 공개 여부
- 사용자가 작성한 타임스탬프와 메모

데이터 접근 제한은 `supabase/schema.sql`의 Row Level Security 정책을 사용합니다. 실제 배포 전에는 별도의 개인정보 처리방침, 데이터 보존 기간, 계정 및 데이터 삭제 기능, 운영 주체와 문의 채널을 확정해야 합니다.

## 현재 상태

- 공식 서비스로 배포하지 않음
- 가용성이나 데이터 보존을 보장하지 않음
- Chrome 확장 프로그램 Release에 포함하지 않음
- 현재 Next.js 14 기반 의존성 감사에서 high 등급 항목이 남아 있으므로 공개 배포 전 Next.js 16 이상으로 업그레이드하고 다시 감사해야 함

## 로컬 실행

`.env.example`을 `.env.local`로 복사하고 본인의 Supabase 프로젝트 정보를 입력한 다음 실행합니다.

```bash
npm install
npm run dev
```
