CREATE TABLE "text" (
    session_id VARCHAR(36),
    timestamp TIMESTAMP,
    text_line VARCHAR(65535) NOT NULL,
    PRIMARY KEY (session_id, timestamp)
);