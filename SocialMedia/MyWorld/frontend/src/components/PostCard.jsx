import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import {
  GET_POST_COMMENTS,
  TOGGLE_LIKE,
  ADD_COMMENT,
  DELETE_POST,
  COMMENT_ADDED_SUBSCRIPTION,
} from '../graphql/operations'

function PostCard({
  post,
  onLikeUpdate,
  showAuthor = true,
  canDelete = false,
  onDelete,
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const { data: commentsData, loading: commentsLoading, refetch: refetchComments } =
    useQuery(GET_POST_COMMENTS, {
      variables: { postId: post.id },
      skip: !showComments,
    })

  useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
    skip: !showComments,
    onData: ({ data }) => {
      const update = data.data?.commentAdded
      if (update && String(update.postId) === String(post.id)) {
        refetchComments()
      }
    },
  })

  const [toggleLike, { loading: liking }] = useMutation(TOGGLE_LIKE, {
    onCompleted: (data) => {
      onLikeUpdate?.(data.toggleLike)
    },
  })

  const [addComment, { loading: commenting }] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setCommentText('')
      refetchComments()
    },
  })

  const [deletePost, { loading: deleting }] = useMutation(DELETE_POST, {
    onCompleted: () => {
      onDelete?.(post.id)
    },
  })

  const handleLike = () => {
    toggleLike({ variables: { postId: post.id } })
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addComment({
      variables: { postId: post.id, content: commentText.trim() },
    })
  }

  const handleDelete = () => {
    if (window.confirm('Delete this post?')) {
      deletePost({ variables: { postId: post.id } })
    }
  }

  const comments = commentsData?.postComments || []

  return (
    <div className="post">
      {showAuthor && (
        <p className="post-author">
          <Link to={`/profile/${post.author.id}`}>@{post.author.username}</Link>
        </p>
      )}
      <p className="post-content">{post.content}</p>
      <small>{new Date(post.createdAt).toLocaleString()}</small>

      <div className="post-meta">
        <span>{post.likes} likes</span>
        <span>{post.comments} comments</span>
      </div>

      <div className="post-actions">
        <button
          type="button"
          className={`action-btn like-btn ${post.likedByMe ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
        >
          {post.likedByMe ? '♥ Liked' : '♡ Like'}
        </button>
        <button
          type="button"
          className="action-btn comment-toggle-btn"
          onClick={() => setShowComments((prev) => !prev)}
        >
          {showComments ? 'Hide Comments' : 'Comments'}
        </button>
        {canDelete && (
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            Delete
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments-section">
          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={commenting || !commentText.trim()}>
              {commenting ? '...' : 'Post'}
            </button>
          </form>

          {commentsLoading ? (
            <p className="comments-loading">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="no-comments">No comments yet.</p>
          ) : (
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <strong>@{comment.author.username}</strong>
                  <span>{comment.content}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default PostCard
