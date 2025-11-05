#!/usr/bin/env python3
"""
Fetch project metadata (stars, forks, description) and update the Projects section in index.html.

Usage:
    python scripts/update_projects.py

Environment variables:
    GITHUB_TOKEN (optional): increases the GitHub API rate limit.
"""

from __future__ import annotations

import dataclasses
import html
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "index.html"
DATA_PATH = ROOT / "data" / "projects.json"

PROJECTS_START = "<!-- PROJECTS_LIST_START -->"
PROJECTS_END = "<!-- PROJECTS_LIST_END -->"


@dataclasses.dataclass
class Project:
    name: str
    url: str
    stars: Optional[int] = None
    forks: Optional[int] = None
    description: Optional[str] = None
    fallback_meta: Optional[str] = None
    fallback_description: Optional[str] = None

    @property
    def is_github(self) -> bool:
        parsed = urlparse(self.url)
        return parsed.netloc == "github.com" and len(parsed.path.strip("/").split("/")) >= 2

    @property
    def github_slug(self) -> Optional[str]:
        if not self.is_github:
            return None
        parts = urlparse(self.url).path.strip("/").split("/")
        return "/".join(parts[:2])


def load_projects() -> List[Project]:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    projects: List[Project] = []
    for entry in data:
        projects.append(
            Project(
                name=entry["name"],
                url=entry["url"],
                fallback_meta=entry.get("fallback_meta"),
                fallback_description=entry.get("fallback_description"),
            )
        )
    return projects


def fetch_github_metadata(project: Project, token: Optional[str]) -> None:
    slug = project.github_slug
    if not slug:
        return

    api_url = f"https://api.github.com/repos/{slug}"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "project-metadata-updater",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        with urlopen(Request(api_url, headers=headers), timeout=10) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        print(f"[warn] Failed to fetch {slug}: {exc}", file=sys.stderr)
        return
    except URLError as exc:
        print(f"[warn] Network error for {slug}: {exc}", file=sys.stderr)
        return

    project.stars = payload.get("stargazers_count")
    project.forks = payload.get("forks_count")
    project.description = payload.get("description") or ""


META_DESCRIPTION_RE = re.compile(
    r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)


def fetch_site_description(project: Project) -> None:
    try:
        with urlopen(project.url, timeout=10) as resp:
            content_type = resp.headers.get("Content-Type", "")
            if "text/html" not in content_type:
                return
            html_bytes = resp.read()
    except Exception as exc:  # pylint: disable=broad-except
        print(f"[warn] Failed to fetch description for {project.url}: {exc}", file=sys.stderr)
        return

    match = META_DESCRIPTION_RE.search(html_bytes.decode("utf-8", errors="ignore"))
    if match:
        project.description = match.group(1).strip()


def format_count(value: Optional[int]) -> Optional[str]:
    if value is None:
        return None
    if value < 1000:
        return str(value)
    for threshold, suffix in [(1_000_000, "M"), (1_000, "k")]:
        if value >= threshold:
            formatted = value / float(threshold)
            return f"{formatted:.1f}".rstrip("0").rstrip(".") + suffix
    return str(value)


def build_project_html(projects: List[Project]) -> str:
    lines = []
    for project in projects:
        stars = format_count(project.stars)
        forks = format_count(project.forks)
        pieces = []
        if stars:
            pieces.append(f"{stars} stars")
        if forks:
            pieces.append(f"{forks} forks")
        meta = " · ".join(pieces) or (project.fallback_meta or "")

        description = project.description or project.fallback_description or ""

        lines.append(
            "                <li class=\"project-item\">\n"
            f"                    <p class=\"item-title\"><a href=\"{html.escape(project.url)}\" target=\"_blank\" rel=\"noopener noreferrer\">{html.escape(project.name)}</a></p>\n"
            f"                    <p class=\"project-meta\">{html.escape(meta)}</p>\n"
            f"                    <p class=\"project-description\">{html.escape(description)}</p>\n"
            "                </li>"
        )
    return "\n".join(lines)


def update_index(project_html: str) -> None:
    content = INDEX_PATH.read_text(encoding="utf-8")
    if PROJECTS_START not in content or PROJECTS_END not in content:
        raise RuntimeError("Project markers not found in index.html")

    start_idx = content.index(PROJECTS_START) + len(PROJECTS_START)
    end_idx = content.index(PROJECTS_END)

    before = content[:start_idx]
    after = content[end_idx:]

    replacement = "\n" + project_html + "\n                "
    INDEX_PATH.write_text(before + replacement + after, encoding="utf-8")


def main() -> None:
    if not DATA_PATH.exists():
        print(f"[error] Missing data file: {DATA_PATH}", file=sys.stderr)
        sys.exit(1)

    projects = load_projects()
    token = os.environ.get("GITHUB_TOKEN")

    for project in projects:
        if project.is_github:
            fetch_github_metadata(project, token)
    project_html = build_project_html(projects)
    update_index(project_html)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"[info] Updated {INDEX_PATH} with {len(projects)} projects on {timestamp}.")


if __name__ == "__main__":
    main()
