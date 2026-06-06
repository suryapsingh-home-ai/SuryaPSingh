const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String
    bio: String
    friendCount: Int
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Post {
    id: ID!
    content: String!
    createdAt: String!
    likes: Int!
    comments: Int!
    likedByMe: Boolean!
    author: User!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    author: User!
  }

  type PostLikeResult {
    postId: ID!
    likes: Int!
    liked: Boolean!
    message: String!
  }

  type CommentAdded {
    postId: ID!
    comment: Comment!
    commentCount: Int!
  }

  type ConnectionRequest {
    id: ID!
    senderId: ID!
    username: String!
    bio: String
  }

  type Friend {
    friendId: ID!
    username: String!
    bio: String
  }

  type Group {
    id: ID!
    name: String!
    description: String
    adminId: ID!
    adminName: String
    memberCount: Int
    members: [GroupMember!]
  }

  type GroupMember {
    id: ID!
    username: String!
    role: String!
  }

  type GroupPost {
    id: ID!
    groupId: ID!
    content: String!
    createdAt: String!
    username: String!
    likesCount: Int!
    commentsCount: Int!
  }

  type MarketplaceListing {
    id: ID!
    title: String!
    description: String
    price: Float
    imageUrl: String
    category: String
    status: String!
    username: String
    email: String
    offers: [MarketplaceOffer!]
  }

  type MarketplaceOffer {
    id: ID!
    listingId: ID
    offerPrice: Float
    message: String
    status: String!
    username: String
    title: String
    price: Float
  }

  type Query {
    me: User
    posts: [Post!]!
    postComments(postId: ID!): [Comment!]!
    user(id: ID!): User
    userPosts(userId: ID!): [Post!]!
    searchUsers(query: String!): [User!]!
    pendingConnectionRequests: [ConnectionRequest!]!
    connections: [Friend!]!
    groups: [Group!]!
    group(id: ID!): Group
    groupPosts(groupId: ID!): [GroupPost!]!
    marketplaceListings(category: String): [MarketplaceListing!]!
    myListings: [MarketplaceListing!]!
    listing(id: ID!): MarketplaceListing
    sentOffers: [MarketplaceOffer!]!
    receivedOffers: [MarketplaceOffer!]!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createPost(content: String!): Post!
    deletePost(postId: ID!): Boolean!
    toggleLike(postId: ID!): PostLikeResult!
    addComment(postId: ID!, content: String!): Comment!
    sendConnectionRequest(recipientId: ID!): String!
    acceptConnectionRequest(connectionId: ID!): String!
    rejectConnectionRequest(connectionId: ID!): String!
    createGroup(name: String!, description: String): Group!
    joinGroup(groupId: ID!): String!
    leaveGroup(groupId: ID!): String!
    createGroupPost(groupId: ID!, content: String!): GroupPost!
    toggleGroupPostLike(postId: ID!): String!
    commentOnGroupPost(postId: ID!, content: String!): String!
    createListing(
      title: String!
      description: String
      price: Float
      imageUrl: String
      category: String
    ): MarketplaceListing!
    updateListing(
      listingId: ID!
      title: String
      description: String
      price: Float
      imageUrl: String
      category: String
      status: String
    ): MarketplaceListing!
    deleteListing(listingId: ID!): String!
    sendOffer(listingId: ID!, offerPrice: Float!, message: String): String!
    acceptOffer(offerId: ID!): String!
    declineOffer(offerId: ID!): String!
    updateBio(bio: String!): User!
  }

  type Subscription {
    postCreated: Post!
    postLiked: PostLikeResult!
    commentAdded: CommentAdded!
  }
`

module.exports = typeDefs
