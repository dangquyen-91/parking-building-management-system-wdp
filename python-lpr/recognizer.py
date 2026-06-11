import os
import re
import base64
import logging
import cv2
import numpy as np
import requests
import easyocr

logger = logging.getLogger(__name__)

_PLATE_RE = re.compile(r'\d{2}[A-Z]{1,2}\d{4,5}')

ROBOFLOW_API_URL = "https://detect.roboflow.com"


def _apply_clahe_gamma(image: np.ndarray, gamma: float = 1.2) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    table = np.array(
        [(i / 255.0) ** (1.0 / gamma) * 255 for i in range(256)], dtype=np.uint8
    )
    enhanced = cv2.LUT(enhanced, table)
    return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)


def _normalize(text: str) -> str:
    return text.upper().replace(' ', '').replace('-', '').replace('.', '').replace('_', '')


def _search_plate_in_texts(ocr_results: list[tuple[str, float]]) -> tuple[str | None, float]:
    """
    Try three strategies to find a VN plate pattern from OCR results:
    1. Each individual text
    2. All texts concatenated (handles 2-line plates read as separate strings)
    3. Consecutive pairs concatenated
    """
    best_plate = None
    best_conf = 0.0

    texts = [t for t, _ in ocr_results]
    confs = [c for _, c in ocr_results]

    for text, conf in ocr_results:
        m = _PLATE_RE.search(text)
        if m and conf > best_conf:
            best_plate = m.group()
            best_conf = conf

    combined = ''.join(texts)
    m = _PLATE_RE.search(combined)
    if m:
        avg_conf = sum(confs) / len(confs) if confs else 0.0
        if avg_conf > best_conf:
            best_plate = m.group()
            best_conf = avg_conf

    for i in range(len(texts) - 1):
        pair = texts[i] + texts[i + 1]
        m = _PLATE_RE.search(pair)
        if m:
            pair_conf = (confs[i] + confs[i + 1]) / 2
            if pair_conf > best_conf:
                best_plate = m.group()
                best_conf = pair_conf

    return best_plate, best_conf


class LicensePlateRecognizer:
    def __init__(self):
        self.api_key = os.environ["ROBOFLOW_API_KEY"]
        self.model_id = os.getenv("ROBOFLOW_MODEL_ID", "vietnamese-license-plate-tptd0/1")
        self.reader = easyocr.Reader(['en'], gpu=False)
        logger.info("LicensePlateRecognizer ready (model=%s)", self.model_id)

    def _detect_plates(self, image_bytes: bytes) -> list[dict]:
        b64 = base64.b64encode(image_bytes).decode('utf-8')
        url = f"{ROBOFLOW_API_URL}/{self.model_id}"
        try:
            resp = requests.post(
                url,
                params={"api_key": self.api_key},
                data=b64,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10,
            )
            resp.raise_for_status()
            preds = resp.json().get("predictions", [])
            logger.info("Roboflow detected %d plate(s)", len(preds))
            return preds
        except requests.RequestException as e:
            logger.error("Roboflow API error: %s", e)
            return []

    def _ocr_image(self, image: np.ndarray) -> list[tuple[str, float]]:
        enhanced = _apply_clahe_gamma(image)
        results = self.reader.readtext(enhanced, detail=1)
        ocr_results = [(_normalize(text), conf) for (_, text, conf) in results]
        logger.info("OCR raw results: %s", [(t, round(c, 2)) for t, c in ocr_results])
        return ocr_results

    def recognize(self, image_bytes: bytes) -> dict:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            return {"license_plate": None, "confidence": 0.0, "bbox": None, "error": "Cannot decode image"}

        best_plate: str | None = None
        best_conf: float = 0.0
        best_bbox: list | None = None

        predictions = self._detect_plates(image_bytes)

        for pred in predictions:
            x1 = int(pred["x"] - pred["width"] / 2)
            y1 = int(pred["y"] - pred["height"] / 2)
            x2 = int(pred["x"] + pred["width"] / 2)
            y2 = int(pred["y"] + pred["height"] / 2)
            det_conf = float(pred["confidence"])

            crop = img[y1:y2, x1:x2]
            if crop.size == 0:
                continue

            ocr_results = self._ocr_image(crop)
            plate, ocr_conf = _search_plate_in_texts(ocr_results)
            if plate:
                combined = det_conf * ocr_conf
                if combined > best_conf:
                    best_plate = plate
                    best_conf = combined
                    best_bbox = [x1, y1, x2, y2]

        if best_plate is None:
            logger.info("Roboflow detected nothing, running OCR on full image")
            ocr_results = self._ocr_image(img)
            plate, conf = _search_plate_in_texts(ocr_results)
            if plate:
                best_plate = plate
                best_conf = conf

        logger.info("Final result: plate=%s conf=%.4f", best_plate, best_conf)
        return {
            "license_plate": best_plate,
            "confidence": round(best_conf, 4),
            "bbox": best_bbox,
        }
