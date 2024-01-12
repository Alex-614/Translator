CREATE SEQUENCE user_id_seq INCREMENT BY 50;
CREATE SEQUENCE user_session_id_seq INCREMENT BY 50;

CREATE TABLE "user" (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE "user_session" (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_UUID String(36) NOT NULL,
    UNIQUE KEY unique_user_session (user_id, session_id),
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);