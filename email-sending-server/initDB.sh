#!/bin/bash
set -e

email_db="$EMAIL_DB";
email_db_user="$EMAIL_DB_USER";
email_db_user_password="$EMAIL_DB_USER_PASSWORD";
email_schema="$EMAIL_SCHEMA";

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $email_db_user WITH PASSWORD '$email_db_user_password';
    CREATE DATABASE $email_db;
    GRANT ALL PRIVILEGES ON DATABASE $email_db TO $email_db_user;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$email_db_user" --dbname "$email_db" <<-EOSQL
    CREATE SCHEMA $email_schema;
EOSQL