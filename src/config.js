require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://mongo:27017/mrms',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
  FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || 'uploads',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@mrms.com'
};
