# Container Profiles

Container profiles define how Arkive discovers and handles databases inside Docker containers.
Each profile is a JSON file that maps a container image pattern to its database type, dump strategy, and restore commands.

## Profile Format

```json
{
  "image_patterns": ["postgres:*", "*/postgres:*"],
  "db_type": "postgres",
  "detection": {
    "env_vars": ["POSTGRES_DB", "POSTGRES_USER"],
    "ports": [5432],
    "files": ["/var/lib/postgresql/data/PG_VERSION"]
  },
  "dump": {
    "command": "pg_dumpall -U ${POSTGRES_USER:-postgres}",
    "format": "sql",
    "extension": ".sql.gz",
    "compress": true
  },
  "restore": {
    "command": "psql -U ${POSTGRES_USER:-postgres}",
    "notes": "Restore with: gunzip -c dump.sql.gz | psql -U postgres"
  },
  "priority": 1
}
```
