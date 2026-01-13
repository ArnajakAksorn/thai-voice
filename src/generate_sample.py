# pyright: reportMissingImports=false
"""Generate Thai tone audio files via Botnoi and sync to app assets.

Requires env var BOTNOI_TOKEN (kept private; never logged).
"""

from __future__ import annotations

import json
import os
import shutil
import time
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

import requests  # type: ignore[reportMissingImports]


API_URL = "https://api-voice.botnoi.ai/openapi/v1/generate_audio"
SOURCE_DIR = Path("data/audio")
DEST_DIR = Path("tone-cheatsheet/public/audio")
MAX_ATTEMPTS = 3
BACKOFF_SECONDS = 2

# Word → filename mapping (keep order stable)
WORD_FILE_MAP: Sequence[Tuple[str, str]] = [
    ("กา", "ka-samanj.mp3"),
    ("ก่า", "ka-ek.mp3"),
    ("ก้า", "ka-tho.mp3"),
    ("ก๊า", "ka-tri.mp3"),
    ("ก๋า", "ka-jatwa.mp3"),
    ("จะ", "ja-ek.mp3"),
    ("จ้ะ", "ja-tho.mp3"),
    ("จ๊ะ", "ja-tri.mp3"),
    ("จ๋ะ", "ja-jatwa.mp3"),
    ("ขา", "kha-long-jatwa.mp3"),
    ("ข่า", "kha-long-ek.mp3"),
    ("ข้า", "kha-long-tho.mp3"),
    ("ขะ", "kha-short-ek.mp3"),
    ("ข้ะ", "kha-short-tho.mp3"),
    ("คา", "kha-low-samanj.mp3"),
    ("ค่า", "kha-low-tho.mp3"),
    ("ค้า", "kha-low-tri.mp3"),
    ("คะ", "kha-short-low-tri.mp3"),
    ("ค่ะ", "kha-short-low-tho.mp3"),
    ("ค๋ะ", "kha-short-low-jatwa.mp3"),
    ("โคก", "khok-tho.mp3"),
    ("โค้ก", "khohk-tri.mp3"),
]


class GenerationError(Exception):
    """Raised when audio generation fails after retries."""


def build_payload(text: str) -> Dict[str, object]:
    return {
        "text": text,
        "speaker": "1",
        "volume": 1,
        "speed": 1,
        "type_media": "mp3",
        "save_file": "true",
        "language": "th",
        "page": "user",
    }


def ensure_dirs() -> None:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    DEST_DIR.mkdir(parents=True, exist_ok=True)


def request_audio_url(
    word: str, token: str, session: requests.Session, attempt: int
) -> str:
    headers = {
        "Content-Type": "application/json",
        "botnoi-token": token,
    }
    payload = build_payload(word)
    response = session.post(API_URL, json=payload, headers=headers, timeout=20)
    try:
        response.raise_for_status()
    except Exception as exc:
        raise GenerationError(f"[{word}] POST failed (attempt {attempt}): {exc}") from exc

    try:
        data = response.json()
    except json.JSONDecodeError as exc:
        raise GenerationError(f"[{word}] Non-JSON response (attempt {attempt})") from exc

    audio_url = data.get("audio_url")
    if not audio_url:
        raise GenerationError(f"[{word}] Missing audio_url (attempt {attempt}); data={data}")
    return audio_url


def download_audio(audio_url: str, word: str, filename: str, session: requests.Session) -> bytes:
    resp = session.get(audio_url, timeout=30)
    try:
        resp.raise_for_status()
    except Exception as exc:
        raise GenerationError(f"[{word}] Download failed for {filename}: {exc}") from exc
    return resp.content


def write_bytes(path: Path, data: bytes) -> None:
    path.write_bytes(data)
    if not path.exists() or path.stat().st_size == 0:
        raise GenerationError(f"File empty after write: {path}")


def generate_one(word: str, filename: str, token: str, session: requests.Session) -> Path:
    target_path = SOURCE_DIR / filename
    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            audio_url = request_audio_url(word, token, session, attempt)
            audio_bytes = download_audio(audio_url, word, filename, session)
            write_bytes(target_path, audio_bytes)
            return target_path
        except Exception as exc:  # noqa: BLE001 - want to capture all errors for retry
            last_error = exc
            if attempt < MAX_ATTEMPTS:
                sleep_time = BACKOFF_SECONDS * attempt
                print(f"[retry] {word} -> {filename} (attempt {attempt}/{MAX_ATTEMPTS}): {exc}")
                time.sleep(sleep_time)
            else:
                break

    raise GenerationError(
        f"[{word}] Failed after {MAX_ATTEMPTS} attempts: {last_error}"
        if last_error
        else f"[{word}] Failed after {MAX_ATTEMPTS} attempts"
    )


def copy_to_public(filenames: Iterable[str]) -> List[str]:
    copied: List[str] = []
    for name in filenames:
        src = SOURCE_DIR / name
        dest = DEST_DIR / name
        try:
            if not src.exists() or src.stat().st_size == 0:
                raise FileNotFoundError(f"source missing or empty: {src}")
            shutil.copy2(src, dest)
            if not dest.exists() or dest.stat().st_size == 0:
                raise FileNotFoundError(f"dest missing or empty after copy: {dest}")
            copied.append(name)
        except Exception as exc:  # noqa: BLE001
            print(f"[copy-failed] {name}: {exc}")
    return copied


def main() -> int:
    token = os.environ.get("BOTNOI_TOKEN")
    if not token:
        print("BOTNOI_TOKEN is not set; aborting.")
        return 1

    ensure_dirs()
    session = requests.Session()

    successes: List[str] = []
    failures: List[Tuple[str, str]] = []

    print(f"Starting generation for {len(WORD_FILE_MAP)} items...")
    for word, filename in WORD_FILE_MAP:
        try:
            path = generate_one(word, filename, token, session)
            print(f"[ok] {word} -> {path}")
            successes.append(filename)
        except Exception as exc:  # noqa: BLE001
            print(f"[fail] {word} -> {filename}: {exc}")
            failures.append((filename, str(exc)))

    copied = copy_to_public(successes)

    print("\nSummary:")
    print(f"  Generated: {len(successes)}")
    print(f"  Failed:    {len(failures)}")
    if failures:
        for filename, msg in failures:
            print(f"    - {filename}: {msg}")
    print(f"  Copied to public: {len(copied)} of {len(successes)}")

    return 0 if not failures else 2


if __name__ == "__main__":
    raise SystemExit(main())
