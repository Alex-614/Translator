# Verwende das offizielle PostgreSQL-Image als Basis
FROM postgres:latest

# Umgebungsvariablen für die PostgreSQL-Initialisierung
ENV POSTGRES_DB=userdb
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Füge eine SQL-Datei mit den Befehlen für die Datenbank, Tabellen und Spalten hinzu
COPY init.sql /docker-entrypoint-initdb.d/