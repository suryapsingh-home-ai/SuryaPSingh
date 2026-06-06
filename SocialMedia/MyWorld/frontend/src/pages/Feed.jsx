import { useState } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import PostCard from '../components/PostCard'
import {
  GET_POSTS,
  CREATE_POST,
  POST_CREATED_SUBSCRIPTION,
  POST_LIKED_SUBSCRIPTION,
  COMMENT_ADDED_SUBSCRIPTION,
} from '../graphql/operations'
import './Feed.css'

function Feed() {
  const [content, setContent] = useState('')

  const { data, loading: postsLoading, client } = useQuery(GET_POSTS)

  const [createPost, { loading: creating }] = useMutation(CREATE_POST, {
    onCompleted: () => setContent(''),
  })

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const newPost = subData.data?.postCreated
      if (!newPost) return

      client.cache.updateQuery({ query: GET_POSTS }, (existing) => {
        if (!existing) return existing
        if (existing.posts.some((p) => p.id === newPost.id)) return existing
        return { posts: [newPost, ...existing.posts] }
      })
    },
  })

  useSubscription(POST_LIKED_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const update = subData.data?.postLiked
      if (!update) return
      updatePostInCache(client, update.postId, (post) => ({
        ...post,
        likes: update.likes,
        likedByMe: update.liked,
      }))
    },
  })

  useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const update = subData.data?.commentAdded
      if (!update) return
      updatePostInCache(client, update.postId, (post) => ({
        ...post,
        comments: update.commentCount,
      }))
    },
  })

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    await createPost({ variables: { content: content.trim() } })
  }

  const handleLikeUpdate = (likeResult) => {
    updatePostInCache(client, likeResult.postId, (post) => ({
      ...post,
      likes: likeResult.likes,
      likedByMe: likeResult.liked,
    }))
  }

  const posts = data?.posts || []

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Feed</h1>
        <span className="live-indicator">Live</span>
      </div>

      <div className="container">
        <div className="feed">
          <div className="post-creator">
            <form onSubmit={handleCreatePost}>
              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button type="submit" disabled={creating || !content.trim()}>
                {creating ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>

          <div className="posts-list">
            {postsLoading ? (
              <p>Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="no-posts">No posts yet. Create one!</p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function updatePostInCache(client, postId, updater) {
  client.cache.updateQuery({ query: GET_POSTS }, (existing) => {
    if (!existing) return existing
    return {
      posts: existing.posts.map((post) =>
        String(post.id) === String(postId) ? updater(post) : post
      ),
    }
  })
}

export default Feed
