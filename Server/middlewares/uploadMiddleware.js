const multer = require('multer');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const connectionString = process.env.Storage_Connection_String;
let blobServiceClient;
if (connectionString) {
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
}

function AzureStorage(opts) {
  this.containerName = opts.containerName || 'products';
}

AzureStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  if (!blobServiceClient) {
    return cb(new Error('Azure Storage Connection String not configured'));
  }

  const containerClient = blobServiceClient.getContainerClient(this.containerName);
  
  // ensure container exists
  containerClient.createIfNotExists({ access: 'blob' }).then(() => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Organize by images/ or videos/
    let folder = 'images';
    if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    }
    const blobName = `${folder}/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const stream = file.stream;
    const uploadOptions = {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    };
    
    const bufferSize = 4 * 1024 * 1024;
    const maxBuffers = 20;
    
    blockBlobClient.uploadStream(stream, bufferSize, maxBuffers, uploadOptions)
      .then(() => {
          cb(null, {
              url: blockBlobClient.url,
              filename: blobName
          });
      })
      .catch(cb);
  }).catch(cb);
}

AzureStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  if (!blobServiceClient) return cb(null);
  const containerClient = blobServiceClient.getContainerClient(this.containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(file.filename);
  blockBlobClient.deleteIfExists().then(() => cb(null)).catch(cb);
}

const storage = new AzureStorage({ containerName: 'products' });

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|mp4|mov|mpeg|quicktime/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|webp)|video\/(mp4|quicktime|mpeg)/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images and MP4/MOV videos only!'));
  }
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
