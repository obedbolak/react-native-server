const DataURIParser = require("datauri/parser.js");
const path = require("path");

const getDataUri = (file) => {
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

module.exports = { getDataUri };