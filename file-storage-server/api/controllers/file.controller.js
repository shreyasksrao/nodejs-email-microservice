const { uploadMultipleFileMiddleware, uploadSingleFileMiddleware } = require("../middlewares/fileUploader");
const fs = require("fs");
const dotenv = require('dotenv');
const path = require('path');

const logger = require('../../utils/logger');
dotenv.config({ path: path.join(__dirname, '../config/fileStorageServer.env') });

const baseUrl = `http://${process.env.FILE_SERVER_HOSTNAME}:${process.env.FILE_SERVER_PORT}/files/`;
const directoryPath = path.join(__dirname, '../../uploads/');

const upload = async (req, res) => {
  try {
    await uploadSingleFileMiddleware(req, res);

    if (req.file == undefined) {
      logger.info(`File not present in the request !`);
      return res.status(400).json({ 
        statusCode: 400,
        message: "Please upload a file with field-name 'file'!" 
      });
    }

    logger.info(`Successfully uploaded file : ${JSON.stringify(req.file)}`);
    res.status(200).json({
      statusCode: 200,
      message: "Uploaded the file successfully: " + JSON.stringify(req.file),
    });
  }
  catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      logger.error(`Error: File limit exceeded ! File size should not be more than 20 MB. File name: ${JSON.stringify(req.file)}`);
      return res.status(500).json({
        statusCode: 500,
        message: "File size cannot be larger than 20MB!",
      });
    }

    if (err.code == "LIMIT_UNEXPECTED_FILE") {
      logger.error(`Error: Multiple files are passed. /upload accepts only one file. To upload multiple files use '/uploadMultipleFiles' endpoint`);
      return res.status(500).json({
        statusCode: 500,
        message: "Multiple files are passed. /upload accepts only one file. To upload multiple files use '/uploadMultipleFiles' endpoint",
        devMessage: JSON.stringify(err),
      });
    }

    logger.error(`Could not upload the file: ${JSON.stringify(req.file)}.\nError: ${err}`);
    res.status(500).json({
      statusCode: 500,
      message: `Could not upload the file: ${JSON.stringify(req.file)}`,
      devMessage: `Error: ${err}`
    });
  }
};

const uploadMultipleFiles = async (req, res) => {
  try {
    await uploadMultipleFileMiddleware(req, res);

    if (req.files == undefined) {
      logger.info(`File not present in the request !`);
      return res.status(400).json({ 
        statusCode: 400,
        message: "Please upload a file! File should be uploaded as form-data with 'file' key" 
      });
    }

    logger.info(`Successfully uploaded file : ${JSON.stringify(req.files)}`);
    res.status(200).json({
      statusCode: 200,
      message: "Uploaded the file successfully: " + JSON.stringify(req.files),
    });
  }
  catch (err) {
    console.log(err);
    if (err.code == "LIMIT_FILE_SIZE") {
      logger.error(`Error: File limit exceeded ! File size should not be more than 20 MB. File name: ${JSON.stringify(req.files)}`);
      return res.status(500).json({
        statusCode: 500,
        message: "File size cannot be more than 20MB!",
      });
    }
    logger.error(`Could not upload the file: ${JSON.stringify(req.files)}.\nError: ${err}`);
    res.status(500).json({
      statusCode: 500,
      message: `Could not upload the file: ${JSON.stringify(req.files)}. ${err}`,
    });
  }
};


const getListFiles = (req, res) => {
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
  uploadMultipleFiles,
  getListFiles,
  download,
  remove,
  removeSync,
};