const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');

const initRoutes = require("./routes");
const logger = require('../utils/logger');

dotenv.config({ path: path.join(__dirname, '../config/fileStorageServer.env') });

global.__basedir = __dirname;

logger.info(`Starting Express server...`);
const app = express();
app.use(express.json());

var whitelist = process.env.CORS_ALLOW_HOSTS.split(',');
logger.info(`Allowed host by CORS policy: ${JSON.stringify(whitelist)}`);

var corsOption = {
  origin: whitelist,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

app.use(express.urlencoded({ extended: true }));

initRoutes(app);

const port = 5006;
app.listen(port, () => {
  logger.info(`🚀🔥 File storage server listening on port ${port}.`);
  console.log(`🚀🔥 File storage server listening on port ${port}.`);
});
