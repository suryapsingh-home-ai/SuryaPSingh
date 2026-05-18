const express = require('express')
const router = express.Router()
const connectionsController = require('../controllers/connections')

// Search users
router.get('/search', connectionsController.searchUsers)

// Send connection request
router.post('/request', connectionsController.sendConnectionRequest)

// Get pending requests
router.get('/requests/pending', connectionsController.getPendingRequests)

// Accept connection request
router.post('/requests/accept', connectionsController.acceptConnectionRequest)

// Reject connection request
router.post('/requests/reject', connectionsController.rejectConnectionRequest)

// Get user connections
router.get('/list', connectionsController.getUserConnections)

module.exports = router
