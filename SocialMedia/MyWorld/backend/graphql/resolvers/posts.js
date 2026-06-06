const pool = require('../../db')
const { GraphQLError } = require('graphql')
const { requireAuth } = require('../errors')
const { pubsub, POST_CREATED, POST_LIKED, COMMENT_ADDED } = require('../pubsub')
const {
  mapPostRow,
  buildPostPayload,
  getPostLikeCount,
  getPostCommentCount,
  isPostLikedByUser,
} = require('../postHelpers')

const postsResolvers = {
  Query: {
    posts: async (_, __, context) => {
      const userId = requireAuth(context)
      const result = await pool.query(
        `
        SELECT p.*, u.id as author_id, u.username,
               COUNT(DISTINCT l.id) as likes,
               COUNT(DISTINCT c.id) as comment_count,
               EXISTS(
                 SELECT 1 FROM likes ul
                 WHERE ul.post_id = p.id AND ul.user_id = $1
               ) as liked_by_me
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        GROUP BY p.id, u.id
        ORDER BY p.created_at DESC
      `,
        [userId]
      )

      return result.rows.map(mapPostRow)
    },

    postComments: async (_, { postId }, context) => {
      requireAuth(context)

      const result = await pool.query(
        `SELECT c.*, u.id as author_id, u.username
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
        [postId]
      )

      return result.rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.created_at,
        author: { id: row.author_id, username: row.username },
      }))
    },
  },

  Mutation: {
    createPost: async (_, { content }, context) => {
      const userId = requireAuth(context)

      if (!content) {
        throw new GraphQLError('Content is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const result = await pool.query(
        'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
        [userId, content]
      )

      const postPayload = await buildPostPayload(result.rows[0], userId)
      pubsub.publish(POST_CREATED, { postCreated: postPayload })
      return postPayload
    },

    deletePost: async (_, { postId }, context) => {
      const userId = requireAuth(context)

      const postResult = await pool.query(
        'SELECT * FROM posts WHERE id = $1',
        [postId]
      )
      const post = postResult.rows[0]

      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      if (Number(post.user_id) !== Number(userId)) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      await pool.query('DELETE FROM posts WHERE id = $1', [postId])
      return true
    },

    toggleLike: async (_, { postId }, context) => {
      const userId = requireAuth(context)

      const likeExists = await pool.query(
        'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      )

      let message
      let liked

      if (likeExists.rows.length > 0) {
        await pool.query(
          'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        )
        message = 'Post unliked'
        liked = false
      } else {
        await pool.query(
          'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        )
        message = 'Post liked'
        liked = true
      }

      const likes = await getPostLikeCount(postId)
      const payload = {
        postId: String(postId),
        likes,
        liked,
        message,
      }

      pubsub.publish(POST_LIKED, { postLiked: payload })
      return payload
    },

    addComment: async (_, { postId, content }, context) => {
      const userId = requireAuth(context)

      if (!content) {
        throw new GraphQLError('Content is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const result = await pool.query(
        'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
        [postId, userId, content]
      )

      const comment = result.rows[0]
      const userResult = await pool.query(
        'SELECT id, username FROM users WHERE id = $1',
        [userId]
      )

      const commentPayload = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: userResult.rows[0],
      }

      const commentCount = await getPostCommentCount(postId)
      const eventPayload = {
        postId: String(postId),
        comment: commentPayload,
        commentCount,
      }

      pubsub.publish(COMMENT_ADDED, { commentAdded: eventPayload })
      return commentPayload
    },
  },

  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator([POST_CREATED]),
    },
    postLiked: {
      subscribe: () => pubsub.asyncIterator([POST_LIKED]),
    },
    commentAdded: {
      subscribe: () => pubsub.asyncIterator([COMMENT_ADDED]),
    },
  },
}

module.exports = postsResolvers
