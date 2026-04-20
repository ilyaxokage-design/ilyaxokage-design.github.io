from pathlib import Path


INDEX_PATH = Path(__file__).resolve().parents[1] / "index.html"


def main() -> int:
    html = INDEX_PATH.read_text(encoding="utf-8")

    assert "Екологічні проблеми без простих відповідей" not in html, (
        "Old heading copy should not remain in the start screen."
    )
    assert "<h1>Екологічні проблеми</h1>" in html, (
        "Start screen should use the shorter ecological problems heading."
    )

    print("Content copy checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
