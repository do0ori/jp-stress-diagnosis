# 환산표 데이터 가이드 (Scoring Map Data Guide)

환산표(Scale Map)는 원점수를 5점 척도로 변환하는 기준 데이터입니다.

## 1. 파일 구성 (File Structure)
- **`backend/scoring_maps_raw.json`**: Notion에서 추출한 원본 데이터입니다. 사람이 읽기 쉬운 문자열 범위(예: `"3-5"`)로 되어 있습니다.
- **`backend/scoring_maps.json`**: 애플리케이션에서 사용하는 변환된 데이터입니다. 코드에서 처리하기 쉽도록 객체 형태(예: `{"min": 3, "max": 5}`)로 되어 있습니다.

## 2. 데이터 재생성 방법 (How to Regenerate)
만약 기준이 변경되어 원본 데이터를 수정해야 할 경우:

1. `backend/scoring_maps_raw.json` 파일을 수정합니다.
2. `tools` 디렉토리에서 변환 스크립트를 실행합니다.

```bash
cd tools

# Windows
.\tools_venv\Scripts\python reformat_scoring_maps.py

# Mac/Linux
./tools_venv/bin/python reformat_scoring_maps.py
```

3. `backend/scoring_maps.json` 파일이 갱신되었는지 확인합니다.
