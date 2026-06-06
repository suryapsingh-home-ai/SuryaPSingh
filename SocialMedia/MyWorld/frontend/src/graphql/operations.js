import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`

export const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
  ) {
    register(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      bio
      friendCount
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      email
      bio
      friendCount
    }
  }
`

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!) {
    userPosts(userId: $userId) {
      id
      content
      createdAt
      likes
      comments
      likedByMe
      author {
        id
        username
      }
    }
  }
`

export const UPDATE_BIO = gql`
  mutation UpdateBio($bio: String!) {
    updateBio(bio: $bio) {
      id
      username
      email
      bio
      friendCount
    }
  }
`

export const DELETE_POST = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      content
      createdAt
      likes
      comments
      likedByMe
      author {
        id
        username
      }
    }
  }
`

export const GET_POST_COMMENTS = gql`
  query GetPostComments($postId: ID!) {
    postComments(postId: $postId) {
      id
      content
      createdAt
      author {
        id
        username
      }
    }
  }
`

export const TOGGLE_LIKE = gql`
  mutation ToggleLike($postId: ID!) {
    toggleLike(postId: $postId) {
      postId
      likes
      liked
      message
    }
  }
`

export const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $content: String!) {
    addComment(postId: $postId, content: $content) {
      id
      content
      createdAt
      author {
        id
        username
      }
    }
  }
`

export const POST_CREATED_SUBSCRIPTION = gql`
  subscription PostCreated {
    postCreated {
      id
      content
      createdAt
      likes
      comments
      likedByMe
      author {
        id
        username
      }
    }
  }
`

export const POST_LIKED_SUBSCRIPTION = gql`
  subscription PostLiked {
    postLiked {
      postId
      likes
      liked
      message
    }
  }
`

export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription CommentAdded {
    commentAdded {
      postId
      commentCount
      comment {
        id
        content
        createdAt
        author {
          id
          username
        }
      }
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      createdAt
      likes
      comments
      likedByMe
      author {
        id
        username
      }
    }
  }
`

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      username
      bio
    }
  }
`

export const GET_PENDING_REQUESTS = gql`
  query GetPendingRequests {
    pendingConnectionRequests {
      id
      senderId
      username
      bio
    }
  }
`

export const GET_CONNECTIONS = gql`
  query GetConnections {
    connections {
      friendId
      username
      bio
    }
  }
`

export const SEND_CONNECTION_REQUEST = gql`
  mutation SendConnectionRequest($recipientId: ID!) {
    sendConnectionRequest(recipientId: $recipientId)
  }
`

export const ACCEPT_CONNECTION_REQUEST = gql`
  mutation AcceptConnectionRequest($connectionId: ID!) {
    acceptConnectionRequest(connectionId: $connectionId)
  }
`

export const REJECT_CONNECTION_REQUEST = gql`
  mutation RejectConnectionRequest($connectionId: ID!) {
    rejectConnectionRequest(connectionId: $connectionId)
  }
`

export const GET_GROUPS = gql`
  query GetGroups {
    groups {
      id
      name
      description
      adminName
      memberCount
    }
  }
`

export const GET_GROUP_POSTS = gql`
  query GetGroupPosts($groupId: ID!) {
    groupPosts(groupId: $groupId) {
      id
      groupId
      content
      createdAt
      username
      likesCount
      commentsCount
    }
  }
`

export const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!, $description: String) {
    createGroup(name: $name, description: $description) {
      id
      name
      description
      adminName
      memberCount
    }
  }
`

export const JOIN_GROUP = gql`
  mutation JoinGroup($groupId: ID!) {
    joinGroup(groupId: $groupId)
  }
`

export const CREATE_GROUP_POST = gql`
  mutation CreateGroupPost($groupId: ID!, $content: String!) {
    createGroupPost(groupId: $groupId, content: $content) {
      id
      groupId
      content
      createdAt
      username
      likesCount
      commentsCount
    }
  }
`

export const TOGGLE_GROUP_POST_LIKE = gql`
  mutation ToggleGroupPostLike($postId: ID!) {
    toggleGroupPostLike(postId: $postId)
  }
`

export const GET_MARKETPLACE_LISTINGS = gql`
  query GetMarketplaceListings($category: String) {
    marketplaceListings(category: $category) {
      id
      title
      description
      price
      category
      status
      username
    }
  }
`

export const GET_MY_LISTINGS = gql`
  query GetMyListings {
    myListings {
      id
      title
      description
      price
      category
      status
    }
  }
`

export const GET_LISTING = gql`
  query GetListing($id: ID!) {
    listing(id: $id) {
      id
      title
      description
      price
      category
      status
      username
      email
      offers {
        id
        offerPrice
        message
        status
        username
      }
    }
  }
`

export const GET_SENT_OFFERS = gql`
  query GetSentOffers {
    sentOffers {
      id
      listingId
      offerPrice
      message
      status
      title
      price
    }
  }
`

export const CREATE_LISTING = gql`
  mutation CreateListing(
    $title: String!
    $description: String
    $price: Float
    $category: String
  ) {
    createListing(
      title: $title
      description: $description
      price: $price
      category: $category
    ) {
      id
      title
      description
      price
      category
      status
    }
  }
`

export const DELETE_LISTING = gql`
  mutation DeleteListing($listingId: ID!) {
    deleteListing(listingId: $listingId)
  }
`

export const SEND_OFFER = gql`
  mutation SendOffer(
    $listingId: ID!
    $offerPrice: Float!
    $message: String
  ) {
    sendOffer(listingId: $listingId, offerPrice: $offerPrice, message: $message)
  }
`
