from __future__ import annotations

import time
from pathlib import Path

import cv2
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from scipy.signal import find_peaks, resample


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "eeg_image_compatible_model.pkl"
THRESHOLD_PATH = BASE_DIR / "models" / "eeg_image_threshold.pkl"


# ============================================================
# LOAD MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise RuntimeError(
        f"Missing model file: {MODEL_PATH}"
    )

if not THRESHOLD_PATH.exists():
    raise RuntimeError(
        f"Missing threshold file: {THRESHOLD_PATH}"
    )


MODEL = joblib.load(MODEL_PATH)
THRESHOLD = float(joblib.load(THRESHOLD_PATH))


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="EEG Seizure Detection API",
    version="1.0.0",
    description=(
        "Experimental EEG report image analysis API. "
        "This system is intended for academic/prototype use "
        "and is not a medical diagnostic system."
    ),
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# IMAGE / PDF DECODER
# ============================================================

def decode_upload(data: bytes, filename: str) -> np.ndarray:
    """
    Convert uploaded image/PDF bytes into an OpenCV BGR image.
    For PDF files, only the first page is currently processed.
    """

    suffix = Path(filename).suffix.lower()

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if suffix == ".pdf":

        try:
            import fitz
        except ImportError as exc:
            raise HTTPException(
                status_code=500,
                detail="PDF support is not installed on the backend.",
            ) from exc

        try:
            document = fitz.open(
                stream=data,
                filetype="pdf",
            )

            if document.page_count == 0:
                raise ValueError("PDF contains no pages.")

            page = document.load_page(0)

            # Render PDF at higher resolution
            pix = page.get_pixmap(
                matrix=fitz.Matrix(2.5, 2.5),
                alpha=False,
            )

            image = np.frombuffer(
                pix.samples,
                dtype=np.uint8,
            ).reshape(
                pix.height,
                pix.width,
                pix.n,
            )

            if pix.n == 4:
                image = cv2.cvtColor(
                    image,
                    cv2.COLOR_RGBA2BGR,
                )
            else:
                image = cv2.cvtColor(
                    image,
                    cv2.COLOR_RGB2BGR,
                )

            return image

        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Could not read the PDF: {exc}",
            ) from exc

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    image_array = np.frombuffer(
        data,
        dtype=np.uint8,
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a readable image.",
        )

    return image


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_eeg_image(image: np.ndarray) -> np.ndarray:
    """
    Prepare an EEG report image for waveform extraction.

    Handles:
    - small images
    - contrast differences
    - background/grid
    - vertical grid lines
    - horizontal grid lines
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    # --------------------------------------------------------
    # Upscale small images
    # --------------------------------------------------------

    height, width = gray.shape

    if width < 1000:

        scale = 2.5

        gray = cv2.resize(
            gray,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC,
        )

    # --------------------------------------------------------
    # Improve contrast
    # --------------------------------------------------------

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    gray = clahe.apply(gray)

    # --------------------------------------------------------
    # Slight smoothing
    # --------------------------------------------------------

    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0,
    )

    # --------------------------------------------------------
    # Adaptive threshold
    # --------------------------------------------------------

    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        31,
        7,
    )

    # --------------------------------------------------------
    # Remove vertical grid lines
    # --------------------------------------------------------

    vertical_kernel_height = max(
        20,
        gray.shape[0] // 10,
    )

    vertical_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (1, vertical_kernel_height),
    )

    vertical_lines = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        vertical_kernel,
    )

    cleaned = cv2.subtract(
        binary,
        vertical_lines,
    )

    # --------------------------------------------------------
    # Remove horizontal grid lines
    # --------------------------------------------------------

    horizontal_kernel_width = max(
        20,
        gray.shape[1] // 15,
    )

    horizontal_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (horizontal_kernel_width, 1),
    )

    horizontal_lines = cv2.morphologyEx(
        cleaned,
        cv2.MORPH_OPEN,
        horizontal_kernel,
    )

    cleaned = cv2.subtract(
        cleaned,
        horizontal_lines,
    )

    return cleaned


# ============================================================
# EEG CHANNEL EXTRACTION
# ============================================================

def extract_eeg_channels(
    image: np.ndarray,
) -> list[np.ndarray]:

    """
    Extract approximate EEG waveform channels.

    The method is intentionally tolerant because EEG report
    images can differ in:
    - resolution
    - number of channels
    - grid style
    - contrast
    - cropping
    - labels

    This produces an approximate digitized waveform.
    """

    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    cleaned = preprocess_eeg_image(image)

    height, width = cleaned.shape

    # --------------------------------------------------------
    # Ignore a small right-side label region.
    #
    # EEG labels are often placed on the right side.
    # --------------------------------------------------------

    waveform_width = int(width * 0.94)

    cleaned = cleaned[
        :,
        :waveform_width,
    ]

    # --------------------------------------------------------
    # Calculate horizontal activity.
    #
    # EEG traces create dark pixels distributed across
    # horizontal bands.
    # --------------------------------------------------------

    row_density = np.sum(
        cleaned > 0,
        axis=1,
    ).astype(float)

    # Smooth density
    smooth_kernel = np.ones(11) / 11

    smoothed = np.convolve(
        row_density,
        smooth_kernel,
        mode="same",
    )

    # --------------------------------------------------------
    # Detect candidate channel centers
    # --------------------------------------------------------

    min_distance = max(
        25,
        int(height * 0.045),
    )

    prominence = max(
        1.5,
        float(
            np.percentile(smoothed, 75)
            - np.percentile(smoothed, 45)
        ),
    )

    peaks, properties = find_peaks(
        smoothed,
        distance=min_distance,
        prominence=prominence,
    )

    # --------------------------------------------------------
    # If too few peaks were found, relax detection.
    # --------------------------------------------------------

    if len(peaks) < 4:

        peaks, properties = find_peaks(
            smoothed,
            distance=max(
                18,
                int(height * 0.035),
            ),
            prominence=1.0,
        )

    # --------------------------------------------------------
    # Limit number of candidates
    # --------------------------------------------------------

    if len(peaks) > 20:

        strengths = smoothed[peaks]

        strongest = np.argsort(
            strengths
        )[::-1][:20]

        peaks = np.sort(
            peaks[strongest]
        )

    # --------------------------------------------------------
    # Extract waveform around each candidate
    # --------------------------------------------------------

    channel_signals: list[np.ndarray] = []

    band_half_height = max(
        15,
        int(height * 0.055),
    )

    for center in peaks:

        start = max(
            0,
            int(center - band_half_height),
        )

        end = min(
            cleaned.shape[0],
            int(center + band_half_height),
        )

        region = cleaned[
            start:end,
            :,
        ]

        # ----------------------------------------------------
        # Extract one y-coordinate for every x-coordinate
        # ----------------------------------------------------

        signal = np.full(
            region.shape[1],
            np.nan,
            dtype=float,
        )

        for x in range(
            region.shape[1]
        ):

            ys = np.where(
                region[:, x] > 0
            )[0]

            if len(ys) == 0:
                continue

            absolute_y = ys + start

            # Select pixel closest to the channel center
            distances = np.abs(
                absolute_y - center
            )

            nearest_index = np.argmin(
                distances
            )

            nearest_y = float(
                absolute_y[nearest_index]
            )

            # Reject pixels too far from center
            if (
                abs(nearest_y - center)
                <= band_half_height
            ):
                signal[x] = nearest_y

        # ----------------------------------------------------
        # Quality check
        # ----------------------------------------------------

        valid = np.isfinite(signal)

        valid_ratio = (
            np.sum(valid)
            / max(len(signal), 1)
        )

        # More tolerant than previous implementation
        if valid_ratio < 0.20:
            continue

        # ----------------------------------------------------
        # Fill missing waveform points
        # ----------------------------------------------------

        if np.sum(valid) >= 2:

            signal = np.interp(
                np.arange(len(signal)),
                np.where(valid)[0],
                signal[valid],
            )

        else:
            continue

        # ----------------------------------------------------
        # Convert image Y-axis to signal direction
        # ----------------------------------------------------

        signal = -signal

        # ----------------------------------------------------
        # Normalize
        # ----------------------------------------------------

        signal_mean = signal.mean()

        signal_std = signal.std()

        signal = (
            signal - signal_mean
        ) / (
            signal_std + 1e-8
        )

        # ----------------------------------------------------
        # Reject completely flat signals
        # ----------------------------------------------------

        if np.std(signal) < 0.05:
            continue

        channel_signals.append(
            signal.astype(float)
        )

    # --------------------------------------------------------
    # Remove channels that are almost duplicates
    # --------------------------------------------------------

    if len(channel_signals) > 16:
        channel_signals = channel_signals[:16]

    return channel_signals


# ============================================================
# MODEL PREDICTION
# ============================================================

def predict_channels(
    channel_signals: list[np.ndarray],
):

    channel_results = []

    waveform = []

    # --------------------------------------------------------
    # Process every detected EEG channel
    # --------------------------------------------------------

    for index, signal in enumerate(
        channel_signals,
        start=1,
    ):

        signal = np.asarray(
            signal,
            dtype=float,
        )

        # Normalize again before model inference
        signal = (
            signal - signal.mean()
        ) / (
            signal.std() + 1e-8
        )

        # ----------------------------------------------------
        # Convert waveform to 178 features
        # ----------------------------------------------------

        features = resample(
            signal,
            178,
        )

        sample = pd.DataFrame(
            [features],
            columns=[
                f"X{i}"
                for i in range(1, 179)
            ],
        )

        # ----------------------------------------------------
        # Model prediction
        # ----------------------------------------------------

        probability = float(
            MODEL.predict_proba(
                sample
            )[0, 1]
        )

        channel_results.append(
            {
                "id": index,
                "label": f"Ch{index}",
                "seizureProbability": round(
                    probability * 100,
                    4,
                ),
                "status": "analyzed",
            }
        )

        # ----------------------------------------------------
        # Waveform for frontend
        # ----------------------------------------------------

        chart_values = signal

        max_points = 400

        if len(chart_values) > max_points:

            chart_values = resample(
                chart_values,
                max_points,
            )

        waveform.append(
            {
                "channel": f"ch{index}",
                "label": f"Ch{index}",
                "values": [
                    round(
                        float(v),
                        4,
                    )
                    for v in chart_values
                ],
            }
        )

    # --------------------------------------------------------
    # Overall probability
    # --------------------------------------------------------

    probabilities = [
        item["seizureProbability"]
        for item in channel_results
    ]

    seizure_probability = float(
        np.mean(probabilities)
    )

    non_seizure_probability = (
        100.0
        - seizure_probability
    )

    # --------------------------------------------------------
    # Final decision
    # --------------------------------------------------------

    result = (
        "seizure"
        if (
            seizure_probability / 100.0
            >= THRESHOLD
        )
        else "non_seizure"
    )

    # --------------------------------------------------------
    # Signal quality
    # --------------------------------------------------------

    channel_count = len(
        channel_results
    )

    if channel_count >= 8:
        signal_quality = "good"

    elif channel_count >= 4:
        signal_quality = "fair"

    else:
        signal_quality = "poor"

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "nonSeizureProbability": round(
            non_seizure_probability,
            2,
        ),

        "seizureProbability": round(
            seizure_probability,
            2,
        ),

        "result": result,

        "signalQuality": signal_quality,

        "channelsDetected": channel_count,

        "waveform": waveform,

        "channels": [
            {
                "id": item["id"],
                "label": item["label"],
                "status": item["status"],
            }
            for item in channel_results
        ],

        "channelProbabilities": channel_results,

        "processingTimeMs": 0,

        "isDemoResult": False,

        "decisionThreshold": round(
            THRESHOLD * 100,
            2,
        ),

        "disclaimer": (
            "Experimental ML prototype. "
            "This output indicates a model-estimated "
            "seizure-like EEG pattern and is not a "
            "medical diagnosis. It should not replace "
            "evaluation by a qualified healthcare "
            "professional."
        ),
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "ok",
        "modelLoaded": True,
        "threshold": THRESHOLD,
    }


# ============================================================
# ANALYZE EEG IMAGE
# ============================================================

@app.post("/api/analyze")
async def analyze(
    file: UploadFile = File(...),
):

    start = time.perf_counter()

    # --------------------------------------------------------
    # Allowed file types
    # --------------------------------------------------------

    allowed = {
        ".png",
        ".jpg",
        ".jpeg",
        ".pdf",
    }

    filename = file.filename or "upload.png"

    suffix = Path(
        filename
    ).suffix.lower()

    if suffix not in allowed:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Upload PNG, JPG, JPEG, or PDF."
            ),
        )

    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------

    data = await file.read()

    if not data:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    # --------------------------------------------------------
    # Maximum file size: 20 MB
    # --------------------------------------------------------

    if len(data) > 20 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail=(
                "File is too large. "
                "Maximum size is 20 MB."
            ),
        )

    # --------------------------------------------------------
    # Decode image/PDF
    # --------------------------------------------------------

    image = decode_upload(
        data,
        filename,
    )

    # --------------------------------------------------------
    # Basic image validation
    # --------------------------------------------------------

    if image is None:

        raise HTTPException(
            status_code=400,
            detail="Could not process the uploaded file.",
        )

    # --------------------------------------------------------
    # Extract EEG channels
    # --------------------------------------------------------

    channels = extract_eeg_channels(
        image
    )

    # --------------------------------------------------------
    # Reject only if extraction genuinely failed
    # --------------------------------------------------------

    if len(channels) < 2:

        raise HTTPException(
            status_code=422,
            detail=(
                "The system could not reliably "
                "extract EEG waveforms from this image. "
                "Please upload another EEG report image."
            ),
        )

    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    response = predict_channels(
        channels
    )

    # --------------------------------------------------------
    # Processing time
    # --------------------------------------------------------

    response[
        "processingTimeMs"
    ] = round(
        (
            time.perf_counter()
            - start
        )
        * 1000
    )

    response[
        "fileName"
    ] = filename

    return response