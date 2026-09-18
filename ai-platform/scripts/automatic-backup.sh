#!/bin/bash
# Daily private local backup. Off-host recovery remains a separate requirement.
set -euo pipefail
umask 077
cd /home/ubuntu/platform
exec 9>/run/newneo-backup.lock
flock -n 9 || exit 0
backup_dir=/home/ubuntu/backups/automatic
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
free_kb=$(df -Pk "$backup_dir" | awk 'NR==2 {print $4}')
if [ "$free_kb" -lt 4194304 ]; then
  echo 'Backup stopped: less than 4 GiB available.' >&2
  exit 1
fi
backup_file="$backup_dir/newneo-auto-$(date -u +%Y%m%dT%H%M%SZ).dump"
trap 'rm -f "$backup_file.partial"' EXIT
docker compose -f compose.production.yml exec -T database pg_dump -U newneo_owner -d newneo -Fc > "$backup_file.partial"
test -s "$backup_file.partial"
docker compose -f compose.production.yml exec -T database pg_restore --list < "$backup_file.partial" > /dev/null
mv "$backup_file.partial" "$backup_file"
# Retain all archives for now. Monitor disk; no automatic deletion of backups.
printf 'Validated local backup created: %s\n' "$backup_file"
