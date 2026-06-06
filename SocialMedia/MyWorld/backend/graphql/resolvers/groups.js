const pool = require('../../db')
const { GraphQLError } = require('graphql')
const { requireAuth } = require('../errors')

const groupsResolvers = {
  Query: {
    groups: async (_, __, context) => {
      requireAuth(context)

      const result = await pool.query(
        `SELECT g.*, u.username as admin_name,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
         FROM groups g
         JOIN users u ON u.id = g.admin_id
         ORDER BY g.created_at DESC`
      )

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        adminId: row.admin_id,
        adminName: row.admin_name,
        memberCount: parseInt(row.member_count, 10),
      }))
    },

    group: async (_, { id }, context) => {
      requireAuth(context)

      const groupResult = await pool.query(
        `SELECT g.*, u.username as admin_name
         FROM groups g
         JOIN users u ON u.id = g.admin_id
         WHERE g.id = $1`,
        [id]
      )

      if (groupResult.rows.length === 0) {
        throw new GraphQLError('Group not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const row = groupResult.rows[0]
      const membersResult = await pool.query(
        `SELECT u.id, u.username, gm.role
         FROM group_members gm
         JOIN users u ON u.id = gm.user_id
         WHERE gm.group_id = $1`,
        [id]
      )

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        adminId: row.admin_id,
        adminName: row.admin_name,
        members: membersResult.rows.map((m) => ({
          id: m.id,
          username: m.username,
          role: m.role,
        })),
      }
    },

    groupPosts: async (_, { groupId }, context) => {
      requireAuth(context)

      const result = await pool.query(
        `SELECT gp.*, u.username,
                (SELECT COUNT(*) FROM group_post_likes WHERE group_post_id = gp.id) as likes_count,
                (SELECT COUNT(*) FROM group_post_comments WHERE group_post_id = gp.id) as comments_count
         FROM group_posts gp
         JOIN users u ON u.id = gp.user_id
         WHERE gp.group_id = $1
         ORDER BY gp.created_at DESC`,
        [groupId]
      )

      return result.rows.map((row) => ({
        id: row.id,
        groupId: row.group_id,
        content: row.content,
        createdAt: row.created_at,
        username: row.username,
        likesCount: parseInt(row.likes_count, 10),
        commentsCount: parseInt(row.comments_count, 10),
      }))
    },
  },

  Mutation: {
    createGroup: async (_, { name, description }, context) => {
      const adminId = requireAuth(context)

      if (!name) {
        throw new GraphQLError('Group name is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const groupResult = await pool.query(
        'INSERT INTO groups (name, description, admin_id) VALUES ($1, $2, $3) RETURNING *',
        [name, description || null, adminId]
      )

      const group = groupResult.rows[0]

      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
        [group.id, adminId, 'admin']
      )

      const adminResult = await pool.query(
        'SELECT username FROM users WHERE id = $1',
        [adminId]
      )

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        adminId: group.admin_id,
        adminName: adminResult.rows[0]?.username,
        memberCount: 1,
      }
    },

    joinGroup: async (_, { groupId }, context) => {
      const userId = requireAuth(context)

      const groupExists = await pool.query(
        'SELECT id FROM groups WHERE id = $1',
        [groupId]
      )
      if (groupExists.rows.length === 0) {
        throw new GraphQLError('Group not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const existingMember = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
      )
      if (existingMember.rows.length > 0) {
        throw new GraphQLError('Already a member of this group', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
        [groupId, userId, 'member']
      )

      return 'Joined group successfully'
    },

    leaveGroup: async (_, { groupId }, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
        [groupId, userId]
      )

      if (result.rows.length === 0) {
        throw new GraphQLError('Not a member of this group', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      return 'Left group successfully'
    },

    createGroupPost: async (_, { groupId, content }, context) => {
      const userId = requireAuth(context)

      if (!content) {
        throw new GraphQLError('Content is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const memberCheck = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
      )

      if (memberCheck.rows.length === 0) {
        throw new GraphQLError('You must be a member of this group to post', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      const result = await pool.query(
        'INSERT INTO group_posts (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
        [groupId, userId, content]
      )

      const post = result.rows[0]
      const userResult = await pool.query(
        'SELECT username FROM users WHERE id = $1',
        [userId]
      )

      return {
        id: post.id,
        groupId: post.group_id,
        content: post.content,
        createdAt: post.created_at,
        username: userResult.rows[0].username,
        likesCount: 0,
        commentsCount: 0,
      }
    },

    toggleGroupPostLike: async (_, { postId }, context) => {
      const userId = requireAuth(context)

      const existingLike = await pool.query(
        'SELECT id FROM group_post_likes WHERE group_post_id = $1 AND user_id = $2',
        [postId, userId]
      )

      if (existingLike.rows.length > 0) {
        await pool.query(
          'DELETE FROM group_post_likes WHERE group_post_id = $1 AND user_id = $2',
          [postId, userId]
        )
        return 'Post unliked'
      }

      await pool.query(
        'INSERT INTO group_post_likes (group_post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      )
      return 'Post liked'
    },

    commentOnGroupPost: async (_, { postId, content }, context) => {
      const userId = requireAuth(context)

      if (!content) {
        throw new GraphQLError('Comment content is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      await pool.query(
        'INSERT INTO group_post_comments (group_post_id, user_id, content) VALUES ($1, $2, $3)',
        [postId, userId, content]
      )

      return 'Comment added'
    },
  },
}

module.exports = groupsResolvers
