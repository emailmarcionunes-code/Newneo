#!/usr/bin/env python3
"""Local read-only dependency checks; publishes no secrets or customer data."""
import datetime
import json
import os
from pathlib import Path
import shutil
import subprocess


def container_state(name):
    try:
        result = subprocess.run(['docker', 'inspect', '--format', '{{if .State.Running}}{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}{{else}}stopped{{end}}', name], capture_output=True, text=True, timeout=8, check=True)
        return result.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return 'missing'


def main():
    now = datetime.datetime.now(datetime.timezone.utc)
    backup_dir = Path('/home/ubuntu/backups/automatic')
    files = list(backup_dir.glob('*.dump')) if backup_dir.exists() else []
    latest = max((p.stat().st_mtime for p in files if p.stat().st_size > 0), default=None)
    backup_at = datetime.datetime.fromtimestamp(latest, datetime.timezone.utc) if latest is not None else None
    age = (now - backup_at).total_seconds() if backup_at else None
    backup = 'missing' if age is None else 'fresh' if 0 <= age <= 30 * 3600 else 'stale'
    try:
        result = subprocess.run(['systemctl', 'show', 'newneo-backup.service', '--property=Result', '--value'], capture_output=True, text=True, timeout=5, check=True).stdout.strip()
        if result != 'success':
            backup = 'failed' if result else 'unknown'
    except (OSError, subprocess.SubprocessError):
        backup = 'unknown'
    app, database, proxy = [container_state('platform-' + service + '-1') for service in ['app', 'database', 'proxy']]
    valid = {'healthy', 'unhealthy', 'starting'}
    status = {'checkedAt': now.isoformat(), 'app': app if app in valid else 'missing', 'database': database if database in valid else 'missing', 'proxy': 'running' if proxy in {'running', 'healthy'} else 'not-running', 'backup': backup, 'backupAt': backup_at.isoformat() if backup_at else None, 'freeDiskBytes': shutil.disk_usage('/home/ubuntu').free}
    target = Path('/home/ubuntu/operations')
    target.mkdir(mode=0o755, exist_ok=True)
    temporary = target / 'status.json.partial'
    temporary.write_text(json.dumps(status))
    temporary.chmod(0o644)
    os.replace(temporary, target / 'status.json')
    ok = status['app'] == status['database'] == 'healthy' and status['proxy'] == 'running' and backup == 'fresh' and status['freeDiskBytes'] >= 4 * 1024**3
    print('Platform checks: ' + ('healthy' if ok else 'attention required'))


if __name__ == '__main__':
    main()
