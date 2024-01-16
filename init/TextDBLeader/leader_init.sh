#!/bin/bash
# Add custom entries to pg_hba.conf
echo "host    all             all             0.0.0.0/0               md5" >> "$PGDATA/pg_hba.conf"
echo "host    replication     all             0.0.0.0/0               trust" >> "$PGDATA/pg_hba.conf"

# Reload pg_hba.conf without restarting PostgreSQL
pg_ctl reload -D "$PGDATA"

echo "Custom entries added to pg_hba.conf successfully."