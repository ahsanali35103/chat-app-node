const { downloadFileFromGridFS } = require('../../config/GridFs');

const streamFile = (req, res, next) => {
  const message = req.message;

  if (!message) return next();
  if (message.type !== "file") return next();

  const downloadStream = downloadFileFromGridFS(message.file.fileId);
  res.set("Content-Type", message.file.mimetype);
  res.set(
    "Content-Disposition",
    `attachment; filename="${message.file.filename}"`,
  );

  downloadStream.pipe(res);
};

module.exports = streamFile;
