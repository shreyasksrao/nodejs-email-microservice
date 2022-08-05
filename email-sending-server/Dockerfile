FROM node:16.5.0-alpine

RUN groupadd -r emailuser && useradd -m -r -g -s /bin/bash emailuser emailuser
USER emailuser

WORKDIR /home/emailer/app

COPY initDB.sh /docker-entrypoint-initdb.d/
COPY . .

ENV  NODE_ENV production

# Server details
ENV EMAIL_SERVER_PORT 5005
ENV EMAIL_SERVER_ENV "development"

# PostgreSQL server details
ENV DB_HOST ""
ENV DB_PORT 5432
ENV DB_NAME "emailer_db"
ENV DB_USER "dbadmin"
ENV DB_PASSWORD ""

# Redis server details
ENV REDIS_HOST ""
ENV REDIS_PORT 6379
ENV REDIS_PASS ""

# Server logging level
ENV LOG_LEVEL "debug"

RUN npm install --production

EXPOSE ${EMAIL_SERVER_PORT}

CMD [“node”, api/emailSendingServer”]