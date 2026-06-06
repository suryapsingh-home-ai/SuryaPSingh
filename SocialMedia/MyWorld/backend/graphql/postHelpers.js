const pool = require('../db')

async function getPostLikeCount(postId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM likes WHERE post_id = $1',
    [postId]
  )
  return parseInt(result.rows[0].count, 10)
}

async function getPostCommentCount(postId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM comments WHERE post_id = $1',
    [postId]
  )
  return parseInt(result.rows[0].count, 10)
}

async function isPostLikedByUser(postId, userId) {
  if (!userId) return false
  const result = await pool.query(
    'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  )
  return result.rows.length > 0
}

function mapPostRow(row) {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    likes: parseInt(row.likes, 10),
    comments: parseInt(row.comment_count, 10),
    likedByMe: row.liked_by_me === true || row.liked_by_me === 't',
    author: { id: row.author_id, username: row.username },
  }
}

async function buildPostPayload(post, userId) {
  const userResult = await pool.query(
    'SELECT id, username FROM users WHERE id = $1',
    [post.user_id]
  )

  const likes = await getPostLikeCount(post.id)
  const comments = await getPostCommentCount(post.id)
  const likedByMe = await isPostLikedByUser(post.id, userId)

  return {
    id: post.id,
    content: post.content,
    createdAt: post.created_at,
    likes,
    comments,
    likedByMe,
    author: userResult.rows[0],
  }
}

module.exports = {
  getPostLikeCount,
  getPostCommentCount,
  isPostLikedByUser,
  mapPostRow,
  buildPostPayload,
}
