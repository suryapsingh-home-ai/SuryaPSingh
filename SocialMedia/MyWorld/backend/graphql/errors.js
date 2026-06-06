const { GraphQLError } = require('graphql')

function requireAuth(context) {
  if (!context.userId) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  return context.userId
}

module.exports = { requireAuth }
