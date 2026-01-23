# 데이터 추출 가이드 (Data Extraction Guide)

본 프로젝트는 `backend/questions.json` 파일을 통해 스트레스 체크 문항 데이터를 관리합니다.
아래 절차는 원본 CSV 파일로부터 JSON 데이터를 추출하는 방법을 설명합니다.

## 1. 사전 준비 (Prerequisites)
- Python 3.9+
- `tools` 디렉토리 내에 가상환경(`tools_venv`)이 구성되어 있어야 합니다.

## 2. 데이터 소스 (Data Source)
- **파일 경로**: `JP 스트레스 체크 문항 설계 - 채점 기준.csv` (프로젝트 루트 위치)
- **형식**: `영역`, `번호`, `문항 내용`, `1-4번 점수`, `선택지` 컬럼 포함

## 3. 추출 스크립트 실행 (Execution)

`tools` 디렉토리로 이동하여 아래 명령어를 실행합니다.

```bash
cd tools

# Windows
.\tools_venv\Scripts\python extract_questions.py

# Mac/Linux
./tools_venv/bin/python extract_questions.py
```

## 4. 결과 확인 (Output)
- 실행이 완료되면 `backend/questions.json` 파일이 갱신됩니다.
- 총 **57개**의 문항이 추출되어야 정상입니다.
