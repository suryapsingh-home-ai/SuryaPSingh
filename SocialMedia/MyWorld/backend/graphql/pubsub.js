const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()

const POST_CREATED = 'POST_CREATED'
const POST_LIKED = 'POST_LIKED'
const COMMENT_ADDED = 'COMMENT_ADDED'

module.exports = { pubsub, POST_CREATED, POST_LIKED, COMMENT_ADDED }
