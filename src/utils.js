const jwt = require('jsonwebtoken');

// use this function to pull the userId off of a request to then check if they are authenticated
function getUserId(req) {
  if (req.headers) {
    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1];

    try {
      if (token) {
        const { userId } = jwt.verify(token, process.env.APP_SECRET);
        return userId;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  return null
}

function rad2Deg(radians) {
  return radians * 57.2958
}

function deg2Rad(degrees) {
  return degrees / 57.2958
}

const CHAT_CHANNEL = 'CHAT_CHANNEL'

module.exports = {
  getUserId,
  rad2Deg,
  deg2Rad,
  CHAT_CHANNEL,
};
