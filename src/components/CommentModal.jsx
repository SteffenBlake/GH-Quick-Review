/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRef, useState, useEffect } from 'preact/hooks';
import { 
  isCommentModalVisible, 
  selectedCommentChain,
  selectedCommentLocation,
  hideCommentModal 
} from '../stores/commentModalStore';

// Icon constants
const ICON_PENCIL = '\udb81\ude4f';
const ICON_X = '\uf467';

/**
 * Modal for displaying and managing comment chains on PR lines
 */
export function CommentModal() {
  const modalRef = useRef(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  // Don't render if modal is not visible
  if (!isCommentModalVisible.value) {
    return null;
  }

  const hasCommentChain = selectedCommentChain.value !== null;
  const isNewComment = selectedCommentLocation.value !== null;

  // Auto-focus the modal when it becomes visible
  useEffect(() => {
    if (isCommentModalVisible.value && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isCommentModalVisible.value]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    // TODO: Implement comment submission via TanStack Query mutation
    console.log('Submit comment:', commentText);
    setCommentText('');
  };

  const handleCancel = () => {
    setCommentText('');
    hideCommentModal();
  };

  const handleResolve = async () => {
    // TODO: Implement resolve via TanStack Query mutation
    console.log('Resolve comment chain');
    hideCommentModal();
  };

  const handleEditComment = (commentId, currentBody) => {
    setEditingCommentId(commentId);
    setEditText(currentBody);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSubmitEdit = async (commentId) => {
    // TODO: Implement edit via TanStack Query mutation
    console.log('Update comment:', commentId, editText);
    setEditingCommentId(null);
    setEditText('');
  };

  const handleDeleteComment = async (commentId) => {
    // TODO: Implement delete via TanStack Query mutation
    if (confirm('Are you sure you want to delete this comment?')) {
      console.log('Delete comment:', commentId);
    }
  };

  // Mock data for demonstration - will be replaced with real data from store
  const mockComments = hasCommentChain ? [
    {
      id: 1,
      user: { login: 'testuser', avatar_url: '' },
      body: 'This is a test comment',
      created_at: '2024-01-01T00:00:00Z',
      isCurrentUser: true,
    },
    {
      id: 2,
      user: { login: 'otheruser', avatar_url: '' },
      body: 'This is a reply to the comment',
      created_at: '2024-01-01T01:00:00Z',
      isCurrentUser: false,
    },
  ] : [];

  return (
    <div 
      ref={modalRef}
      className="comment-modal"
      tabIndex={-1}
    >
      <div className="comment-modal-content">
        {/* Header with Resolve button */}
        <div className="comment-modal-header">
          <h2>
            {isNewComment ? 'New Comment' : 'Comment Thread'}
          </h2>
          {hasCommentChain && (
            <button 
              className="comment-modal-resolve-btn"
              onClick={handleResolve}
            >
              Resolve
            </button>
          )}
        </div>

        {/* Comment chain (scrollable) */}
        {hasCommentChain && (
          <div className="comment-modal-thread">
            {mockComments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-item-header">
                  <span className="comment-item-author">{comment.user.login}</span>
                  <span className="comment-item-date">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {comment.isCurrentUser && (
                    <div className="comment-item-actions">
                      <button
                        className="comment-action-btn comment-edit-btn"
                        onClick={() => handleEditComment(comment.id, comment.body)}
                        title="Edit comment"
                      >
                        {ICON_PENCIL}
                      </button>
                      <button
                        className="comment-action-btn comment-delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        {ICON_X}
                      </button>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="comment-edit-form">
                    <textarea
                      className="comment-edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                    />
                    <div className="comment-edit-actions">
                      <button
                        className="comment-edit-cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button
                        className="comment-edit-submit-btn"
                        onClick={() => handleSubmitEdit(comment.id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="comment-item-body">{comment.body}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Post comment form (always at bottom) */}
        <form className="comment-modal-form" onSubmit={handleSubmitComment}>
          <textarea
            className="comment-modal-textarea"
            placeholder={isNewComment ? 'Add a comment...' : 'Reply to thread...'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={6}
          />
          <div className="comment-modal-actions">
            <button
              type="button"
              className="comment-modal-cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="comment-modal-submit-btn"
              disabled={!commentText.trim()}
            >
              {isNewComment ? 'Comment' : 'Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
