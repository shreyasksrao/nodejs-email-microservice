const uploadFile = require("../middlewares/fileUploader");
const fs = require("fs");
const baseUrl = "http://localhost:5005/files/";

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).json({ 
        statusCode: 400,
        message: "Please upload a file!" 
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  }catch (err) {
    console.log(err);
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).json({
        statusCode: 500,
        message: "File size cannot be larger than 20MB!",
      });
    }
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

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
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