import os
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from recognizer import LicensePlateRecognizer

app = FastAPI(title="License Plate Recognition Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

recognizer = LicensePlateRecognizer()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "lpr"}


@app.post("/recognize")
async def recognize(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (jpeg, png, etc.)")

    start = time.perf_counter()
    image_bytes = await image.read()

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty image file")

    result = recognizer.recognize(image_bytes)
    result["processing_time_ms"] = int((time.perf_counter() - start) * 1000)

    return result


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
