# JP Stress Diagnosis

React (프론트엔드)와 Flask (백엔드)를 사용한 풀스택 애플리케이션입니다.
이 프로젝트는 **Atommerce**에서 실제로 사용하는 기술 스택과 동일하게 구성되었습니다.

## 구조 (Structure)

- `frontend/`: React 애플리케이션 (Vite)
- `backend/`: Flask 애플리케이션

## 실행 방법 (How to Run)

### 백엔드 (Backend)
1. `backend/` 디렉토리로 이동합니다.
2. Poetry를 사용하여 의존성을 설치합니다:
   ```bash
   poetry install
   ```
   (이 명령은 자동으로 `.venv` 가상 환경을 생성하고 패키지를 설치합니다)
3. 서버를 실행합니다:
   ```bash
   poetry run python app.py
   ```
   또는 가상환경을 활성화(`poetry shell` 또는 `.venv/Scripts/activate`)한 후 `python app.py`를 실행할 수도 있습니다.

### 프론트엔드 (Frontend)
1. `frontend/` 디렉토리로 이동합니다.
2. 의존성을 설치합니다: `npm install`
3. 개발 서버를 실행합니다: `npm run dev`
