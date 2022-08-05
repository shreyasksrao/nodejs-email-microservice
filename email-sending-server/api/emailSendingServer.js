const express = require('express');
const cors = require("cors");
const Redis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path');

const initRoutes = require("./routes");
const logger = require('../utils/logger');

dotenv.config({ path: path.join(__dirname, '../config/emailerConfig.env') });

logger.info(`Connecting to REDIS - ${process.env.REDIS_HOST} on Port number ${process.env.REDIS_PORT}...`);
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
});

const EMAIL_STREAM_NAME = process.env.EMAIL_STREAM_NAME;
const EMAIL_STREAM_MAX_LENGTH = process.env.EMAIL_STREAM_MAX_LENGTH;
logger.info(`Email stream name - ${EMAIL_STREAM_NAME}, Max stream length - ${EMAIL_STREAM_MAX_LENGTH}`);

global.__basedir = __dirname;

const app = express();

app.use(express.json());

var corsOptions = {
    origin: "http://localhost:8081"
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

initRoutes(app);

app.post('/api/gmail/email',
  async (req, res) => {
    logger.debug(`Received send email request via GMail transport.`);
    logger.debug(`Email options - ${JSON.stringify(req.body, null, 2)}`);
    const emailOptions = req.body;

    const pipeline = redis.pipeline();
    pipeline.xadd(
        EMAIL_STREAM_NAME, 'MAXLEN', '~', EMAIL_STREAM_MAX_LENGTH, '*', ...Object.entries(emailOptions).flat(),
        (err, result) => {
            if (err) {
                logger.error(`Error while adding Email to stream: \n Details :: ${err}`);
                console.error('‼ Error adding Email to stream:');
                console.error(err);
            } else {
                logger.info(`Email sending request added successfully to stream with key ${result}`);
                console.log(`✉  Email sending request added successfully to stream with key ${result}`);
            }
        },
    );
    pipeline.exec();
    return res.status(202).end();
  },
);

const port = 5005;
app.listen(port, () => {
  logger.info(`🚀🔥 Email sending server listening on port ${port}.`);
  console.log(`🚀🔥 Email sending server listening on port ${port}.`);
});
