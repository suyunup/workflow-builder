# AI Workflow Builder

Make.com 스타일의 시각적 AI 워크플로우 빌더입니다.

## 🚀 주요 기능

- ✨ React Flow 기반 드래그 & 드롭 인터페이스
- 🔗 Task 간 연결선 생성 및 애니메이션
- 💡 Task 클릭 시 오버레이 팝업으로 설정
- 🎨 Figma 감성의 라이트모드 UI
- 💾 LocalStorage 자동 저장
- ⚡ 워크플로우 순차 실행

## 📦 설치 방법

```bash
# 의존성 설치
npm install

# 또는 yarn 사용
yarn install

# 또는 pnpm 사용
pnpm install
```

## 🏃 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
workflow-builder/
├── src/
│   ├── components/
│   │   ├── FlowCanvas.tsx      # 메인 캔버스
│   │   ├── TaskNode.tsx         # Task 노드 컴포넌트
│   │   ├── TaskPopup.tsx        # Task 설정 팝업
│   │   └── CustomEdge.tsx       # 커스텀 연결선
│   ├── store.ts                 # Zustand 상태 관리
│   ├── types.ts                 # TypeScript 타입 정의
│   ├── App.tsx                  # 메인 App 컴포넌트
│   ├── main.tsx                 # 엔트리 포인트
│   └── index.css                # 글로벌 스타일
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 사용 방법

1. **Task 추가**: 좌측 상단 "Task 추가" 버튼 클릭
2. **Task 연결**: Task 하단 파란색 점을 드래그하여 다른 Task에 연결
3. **Task 설정**: Task를 클릭하여 팝업에서 이름과 프롬프트 입력
4. **테스트 실행**: 팝업에서 "테스트 실행" 버튼으로 개별 Task 실행
5. **플로우 실행**: 상단 "플로우 실행" 버튼으로 전체 워크플로우 실행
6. **초기화**: "초기화" 버튼으로 모든 Task와 연결선 삭제

## 🛠️ 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **React Flow** - 노드 기반 그래프 UI
- **Zustand** - 상태 관리
- **Framer Motion** - 애니메이션
- **TailwindCSS** - 스타일링
- **Vite** - 빌드 도구

## 🎨 컬러 팔레트

- 배경: `#F9FAFB`
- 노드 배경: `#FFFFFF`
- 연결선: `#007AFF`
- 텍스트: `#111827`

## 📝 라이선스

MIT License
