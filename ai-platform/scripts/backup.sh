#!/bin/sh
# Run from ai-platform on the pilot host. Creates a private local dump only.
# Schedule externally and copy encrypted backups to separate storage.
set -eu
umask 077
backup_dir=${NEWNEO_BACKUP_DIR:-./backups}
mkdir -p "$backup_dir"
backup_file="$backup_dir/newneo-$(date -u +%Y%m%dT%H%M%SZ).dump"
trap 'rm -f "$backup_file.partial"' EXIT HUP INT TERM
docker compose -f compose.production.yml exec -T database pg_dump -U newneo_owner -d newneo -Fc > "$backup_file.partial"
test -s "$backup_file.partial"
mv "$backup_file.partial" "$backup_file"
printf 'Backup created: %s\n' "$backup_file"
