#!/bin/bash
cp /tmp/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
cp /tmp/postgresql.conf /var/lib/postgresql/data/postgresql.conf

# Run pg_basebackup after the PostgreSQL server is ready
pg_basebackup -h text-db-leader -p 6543 -D /var/lib/postgresql/16/main -R

service postgresql restart