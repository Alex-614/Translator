FROM postgres:latest

ENV POSTGRES_DB=textdb_leader
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV PGPORT=6543

COPY init.sql /docker-entrypoint-initdb.d/init.sql
COPY leader_init.sh /docker-entrypoint-initdb.d/leader_init.sh