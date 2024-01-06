FROM postgres:latest

ENV POSTGRES_DB=textdb_follower
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV PGPORT=6544

COPY follower_init.sh /docker-entrypoint-initdb.d/follower_init.sh
RUN chmod +x /docker-entrypoint-initdb.d/follower_init.sh

COPY pg_hba.conf /tmp/pg_hba.conf
COPY postgresql.conf /tmp/postgresql.conf
