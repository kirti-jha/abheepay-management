const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'abhee_auth';
const AUTH_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function getJwtSecret() {
  return process.env.SESSION_SECRET || 'secret';
}

function createAuthPayload(user) {
  return {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null
  };
}

function signAuthToken(user) {
  return jwt.sign(createAuthPayload(user), getJwtSecret(), {
    expiresIn: '7d'
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: AUTH_MAX_AGE_MS
  };
}

function setAuthCookie(res, user) {
  res.cookie(AUTH_COOKIE_NAME, signAuthToken(user), getCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: undefined
  });
}

module.exports = {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  createAuthPayload,
  getCookieOptions,
  setAuthCookie,
  verifyAuthToken
};
