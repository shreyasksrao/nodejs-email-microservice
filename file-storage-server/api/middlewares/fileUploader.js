const util = require("util");
const path = require('path');
const multer = require("multer");
const logger = require('../../utils/logger');

const maxSize = 20 * 1024 * 1024;

global.__basedir = __dirname;
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__basedir, '../..', '/uploads'));
  },
  filename: (req, file, cb) => {
    console.log(`Received File : ${file.originalname}`);
    logger.info(`Received a file to upload : ${file.originalname}`);
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).array("files");

let uploadMultipleFileMiddleware = util.promisify(uploadFile);

let uploadSingleFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single('file');

let uploadSingleFileMiddleware = util.promisify(uploadSingleFile);

module.exports = {
  uploadMultipleFileMiddleware,
  uploadSingleFileMiddleware
};
