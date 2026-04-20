from __future__ import annotations

import json
import re
import subprocess
import sys
import time
from pathlib import Path

from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
PORT = 8012
BASE_URL = f"http://127.0.0.1:{PORT}"
START_URL = f"{BASE_URL}/tests/mobile-layout-start.html"
QUESTION_URL = f"{BASE_URL}/tests/mobile-layout-question.html"


def find_chrome() -> str:
    candidates = [
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    ]

    for candidate in candidates:
        if candidate.exists():
            return str(candidate)

    raise RuntimeError("Chrome or Edge was not found for mobile layout verification.")


def wait_for_server() -> None:
    deadline = time.time() + 10

    while time.time() < deadline:
        try:
            with urlopen(BASE_URL, timeout=1):
                return
        except Exception:
            time.sleep(0.25)

    raise RuntimeError("Local test server did not start in time.")


def dump_report(browser: str, url: str) -> dict[str, int]:
    result = subprocess.run(
        [
            browser,
            "--headless=new",
            "--disable-gpu",
            "--window-size=430,932",
            "--virtual-time-budget=12000",
            "--dump-dom",
            url,
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    match = re.search(r"<pre id=\"report\">(.*?)</pre>", result.stdout, re.DOTALL)
    if not match:
        raise RuntimeError(f"Could not parse report from {url}")

    payload = match.group(1).strip()
    if payload == "PENDING":
        raise RuntimeError(f"Test page did not finish rendering for {url}")

    return json.loads(payload)


def assert_mobile_layout(start: dict[str, int], question: dict[str, int]) -> None:
    failures: list[str] = []

    if start["posterImageHeight"] > 220:
        failures.append(
            f"Start poster image is too tall on mobile ({start['posterImageHeight']}px > 220px)."
        )

    if start["startButtonWidth"] < int(start["heroActionsWidth"] * 0.88):
        failures.append("Start button should span most of the action row on mobile.")

    if start["posterCopyTop"] - start["posterImageBottom"] < 10:
        failures.append("Poster text should sit clearly below the image on mobile.")

    if start["posterLeadFontSize"] > 19:
        failures.append("Poster lead text is too large for the mobile poster block.")

    if question["imageHeight"] > 300:
        failures.append(
            f"Question image is too tall on mobile ({question['imageHeight']}px > 300px)."
        )

    if question["scoreWidth"] < int(question["statsWidth"] * 0.42):
        failures.append("Score card should grow to a wide half-width block on mobile.")

    if question["timerWidth"] < int(question["statsWidth"] * 0.42):
        failures.append("Timer card should grow to a wide half-width block on mobile.")

    if question["overlayWidth"] > int(question["visualWidth"] * 0.78):
        failures.append("Context overlay should leave more of the image visible on mobile.")

    if question["overlayHeight"] > 150:
        failures.append(
            f"Context overlay is too tall on mobile ({question['overlayHeight']}px > 150px)."
        )

    if failures:
        raise AssertionError("\n".join(failures))


def main() -> int:
    browser = find_chrome()
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_server()
        start_report = dump_report(browser, START_URL)
        question_report = dump_report(browser, QUESTION_URL)
        assert_mobile_layout(start_report, question_report)
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()

    print("Mobile layout checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
