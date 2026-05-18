const express = require('express')
const router = express.Router()
const groupsController = require('../controllers/groups')

// Create group
router.post('/', groupsController.createGroup)

// Get all groups
router.get('/', groupsController.getAllGroups)

// Get group details
router.get('/:groupId', groupsController.getGroupDetails)

// Join group
router.post('/join', groupsController.joinGroup)

// Leave group
router.post('/leave', groupsController.leaveGroup)

// Create group post
router.post('/posts', groupsController.createGroupPost)

// Get group posts
router.get('/:groupId/posts', groupsController.getGroupPosts)

// Like group post
router.post('/posts/like', groupsController.likeGroupPost)

// Comment on group post
router.post('/posts/comment', groupsController.commentOnGroupPost)

// Get group post comments
router.get('/posts/:postId/comments', groupsController.getGroupPostComments)

// Promote member to admin
router.post('/admin/promote', groupsController.promoteToAdmin)

// Remove member from group
router.post('/member/remove', groupsController.removeMember)

module.exports = router
