require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const authRoutes = require('./routes/auth')
const postsRoutes = require('./routes/posts')
const usersRoutes = require('./routes/users')
const connectionsRoutes = require('./routes/connections')
const groupsRoutes = require('./routes/groups')
const marketplaceRoutes = require('./routes/marketplace')
const { authMiddleware } = require('./middleware/auth')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const {
  createContext,
  createContextFromConnectionParams,
} = require('./graphql/context')

const app = express()
const httpServer = http.createServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/auth', authRoutes)
app.use('/posts', authMiddleware, postsRoutes)
app.use('/users', authMiddleware, usersRoutes)
app.use('/connections', authMiddleware, connectionsRoutes)
app.use('/groups', authMiddleware, groupsRoutes)
app.use('/marketplace', authMiddleware, marketplaceRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

async function startServer() {
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  useServer(
    {
      schema,
      context: (ctx) =>
        createContextFromConnectionParams(ctx.connectionParams),
    },
    wsServer
  )

  const apolloServer = new ApolloServer({ schema })
  await apolloServer.start()

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => createContext({ req }),
    })
  )

  const PORT = process.env.PORT || 5000
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
    console.log(`GraphQL subscriptions: ws://localhost:${PORT}/graphql`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
