const express = require('express');
const cors = require("cors");
const Redis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path');

const initRoutes = require("./routes");

dotenv.config({ path: path.join(__dirname, '../config/emailerConfig.env') });

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
});

global.__basedir = __dirname;

var corsOptions = {
    origin: "http://localhost:8081"
};
const getKeyName = (...args) => `emailer:${args.join(':')}`;

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

initRoutes(app);

const emailStreamKey = getKeyName('emailStream');
const maxStreamLength = 100;

app.post('/api/gmail/email',
  async (req, res) => {
    const emailOptions = req.body;
    const pipeline = redis.pipeline();
    pipeline.xadd(
        emailStreamKey, 'MAXLEN', '~', maxStreamLength, '*', ...Object.entries(emailOptions).flat(),
        (err, result) => {
            if (err) {
            console.error('Error adding Email to stream:');
            console.error(err);
            } else {
            console.log(`Received checkin, added to stream as ${result}`);
            }
        },
    );
    pipeline.exec();
    return res.status(202).end();
  },
);

const port = 5005;
app.listen(port, () => {
  console.log(`🚀🔥 Email receiver listening on port ${port}.`);
});
