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

module.exports = {
  getUserId,
};
