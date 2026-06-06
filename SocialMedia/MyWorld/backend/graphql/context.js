const jwt = require('jsonwebtoken')

function decodeToken(token) {
  if (!token) {
    return { userId: null, user: null }
  }

  const normalized = token.startsWith('Bearer ') ? token.slice(7) : token

  try {
    const decoded = jwt.verify(
      normalized,
      process.env.JWT_SECRET || 'your-secret-key'
    )
    return { userId: decoded.id, user: decoded }
  } catch {
    return { userId: null, user: null }
  }
}

function createContext({ req }) {
  const token = req?.headers?.authorization?.split(' ')[1]
  return decodeToken(token)
}

function createContextFromConnectionParams(connectionParams = {}) {
  return decodeToken(connectionParams.authorization)
}

module.exports = { createContext, createContextFromConnectionParams }
