#!/usr/bin/env python3
"""Update README.md with the latest message from a Discord channel."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any

README_PATH = "README.md"
START_MARKER = "<!-- DISCORD_UPDATES_START -->"
END_MARKER = "<!-- DISCORD_UPDATES_END -->"
DISCORD_API_BASE = "https://discord.com/api/v10"


class UpdateError(RuntimeError):
    """Raised when the README update cannot be completed."""


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise UpdateError(f"Missing required environment variable: {name}")
    return value


def _discord_request(url: str, token: str) -> Any:
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bot {token}",
            "User-Agent": "west-cleaning-readme-updater/1.0",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise UpdateError(f"Discord API request failed ({exc.code}): {body}") from exc
    except urllib.error.URLError as exc:
        raise UpdateError(f"Network error while calling Discord API: {exc}") from exc


def _to_utc_string(iso_timestamp: str) -> str:
    parsed = datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))
    return parsed.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def _sanitize_markdown(text: str) -> str:
    text = text.replace("\r\n", "\n").strip()
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    return text


def build_update_block(message: dict[str, Any], channel_name: str) -> str:
    author = message.get("author", {}).get("username", "Unknown user")
    content = _sanitize_markdown(message.get("content") or "")
    timestamp = _to_utc_string(message["timestamp"])

    if not content:
        content = "_(No text content in the latest update message.)_"

    attachment_lines = []
    for attachment in message.get("attachments", []):
        url = attachment.get("url")
        filename = attachment.get("filename", "attachment")
        if url:
            attachment_lines.append(f"- [{filename}]({url})")

    attachment_section = ""
    if attachment_lines:
        attachment_section = "\n\n**Attachments**\n" + "\n".join(attachment_lines)

    return (
        f"### Latest Discord Update (Known Bugs & Issues)\n\n"
        f"- **Channel:** {channel_name}\n"
        f"- **Author:** {author}\n"
        f"- **Posted:** {timestamp}\n\n"
        f"> {content.replace(chr(10), chr(10) + '> ')}"
        f"{attachment_section}\n"
    )


def update_readme(readme_text: str, replacement: str) -> str:
    pattern = re.compile(
        rf"{re.escape(START_MARKER)}.*?{re.escape(END_MARKER)}",
        flags=re.DOTALL,
    )
    block = f"{START_MARKER}\n{replacement}\n{END_MARKER}"

    if START_MARKER in readme_text and END_MARKER in readme_text:
        return pattern.sub(block, readme_text)

    return readme_text.rstrip() + "\n\n" + block + "\n"


def main() -> int:
    token = _required_env("DISCORD_BOT_TOKEN")
    channel_id = _required_env("DISCORD_CHANNEL_ID")

    channel_data = _discord_request(f"{DISCORD_API_BASE}/channels/{channel_id}", token)
    messages = _discord_request(
        f"{DISCORD_API_BASE}/channels/{channel_id}/messages?limit=1", token
    )

    if not messages:
        raise UpdateError("No messages found in the configured Discord channel.")

    latest_message = messages[0]
    channel_name = channel_data.get("name", f"Channel {channel_id}")
    replacement = build_update_block(latest_message, channel_name)

    with open(README_PATH, "r", encoding="utf-8") as file:
        current = file.read()

    updated = update_readme(current, replacement)

    if updated != current:
        with open(README_PATH, "w", encoding="utf-8") as file:
            file.write(updated)
        print("README.md updated with the latest Discord message.")
    else:
        print("README.md is already up to date.")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except UpdateError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
