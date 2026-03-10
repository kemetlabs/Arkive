"""Platform detection — Unraid vs generic Linux."""

import os
from enum import Enum


class Platform(Enum):
    UNRAID = "unraid"
    LINUX = "linux"
    UNKNOWN = "unknown"


def detect_platform() -> Platform:
    if os.path.exists("/etc/unraid-version"):
        return Platform.UNRAID
    if os.path.exists("/etc/os-release"):
        return Platform.LINUX
    return Platform.UNKNOWN


def get_platform_features(platform: Platform) -> dict:
    return {
        Platform.UNRAID: {"flash_backup": True, "share_detection": True, "tmpfs_root": True},
        Platform.LINUX: {"flash_backup": False, "share_detection": False, "tmpfs_root": False},
        Platform.UNKNOWN: {"flash_backup": False, "share_detection": False, "tmpfs_root": False},
    }[platform]
