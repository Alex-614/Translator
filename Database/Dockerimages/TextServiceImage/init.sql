CREATE TABLE "text" (
    session_id BIGINT,
    timestamp TIMESTAMP,
    text_line VARCHAR(255) NOT NULL,
    PRIMARY KEY (session_id, timestamp)
);