FROM node:16.5.0-alpine

RUN addgroup -S fileStorageUserGroup && adduser -S fileStorageUser -G fileStorageUserGroup
# Create app directory and give the permission to that directory for app user
RUN mkdir -p /home/fileStorageServer/app && chown -R fileStorageUser:fileStorageUserGroup /home/fileStorageServer/app
# Create directory for Uploaded files
RUN mkdir /home/fileStorageServer/app/uploads && chown -R fileStorageUser:fileStorageUserGroup /home/fileStorageServer/app/uploads

WORKDIR /home/fileStorageServer/app

USER fileStorageUser

COPY . .

ENV  NODE_ENV production

# Server details
ENV FILE_STORAGE_SERVER_PORT 5006
ENV FILE_STORAGE_SERVER_ENV "development"

# Server logging level
ENV LOG_LEVEL "debug"

RUN npm install --production

EXPOSE ${FILE_STORAGE_SERVER_PORT}

CMD ["node", "api/fileStorageServer"]