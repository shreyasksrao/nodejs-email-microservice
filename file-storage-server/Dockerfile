FROM node:16.5.0-alpine

RUN groupadd -r fileStorageUser && useradd -m -r -g -s /bin/bash fileStorageUser fileStorageUser
USER fileStorageUser

WORKDIR /home/fileStorageServer/app

COPY . .

ENV  NODE_ENV production

# Server details
ENV FILE_STORAGE_SERVER_PORT 5006
ENV FILE_STORAGE_SERVER_ENV "development"

# Server logging level
ENV LOG_LEVEL "debug"

RUN npm install --production

EXPOSE ${FILE_STORAGE_SERVER_PORT}

CMD [“node”, api/fileStorageServer”]