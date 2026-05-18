const db = require('../db')

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body
    const adminId = req.user.id

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' })
    }

    // Create group
    const groupResult = await db.query(
      'INSERT INTO groups (name, description, admin_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, adminId]
    )

    const groupId = groupResult.rows[0].id

    // Add admin as member
    await db.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [groupId, adminId, 'admin']
    )

    res.status(201).json({
      message: 'Group created successfully',
      group: groupResult.rows[0]
    })
  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({ error: 'Failed to create group' })
  }
}

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT g.*, u.username as admin_name, 
              (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM groups g
       JOIN users u ON u.id = g.admin_id
       ORDER BY g.created_at DESC`
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get all groups error:', error)
    res.status(500).json({ error: 'Failed to get groups' })
  }
}

// Get group details
exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params

    const groupResult = await db.query(
      `SELECT g.*, u.username as admin_name
       FROM groups g
       JOIN users u ON u.id = g.admin_id
       WHERE g.id = $1`,
      [groupId]
    )

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const membersResult = await db.query(
      `SELECT u.id, u.username, gm.role
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1`,
      [groupId]
    )

    res.json({
      ...groupResult.rows[0],
      members: membersResult.rows
    })
  } catch (error) {
    console.error('Get group details error:', error)
    res.status(500).json({ error: 'Failed to get group details' })
  }
}

// Join group
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body
    const userId = req.user.id

    // Check if group exists
    const groupExists = await db.query('SELECT id FROM groups WHERE id = $1', [
      groupId
    ])
    if (groupExists.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    // Check if already a member
    const existingMember = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    )
    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member of this group' })
    }

    const result = await db.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [groupId, userId, 'member']
    )

    res.status(201).json({
      message: 'Joined group successfully',
      member: result.rows[0]
    })
  } catch (error) {
    console.error('Join group error:', error)
    res.status(500).json({ error: 'Failed to join group' })
  }
}

// Leave group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body
    const userId = req.user.id

    const result = await db.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
      [groupId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not a member of this group' })
    }

    res.json({ message: 'Left group successfully' })
  } catch (error) {
    console.error('Leave group error:', error)
    res.status(500).json({ error: 'Failed to leave group' })
  }
}

// Create group post
exports.createGroupPost = async (req, res) => {
  try {
    const { groupId, content } = req.body
    const userId = req.user.id

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // Check if user is member of group
    const memberCheck = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        error: 'You must be a member of this group to post'
      })
    }

    const result = await db.query(
      'INSERT INTO group_posts (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [groupId, userId, content]
    )

    res.status(201).json({
      message: 'Post created successfully',
      post: result.rows[0]
    })
  } catch (error) {
    console.error('Create group post error:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
}

// Get group posts
exports.getGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params

    const result = await db.query(
      `SELECT gp.*, u.username,
              (SELECT COUNT(*) FROM group_post_likes WHERE group_post_id = gp.id) as likes_count,
              (SELECT COUNT(*) FROM group_post_comments WHERE group_post_id = gp.id) as comments_count
       FROM group_posts gp
       JOIN users u ON u.id = gp.user_id
       WHERE gp.group_id = $1
       ORDER BY gp.created_at DESC`,
      [groupId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get group posts error:', error)
    res.status(500).json({ error: 'Failed to get group posts' })
  }
}

// Like group post
exports.likeGroupPost = async (req, res) => {
  try {
    const { postId } = req.body
    const userId = req.user.id

    const existingLike = await db.query(
      'SELECT id FROM group_post_likes WHERE group_post_id = $1 AND user_id = $2',
      [postId, userId]
    )

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM group_post_likes WHERE group_post_id = $1 AND user_id = $2',
        [postId, userId]
      )
      return res.json({ message: 'Post unliked' })
    }

    // Like
    const result = await db.query(
      'INSERT INTO group_post_likes (group_post_id, user_id) VALUES ($1, $2) RETURNING *',
      [postId, userId]
    )

    res.status(201).json({
      message: 'Post liked',
      like: result.rows[0]
    })
  } catch (error) {
    console.error('Like group post error:', error)
    res.status(500).json({ error: 'Failed to like post' })
  }
}

// Comment on group post
exports.commentOnGroupPost = async (req, res) => {
  try {
    const { postId, content } = req.body
    const userId = req.user.id

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    const result = await db.query(
      'INSERT INTO group_post_comments (group_post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, content]
    )

    res.status(201).json({
      message: 'Comment added',
      comment: result.rows[0]
    })
  } catch (error) {
    console.error('Comment on group post error:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
}

// Get group post comments
exports.getGroupPostComments = async (req, res) => {
  try {
    const { postId } = req.params

    const result = await db.query(
      `SELECT gpc.*, u.username
       FROM group_post_comments gpc
       JOIN users u ON u.id = gpc.user_id
       WHERE gpc.group_post_id = $1
       ORDER BY gpc.created_at ASC`,
      [postId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get group post comments error:', error)
    res.status(500).json({ error: 'Failed to get comments' })
  }
}

// Promote member to admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.body
    const adminId = req.user.id

    // Check if requester is admin
    const adminCheck = await db.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, adminId, 'admin']
    )

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only admins can promote members' })
    }

    const result = await db.query(
      'UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3 RETURNING *',
      ['admin', groupId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }

    res.json({
      message: 'Member promoted to admin',
      member: result.rows[0]
    })
  } catch (error) {
    console.error('Promote to admin error:', error)
    res.status(500).json({ error: 'Failed to promote member' })
  }
}

// Remove member from group
exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body
    const adminId = req.user.id

    // Check if requester is admin
    const adminCheck = await db.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, adminId, 'admin']
    )

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only admins can remove members' })
    }

    const result = await db.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
      [groupId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }

    res.json({ message: 'Member removed from group' })
  } catch (error) {
    console.error('Remove member error:', error)
    res.status(500).json({ error: 'Failed to remove member' })
  }
}
