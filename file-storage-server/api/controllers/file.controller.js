const uploadFile = require("../middlewares/fileUploader");
const fs = require("fs");
const dotenv = require('dotenv');
const path = require('path');

const logger = require('../../utils/logger');
dotenv.config({ path: path.join(__dirname, '../config/fileStorageServer.env') });

const baseUrl = `http://${process.env.FILE_SERVER_HOSTNAME}:${process.env.FILE_SERVER_PORT}/files/`;

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      logger.info(`File not present in the request !`);
      return res.status(400).json({ 
        statusCode: 400,
        message: "Please upload a file!" 
      });
    }

    logger.info(`Successfully uploaded file : ${req.file.originalname}`);
    res.status(200).json({
      statusCode: 200,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  }
  catch (err) {
    console.log(err);
    if (err.code == "LIMIT_FILE_SIZE") {
      logger.error(`Error: File limit exceeded ! File size should not be more than 20 MB. File name: ${req.file.originalname}`);
      return res.status(500).json({
        statusCode: 500,
        message: "File size cannot be larger than 20MB!",
      });
    }
    logger.error(`Could not upload the file: ${req.file.originalname}.\nError: ${err}`);
    res.status(500).json({
      statusCode: 500,
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};


const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      logger.error(`Unable to scan files. \nError: ${err}`);
      res.status(500).json({
        statusCode: 500,
        message: "Unable to scan files!",
        error: err
      });
    }

    let fileInfos = [];
    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).json({
        statusCode: 200,
        fileInfo: fileInfos
    });
  });
};


const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";
  logger.info(`Downloading file ${fileName} - File path: ${directoryPath}`);

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      logger.error(`Error downloading file - ${fileName}\nError: ${err}`);
      res.status(500).json({
        statusCode: 500,
        message: "Could not download the file.",
        error: err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).json({
        statusCode: 500,
        message: "Could not delete the file. ",
        error: err,
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: `File "${req.params.name}" is deleted.`,
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);
    res.status(200).json({
      statusCode: 200,
      message: `File "${req.params.name}" is deleted.`,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Could not delete the file. ",
      error: err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
  remove,
  removeSync,
};