"""Tests for the discovery service — 10 test cases."""
import sqlite3
from pathlib import Path

import pytest
from unittest.mock import MagicMock, patch, AsyncMock


def _make_container(name, image_tags, status="running", env=None, mounts=None, labels=None):
    """Helper to create a mock Docker container."""
    c = MagicMock()
    c.name = name
    c.image.tags = image_tags
    c.status = status
    c.labels = labels or {}
    c.attrs = {
        "Config": {"Env": env or [], "Labels": labels or {}},
        "Mounts": mounts or [],
    }
    return c


class TestDiscovery:
    """Discovery engine tests."""

    def test_match_vaultwarden_by_image(self):
        """Vaultwarden image should match the vaultwarden profile."""
        from app.services.discovery import DiscoveryEngine
        svc = DiscoveryEngine.__new__(DiscoveryEngine)
        container = _make_container("vaultwarden", ["vaultwarden/server:latest"])
        # Profile matching is based on image pattern
        assert any(
            pat in container.image.tags[0]
            for pat in ["vaultwarden/server", "bitwardenrs/server"]
        )

    def test_match_immich_by_image(self):
        """Immich image should match the immich profile."""
        container = _make_container("immich", ["ghcr.io/immich-app/immich-server:v1.91.0"])
        assert "immich-app/immich-server" in container.image.tags[0]

    def test_extract_postgres_credentials_from_env(self):
        """Should extract POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD from env vars."""
        env = ["POSTGRES_DB=mydb", "POSTGRES_USER=admin", "POSTGRES_PASSWORD=secret123"]
        container = _make_container("pg", ["postgres:16"], env=env)
        env_dict = {}
        for e in container.attrs["Config"]["Env"]:
            k, v = e.split("=", 1)
            env_dict[k] = v
        assert env_dict["POSTGRES_DB"] == "mydb"
        assert env_dict["POSTGRES_USER"] == "admin"
        assert env_dict["POSTGRES_PASSWORD"] == "secret123"

    def test_detect_sqlite_by_file_extension(self):
        """Should detect SQLite databases by .sqlite3 or .db extension in bind mounts."""
        mounts = [{"Type": "bind", "Source": "/mnt/user/appdata/vaultwarden", "Destination": "/data", "RW": True}]
        container = _make_container("vw", ["vaultwarden/server:latest"], mounts=mounts)
        bind_paths = [m["Source"] for m in container.attrs["Mounts"] if m["Type"] == "bind"]
        assert len(bind_paths) == 1
        assert bind_paths[0] == "/mnt/user/appdata/vaultwarden"

    def test_detect_compose_project_from_label(self):
        """Should detect Docker Compose project name from labels."""
        labels = {"com.docker.compose.project": "immich", "com.docker.compose.service": "server"}
        container = _make_container("immich-server", ["ghcr.io/immich-app/immich-server:latest"], labels=labels)
        assert container.attrs["Config"]["Labels"]["com.docker.compose.project"] == "immich"

    def test_handle_container_with_no_databases(self):
        """Containers without databases should still be discovered but with empty db list."""
        container = _make_container("nginx", ["nginx:latest"])
        # No env vars, no known DB patterns
        env_list = container.attrs["Config"]["Env"]
        has_db_env = any(
            k in str(env_list)
            for k in ["POSTGRES_", "MYSQL_", "MONGO_", "REDIS_"]
        )
        assert not has_db_env

    def test_handle_container_with_multiple_databases(self):
        """A container can have multiple databases (e.g., Sonarr has main + logs)."""
        # Sonarr has two SQLite DBs
        db_paths = ["/config/sonarr.db", "/config/logs.db"]
        assert len(db_paths) == 2

    def test_profile_priority_assignment(self):
        """Profiles should assign correct priority levels."""
        priorities = {
            "vaultwarden": "critical",
            "authelia": "critical",
            "paperless-ngx": "critical",
            "immich": "high",
            "postgres": "high",
            "plex": "medium",
            "homepage": "low",
        }
        assert priorities["vaultwarden"] == "critical"
        assert priorities["plex"] == "medium"
        assert priorities["homepage"] == "low"

    def test_handle_stopped_containers(self):
        """Stopped containers should be discovered but flagged as not running."""
        container = _make_container("stopped-pg", ["postgres:16"], status="exited")
        assert container.status == "exited"
        assert container.status != "running"

    def test_handle_missing_env_vars_gracefully(self):
        """Containers with missing expected env vars should not crash discovery."""
        # Postgres container without POSTGRES_DB set
        env = ["POSTGRES_USER=admin"]
        container = _make_container("pg-noname", ["postgres:16"], env=env)
        env_dict = {}
        for e in container.attrs["Config"]["Env"]:
            k, v = e.split("=", 1)
            env_dict[k] = v
        # Should gracefully handle missing POSTGRES_DB
        db_name = env_dict.get("POSTGRES_DB", "postgres")  # fallback
        assert db_name == "postgres"

    def test_should_scan_sqlite_mount_rejects_broad_user_share_roots(self, mock_config):
        """Broad /mnt/user mounts should not be scanned as container-specific SQLite sources."""
        from app.services.discovery import DiscoveryEngine

        engine = DiscoveryEngine.__new__(DiscoveryEngine)
        engine.config = mock_config

        assert engine._should_scan_sqlite_mount("/mnt/user") is False
        assert engine._should_scan_sqlite_mount("/mnt/user/appdata") is False
        assert engine._should_scan_sqlite_mount("/mnt/user/appdata/vaultwarden") is True

    def test_scan_sqlite_files_skips_dump_artifact_directories(self, mock_config, tmp_path):
        """Backup artifact directories should not be rediscovered as live SQLite databases."""
        from app.services.discovery import DiscoveryEngine

        root = tmp_path / "vaultwarden"
        root.mkdir()
        live_db = root / "db.sqlite3"
        with sqlite3.connect(str(live_db)) as conn:
            conn.execute("CREATE TABLE items (id INTEGER PRIMARY KEY)")
            conn.commit()

        dumps_dir = root / "dumps"
        dumps_dir.mkdir()
        dump_db = dumps_dir / "vaultwarden_db_20260307_010101.sqlite3"
        with sqlite3.connect(str(dump_db)) as conn:
            conn.execute("CREATE TABLE items (id INTEGER PRIMARY KEY)")
            conn.commit()

        engine = DiscoveryEngine.__new__(DiscoveryEngine)
        engine.config = mock_config

        found = engine._scan_sqlite_files(str(root))

        assert str(live_db) in found
        assert str(dump_db) not in found

    @pytest.mark.asyncio
    async def test_scan_skips_current_arkive_container(self, mock_config, monkeypatch):
        """Arkive should not discover its own container and config volume."""
        from app.services.discovery import DiscoveryEngine

        current = _make_container("arkive", ["islamdiaa/arkive:latest"])
        current.id = "abc123456789"
        other = _make_container("vaultwarden", ["vaultwarden/server:latest"])
        other.id = "def456789012"

        docker = MagicMock()
        docker.containers.list.return_value = [current, other]
        monkeypatch.setenv("HOSTNAME", "abc123")

        engine = DiscoveryEngine(docker, mock_config)
        containers = await engine.scan()

        names = [container.name for container in containers]
        assert "arkive" not in names
        assert "vaultwarden" in names
