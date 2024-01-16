CREATE SEQUENCE user_id_seq INCREMENT BY 50;
CREATE SEQUENCE user_session_id_seq INCREMENT BY 50;

CREATE TABLE "user" (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE "user_session" (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_UUID VARCHAR(36) NOT NULL,
    session_language VARCHAR(5) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);