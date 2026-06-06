const pool = require('../../db')
const { GraphQLError } = require('graphql')
const { requireAuth } = require('../errors')

const connectionsResolvers = {
  Query: {
    searchUsers: async (_, { query }, context) => {
      requireAuth(context)

      if (!query) {
        throw new GraphQLError('Search query is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const result = await pool.query(
        'SELECT id, username, bio FROM users WHERE username ILIKE $1 LIMIT 20',
        [`%${query}%`]
      )

      return result.rows
    },

    pendingConnectionRequests: async (_, __, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        `SELECT f.id, f.requested_by as sender_id, u.username, u.bio
         FROM friendships f
         JOIN users u ON u.id = f.requested_by
         WHERE f.status = 'pending'
           AND f.requested_by != $1
           AND (f.user_id_1 = $1 OR f.user_id_2 = $1)`,
        [userId]
      )

      return result.rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        username: row.username,
        bio: row.bio,
      }))
    },

    connections: async (_, __, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        `SELECT
          CASE
            WHEN f.user_id_1 = $1 THEN f.user_id_2
            ELSE f.user_id_1
          END as friend_id,
          u.username, u.bio
         FROM friendships f
         JOIN users u ON u.id = (CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END)
         WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1) AND f.status = 'accepted'`,
        [userId]
      )

      return result.rows.map((row) => ({
        friendId: row.friend_id,
        username: row.username,
        bio: row.bio,
      }))
    },
  },

  Mutation: {
    sendConnectionRequest: async (_, { recipientId }, context) => {
      const userId = requireAuth(context)

      if (userId === parseInt(recipientId, 10)) {
        throw new GraphQLError('Cannot send request to yourself', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const userExists = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [recipientId]
      )
      if (userExists.rows.length === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const normalizedIds = [userId, parseInt(recipientId, 10)].sort(
        (a, b) => a - b
      )
      const existing = await pool.query(
        'SELECT id, status FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2',
        normalizedIds
      )

      if (existing.rows.length > 0) {
        throw new GraphQLError(
          `Connection already exists with status: ${existing.rows[0].status}`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      }

      await pool.query(
        'INSERT INTO friendships (user_id_1, user_id_2, requested_by, status) VALUES ($1, $2, $3, $4)',
        [...normalizedIds, userId, 'pending']
      )

      return 'Connection request sent'
    },

    acceptConnectionRequest: async (_, { connectionId }, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        `UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'pending' AND requested_by != $3
           AND (user_id_1 = $3 OR user_id_2 = $3) RETURNING *`,
        ['accepted', connectionId, userId]
      )

      if (result.rows.length === 0) {
        throw new GraphQLError('Connection request not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      return 'Connection request accepted'
    },

    rejectConnectionRequest: async (_, { connectionId }, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        `DELETE FROM friendships
         WHERE id = $1 AND status = 'pending' AND requested_by != $2
           AND (user_id_1 = $2 OR user_id_2 = $2) RETURNING *`,
        [connectionId, userId]
      )

      if (result.rows.length === 0) {
        throw new GraphQLError('Connection request not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      return 'Connection request rejected'
    },
  },
}

module.exports = connectionsResolvers
