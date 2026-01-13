# Botnoi audio generation (tone examples)

This project ships empty placeholder MP3s for every example word. Generate real audio with Botnoi, save them with the filenames below into `data/audio/`, then copy them into `tone-cheatsheet/public/audio/` for the web app to play.

## Filenames to produce

| Thai | Tone | Filename |
| --- | --- | --- |
| กา | สามัญ | ka-samanj.mp3 |
| ก่า | เอก | ka-ek.mp3 |
| ก้า | โท | ka-tho.mp3 |
| ก๊า | ตรี | ka-tri.mp3 |
| ก๋า | จัตวา | ka-jatwa.mp3 |
| จะ | เอก | ja-ek.mp3 |
| จ้ะ | โท | ja-tho.mp3 |
| จ๊ะ | ตรี | ja-tri.mp3 |
| จ๋ะ | จัตวา | ja-jatwa.mp3 |
| ขา | จัตวา | kha-long-jatwa.mp3 |
| ข่า | เอก | kha-long-ek.mp3 |
| ข้า | โท | kha-long-tho.mp3 |
| ขะ | เอก | kha-short-ek.mp3 |
| ข้ะ | โท | kha-short-tho.mp3 |
| คา | สามัญ | kha-low-samanj.mp3 |
| ค่า | โท | kha-low-tho.mp3 |
| ค้า | ตรี | kha-low-tri.mp3 |
| คะ | ตรี | kha-short-low-tri.mp3 |
| ค่ะ | โท | kha-short-low-tho.mp3 |
| ค๋ะ | จัตวา | kha-short-low-jatwa.mp3 |
| โคก | โท | khok-tho.mp3 |
| โค้ก | ตรี | khohk-tri.mp3 |

## Quick generation steps

1) Open `notebook/botnoi-sample.ipynb` to see a working call. Use your own `BOTNOI_TOKEN` (do **not** commit secrets).  
2) Python snippet you can reuse in the notebook or a script:

```python
import os, requests, pathlib

TOKEN = os.environ["BOTNOI_TOKEN"]
url = "https://api-voice.botnoi.ai/openapi/v1/generate_audio"

def synth(text, speaker="1", volume=1, speed=1):
    payload = {
        "text": text,
        "speaker": speaker,
        "volume": volume,
        "speed": speed,
        "type_media": "mp3",
        "save_file": "true",
        "language": "th",
        "page": "user",
    }
    headers = {"Content-Type": "application/json", "botnoi-token": TOKEN}
    resp = requests.post(url, json=payload, headers=headers)
    resp.raise_for_status()
    return resp.json()["audio_url"]

def download(audio_url, dest_path):
    audio_bytes = requests.get(audio_url).content
    pathlib.Path(dest_path).write_bytes(audio_bytes)
```

3) For each row in the table, call `audio_url = synth("<thai text>")`, then `download(audio_url, f"data/audio/<filename>")`.  
4) Mirror into the app: `cp data/audio/*.mp3 tone-cheatsheet/public/audio/`.  
5) Run the app and click the 🔊 button beside each example to confirm playback.

If Botnoi returns a non-200 response, re-run that word; keep filenames exactly as listed so the UI resolves them.
