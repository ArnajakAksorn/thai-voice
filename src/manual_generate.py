# pyright: reportMissingImports=false
"""Manually generate a single Thai audio file via Botnoi.

Usage:
    python src/manual_generate.py --text "ขา" --output "kha-long-jatwa.mp3"

Env:
    BOTNOI_TOKEN must be set (kept private; not logged).
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Dict

import requests  # type: ignore[reportMissingImports]

API_URL = "https://api-voice.botnoi.ai/openapi/v1/generate_audio"
SOURCE_DIR = Path("data/audio")
DEST_DIR = Path("tone-cheatsheet/public/audio")
MAX_ATTEMPTS = 3
BACKOFF_SECONDS = 2


class GenerationError(Exception):
    """Raised when audio generation fails after retries."""


def build_payload(text: str, speaker: str, volume: float, speed: float) -> Dict[str, object]:
    return {
        "text": text,
        "speaker": speaker,
        "volume": volume,
        "speed": speed,
        "type_media": "mp3",
        "save_file": "true",
        "language": "th",
        "page": "user",
    }


def ensure_dirs() -> None:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    DEST_DIR.mkdir(parents=True, exist_ok=True)


def request_audio_url(
    text: str, token: str, payload: Dict[str, object], session: requests.Session, attempt: int
) -> str:
    headers = {"Content-Type": "application/json", "botnoi-token": token}
    response = session.post(API_URL, json=payload, headers=headers, timeout=20)
    try:
        response.raise_for_status()
    except Exception as exc:
        raise GenerationError(f"POST failed (attempt {attempt}): {exc}") from exc

    try:
        data = response.json()
    except json.JSONDecodeError as exc:
        raise GenerationError(f"Non-JSON response (attempt {attempt})") from exc

    audio_url = data.get("audio_url")
    if not audio_url:
        raise GenerationError(f"Missing audio_url (attempt {attempt}); data={data}")
    return audio_url


def download_audio(audio_url: str, session: requests.Session) -> bytes:
    resp = session.get(audio_url, timeout=30)
    try:
        resp.raise_for_status()
    except Exception as exc:
        raise GenerationError(f"Download failed: {exc}") from exc
    return resp.content


def write_bytes(path: Path, data: bytes) -> None:
    path.write_bytes(data)
    if not path.exists() or path.stat().st_size == 0:
        raise GenerationError(f"File empty after write: {path}")


def copy_to_public(filename: str) -> None:
    src = SOURCE_DIR / filename
    dest = DEST_DIR / filename
    if not src.exists() or src.stat().st_size == 0:
        raise GenerationError(f"source missing or empty: {src}")
    shutil.copy2(src, dest)
    if not dest.exists() or dest.stat().st_size == 0:
        raise GenerationError(f"dest missing or empty after copy: {dest}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Manual Botnoi audio generator")
    parser.add_argument("--text", required=True, help="Thai text to synthesize")
    parser.add_argument(
        "--output",
        required=True,
        help="Output filename (e.g., custom.mp3). Stored under data/audio/",
    )
    parser.add_argument("--speaker", default="1", help="Speaker id (default: 1)")
    parser.add_argument("--volume", type=float, default=1.0, help="Volume (default: 1)")
    parser.add_argument("--speed", type=float, default=1.0, help="Speed (default: 1)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    # token = os.environ.get("BOTNOI_TOKEN")
    # if not token:
    #     print("BOTNOI_TOKEN is not set; aborting.")
    #     return 1
    token = 'MKxsMU7u7hC6iUBJzKLbraO1Cb21D6AM'

    ensure_dirs()
    session = requests.Session()

    payload = build_payload(args.text, args.speaker, args.volume, args.speed)
    target_path = SOURCE_DIR / args.output
    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            audio_url = request_audio_url(args.text, token, payload, session, attempt)
            audio_bytes = download_audio(audio_url, session)
            write_bytes(target_path, audio_bytes)
            copy_to_public(args.output)
            size_bytes = target_path.stat().st_size
            print(f"[ok] {args.text} -> {target_path} ({size_bytes} bytes)")
            return 0
        except Exception as exc:  # noqa: BLE001 - capture all for retries
            last_error = exc
            if attempt < MAX_ATTEMPTS:
                sleep_time = BACKOFF_SECONDS * attempt
                print(f"[retry] attempt {attempt}/{MAX_ATTEMPTS}: {exc}")
                time.sleep(sleep_time)
            else:
                break

    print(f"[fail] gave up after {MAX_ATTEMPTS} attempts: {last_error}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
