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
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '../stores/commentsStore';
import { selectedPr } from '../stores/selectedPrStore';

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

  // Fetch all comments for the PR
  const { data: allComments = [] } = useComments();
  
  // Mutations
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

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
    if (!commentText.trim() || !selectedPr.value) return;

    try {
      if (isNewComment) {
        // Create new comment at specific line
        await createComment.mutateAsync({
          body: commentText,
          commitId: selectedPr.value.head.sha,
          path: selectedCommentLocation.value.filename,
          line: selectedCommentLocation.value.lineNumber,
          side: 'RIGHT',
        });
      } else {
        // Reply to existing thread (create comment in response to first comment)
        const threadComments = selectedCommentChain.value?.comments || [];
        if (threadComments.length > 0) {
          await createComment.mutateAsync({
            body: commentText,
            commitId: selectedPr.value.head.sha,
            path: selectedCommentChain.value.filename,
            line: selectedCommentChain.value.lineNumber,
            side: 'RIGHT',
            in_reply_to: threadComments[0].id,
          });
        }
      }
      setCommentText('');
      hideCommentModal();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const handleCancel = () => {
    setCommentText('');
    hideCommentModal();
  };

  const handleResolve = async () => {
    // TODO: Implement resolve via GitHub API (requires review API)
    console.log('Resolve comment thread');
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
    if (!editText.trim()) return;

    try {
      await updateComment.mutateAsync({ commentId, body: editText });
      setEditingCommentId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment.mutateAsync({ commentId });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Get comments for the current thread
  const threadComments = hasCommentChain ? (selectedCommentChain.value?.comments || []) : [];

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
        {hasCommentChain && threadComments.length > 0 && (
          <div className="comment-modal-thread">
            {threadComments.map((comment) => (
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
