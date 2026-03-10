"""Watched directories API routes."""

import json
import os
import uuid

import aiosqlite
from fastapi import APIRouter, Depends, HTTPException

from app.core.activity import log_activity
from app.core.dependencies import get_db, require_auth
from app.models.discovery import DirectoryCreate

router = APIRouter(prefix="/directories", tags=["directories"], dependencies=[Depends(require_auth)])


def _validate_directory_path(path: str) -> str:
    """Validate and normalize a watched directory path."""
    if not os.path.isabs(path):
        raise HTTPException(400, "Path must be absolute")

    normalized = os.path.normpath(path)
    blocked_prefixes = (
        "/etc", "/usr", "/bin", "/sbin", "/lib", "/boot",
        "/proc", "/sys", "/dev", "/var/run", "/root",
    )
    for prefix in blocked_prefixes:
        if normalized == prefix or normalized.startswith(prefix + "/"):
            raise HTTPException(400, f"Cannot watch system directory: {prefix}")

    if not os.path.isdir(normalized):
        raise HTTPException(400, f"Path does not exist: {normalized}")

    return normalized


@router.get("")
async def list_directories(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM watched_directories ORDER BY path")
    rows = await cursor.fetchall()
    dirs = []
    for row in rows:
        d = dict(row)
        d["exclude_patterns"] = json.loads(d.get("exclude_patterns", "[]"))
        d["enabled"] = bool(d["enabled"])
        dirs.append(d)
    total = len(dirs)
    return {"items": dirs, "directories": dirs, "total": total, "limit": 50, "offset": 0, "has_more": False}


@router.post("", status_code=201)
async def add_directory(body: DirectoryCreate, db: aiosqlite.Connection = Depends(get_db)):
    body.path = _validate_directory_path(body.path)

    # Check for duplicate path
    cursor = await db.execute("SELECT id FROM watched_directories WHERE path = ?", (body.path,))
    if await cursor.fetchone():
        raise HTTPException(409, f"Directory already watched: {body.path}")

    dir_id = str(uuid.uuid4())[:8]
    await db.execute(
        """INSERT INTO watched_directories (id, path, label, exclude_patterns, enabled)
        VALUES (?, ?, ?, ?, ?)""",
        (dir_id, body.path, body.label, json.dumps(body.exclude_patterns), int(body.enabled)),
    )
    await db.commit()
    await log_activity(db, "directory", "created", f"Added watched directory '{body.label}'", {"dir_id": dir_id, "path": body.path})
    return {"id": dir_id, "path": body.path}


@router.put("/{dir_id}")
async def update_directory(dir_id: str, body: DirectoryCreate, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM watched_directories WHERE id = ?", (dir_id,))
    if not await cursor.fetchone():
        raise HTTPException(404, "Directory not found")

    body.path = _validate_directory_path(body.path)

    await db.execute(
        """UPDATE watched_directories SET path = ?, label = ?, exclude_patterns = ?, enabled = ?
        WHERE id = ?""",
        (body.path, body.label, json.dumps(body.exclude_patterns), int(body.enabled), dir_id),
    )
    await db.commit()
    return {"status": "updated"}


@router.delete("/{dir_id}")
async def remove_directory(dir_id: str, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM watched_directories WHERE id = ?", (dir_id,))
    if not await cursor.fetchone():
        raise HTTPException(404, "Directory not found")
    await db.execute("DELETE FROM watched_directories WHERE id = ?", (dir_id,))
    await db.commit()
    await log_activity(db, "directory", "deleted", f"Removed directory {dir_id}", {"dir_id": dir_id})
    return {"status": "deleted"}


@router.get("/scan")
async def scan_directories_get(db: aiosqlite.Connection = Depends(get_db)):
    """GET alias for directory scan — same as POST /scan. NO AUTH (setup mode)."""
    return await scan_directories(db)


@router.post("/scan")
async def scan_directories(db: aiosqlite.Connection = Depends(get_db)):
    """Scan common directories and suggest ones to watch.

    Returns ``{directories: [...], platform: "unraid"|"linux"}``.
    """
    from app.core.platform import detect_platform

    directories = []
    common_paths = [
        ("/mnt/user/appdata", "Appdata", "critical", ["*.log", "cache/", "thumbs/"]),
        ("/mnt/user/system/docker", "Docker", "recommended", []),
        ("/mnt/user/domains", "VMs", "optional", []),
        ("/mnt/user/isos", "ISOs", "optional", []),
        ("/mnt/user/media", "Media", "optional", ["*.nfo", "*.srt"]),
    ]
    for path, label, priority, excludes in common_paths:
        if os.path.isdir(path):
            try:
                size = 0
                count = 0
                for dirpath, dirnames, filenames in os.walk(path):
                    count += len(filenames)
                    for f in filenames:
                        try:
                            size += os.path.getsize(os.path.join(dirpath, f))
                        except OSError:
                            pass
                    if count > 10000:
                        break
                directories.append({
                    "path": path,
                    "label": label,
                    "size_bytes": size,
                    "file_count": count,
                    "priority": priority,
                    "recommended_excludes": excludes,
                })
            except PermissionError:
                pass

    platform = detect_platform()
    return {"directories": directories, "platform": platform.value}
