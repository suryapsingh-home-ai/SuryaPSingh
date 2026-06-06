const pool = require('../../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql')
const { requireAuth } = require('../errors')

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  )
}

const authResolvers = {
  Query: {
    me: async (_, __, context) => {
      const userId = requireAuth(context)
      const result = await pool.query(
        'SELECT id, username, email, bio FROM users WHERE id = $1',
        [userId]
      )
      if (result.rows.length === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      return result.rows[0]
    },
  },

  Mutation: {
    register: async (_, { username, email, password }) => {
      if (!username || !email || !password) {
        throw new GraphQLError('Missing required fields', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const userExists = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )
      if (userExists.rows.length > 0) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
      )

      const user = result.rows[0]
      return { token: signToken(user), user }
    },

    login: async (_, { email, password }) => {
      if (!email || !password) {
        throw new GraphQLError('Missing email or password', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )
      const user = result.rows[0]

      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      return {
        token: signToken(user),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      }
    },
  },
}

module.exports = authResolvers
