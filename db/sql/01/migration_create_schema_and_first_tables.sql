CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA};

CREATE TYPE log_type AS ENUM ('error', 'read', 'create', 'update', 'delete');

CREATE TABLE IF NOT EXISTS ${DB_SCHEMA}.logs (
    id varchar(50) NOT NULL,
    createdAt timestamp NOT NULL,
    logType log_type NOT NULL,
    userId varchar(50) DEFAULT NULL,
    entity varchar(255) DEFAULT NULL,
    operation VARCHAR(50) DEFAULT NULL,
    beforeData jsonb DEFAULT NULL,
    afterData jsonb DEFAULT NULL, 
    errorMessage text DEFAULT NULL,
    errorStack text DEFAULT NULL,
    userInfo jsonb DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES users(id)
);