# EEG Seizure Detection AI

React + Vite frontend connected to a FastAPI EEG image-analysis backend.

## Architecture

`EEG report image/PDF -> FastAPI -> image preprocessing -> waveform extraction -> Random Forest -> JSON -> React UI`

## 1. Backend

Create a Python environment and install the backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Copy these trained files from the Google Colab runtime into `backend/models/`:

- `eeg_image_compatible_model.pkl`
- `eeg_image_threshold.pkl`

Start the API from the project root:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `http://localhost:8000/api/health`

Swagger API docs: `http://localhost:8000/docs`

## 2. Frontend

Install frontend dependencies and start Vite:

```bash
npm install
npm run dev
```

The frontend calls `http://localhost:8000/api` by default. To change it, create `.env` from `.env.example` and set `VITE_API_URL`.

## 3. Connected endpoint

The Analyze page sends the selected file as multipart form data to:

`POST /api/analyze`

The response includes:

- seizure and non-seizure probabilities
- final classification
- detected channel count
- channel-level probabilities
- extracted waveform values for the chart
- processing time
- decision threshold

## Important limitation

This is an experimental academic ML prototype. The image-to-waveform digitization can lose information, and the current classifier was trained on normalized UCI EEG waveforms rather than a large paired EEG-report-image dataset. Results are not a medical diagnosis.
