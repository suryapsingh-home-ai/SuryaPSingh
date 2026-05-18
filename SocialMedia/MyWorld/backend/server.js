require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth')
const postsRoutes = require('./routes/posts')
const usersRoutes = require('./routes/users')
const connectionsRoutes = require('./routes/connections')
const groupsRoutes = require('./routes/groups')
const marketplaceRoutes = require('./routes/marketplace')
const { authMiddleware } = require('./middleware/auth')

const app = express()

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)
app.use('/posts', authMiddleware, postsRoutes)
app.use('/users', authMiddleware, usersRoutes)
app.use('/connections', authMiddleware, connectionsRoutes)
app.use('/groups', authMiddleware, groupsRoutes)
app.use('/marketplace', authMiddleware, marketplaceRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
