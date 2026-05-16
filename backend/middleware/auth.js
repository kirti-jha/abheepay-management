const { AUTH_COOKIE_NAME, verifyAuthToken } = require('../config/auth');

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = pair.slice(0, separatorIndex);
      const value = pair.slice(separatorIndex + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function authMiddleware(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[AUTH_COOKIE_NAME];

    if (token) {
      req.user = verifyAuthToken(token);
    }
  } catch (error) {
    req.user = null;
  }

  next();
}

module.exports = authMiddleware;
