const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

const getBucket = () => {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "messageFiles",
    });
  }
  return bucket;
};

const uploadFileToGridFS = (fileBuffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
    });

    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id,
        filename,
        mimetype,
        size: fileBuffer.length,
      });
    });

    uploadStream.on("error", reject);
    uploadStream.end(fileBuffer);
  });
};

const updateFileInGridFS = async (
  oldFileId,
  fileBuffer,
  filename,
  mimetype,
) => {
  await deleteFileFromGridFS(oldFileId);
  return uploadFileToGridFS(fileBuffer, filename, mimetype);
};

const downloadFileFromGridFS = (fileId) => {
  const bucket = getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

const deleteFileFromGridFS = (fileId) => {
  const bucket = getBucket();
  return bucket.delete(new mongoose.Types.ObjectId(fileId));
};

module.exports = {
  uploadFileToGridFS,
  updateFileInGridFS,
  downloadFileFromGridFS,
  deleteFileFromGridFS,
};
