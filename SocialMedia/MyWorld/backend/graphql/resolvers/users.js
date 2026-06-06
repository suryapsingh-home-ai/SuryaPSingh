const pool = require('../../db')
const { GraphQLError } = require('graphql')
const { requireAuth } = require('../errors')
const { mapPostRow } = require('../postHelpers')

const usersResolvers = {
  Query: {
    user: async (_, { id }, context) => {
      requireAuth(context)

      const userResult = await pool.query(
        'SELECT id, username, email, bio FROM users WHERE id = $1',
        [id]
      )

      if (userResult.rows.length === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const user = userResult.rows[0]

      const friendResult = await pool.query(
        'SELECT COUNT(*) as count FROM friendships WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = $2',
        [id, 'accepted']
      )

      user.friendCount = parseInt(friendResult.rows[0].count, 10)
      return user
    },

    userPosts: async (_, { userId }, context) => {
      const currentUserId = requireAuth(context)

      const result = await pool.query(
        `SELECT p.*, u.id as author_id, u.username,
                COUNT(DISTINCT l.id) as likes,
                COUNT(DISTINCT c.id) as comment_count,
                EXISTS(
                  SELECT 1 FROM likes ul
                  WHERE ul.post_id = p.id AND ul.user_id = $2
                ) as liked_by_me
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN likes l ON p.id = l.post_id
         LEFT JOIN comments c ON p.id = c.post_id
         WHERE p.user_id = $1
         GROUP BY p.id, u.id
         ORDER BY p.created_at DESC`,
        [userId, currentUserId]
      )

      return result.rows.map(mapPostRow)
    },
  },

  Mutation: {
    updateBio: async (_, { bio }, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        'UPDATE users SET bio = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, bio',
        [bio || null, userId]
      )

      if (result.rows.length === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const user = result.rows[0]

      const friendResult = await pool.query(
        'SELECT COUNT(*) as count FROM friendships WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = $2',
        [userId, 'accepted']
      )

      user.friendCount = parseInt(friendResult.rows[0].count, 10)
      return user
    },
  },
}

module.exports = usersResolvers
