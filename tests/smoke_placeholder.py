import os
from urllib.error import URLError
from urllib.request import urlopen


def test_application_is_available():
    app_url = os.environ["APP_URL"]

    try:
        with urlopen(app_url, timeout=10) as response:
            assert response.status == 200, (
                f"Smoke test failed: expected HTTP 200, got HTTP {response.status}"
            )
    except URLError as error:
        raise AssertionError(
            f"Smoke test failed: application is unavailable at {app_url}. Reason: {error}"
        ) from error


if __name__ == "__main__":
    test_application_is_available()
    print("Smoke placeholder passed")