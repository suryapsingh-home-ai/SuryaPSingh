const authResolvers = require('./auth')
const postsResolvers = require('./posts')
const usersResolvers = require('./users')
const connectionsResolvers = require('./connections')
const groupsResolvers = require('./groups')
const marketplaceResolvers = require('./marketplace')

function mergeResolvers(...resolverMaps) {
  const merged = { Query: {}, Mutation: {}, Subscription: {} }

  for (const map of resolverMaps) {
    if (map.Query) Object.assign(merged.Query, map.Query)
    if (map.Mutation) Object.assign(merged.Mutation, map.Mutation)
    if (map.Subscription) Object.assign(merged.Subscription, map.Subscription)
  }

  return merged
}

module.exports = mergeResolvers(
  authResolvers,
  postsResolvers,
  usersResolvers,
  connectionsResolvers,
  groupsResolvers,
  marketplaceResolvers
)
