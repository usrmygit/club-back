const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWTOKEN, { expiresIn: "1d" });
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};

const getPublicIP = () => {
  return axios.get(process.env.IP_URL).then((res) => res.data.ip);
};

const getRealIP = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  return forwardedFor
    ? forwardedFor.split(",")[0]
    : req.connection.remoteAddress;
};

module.exports = {
  generateToken,
  hashToken,
  getPublicIP,
  getRealIP,
};
