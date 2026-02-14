/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRef, useState, useEffect } from 'preact/hooks';
import { 
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
import {
  useActiveReview,
  useCreateReview,
  useAddReviewComment,
  useSubmitReview,
} from '../stores/reviewsStore';
import { useCurrentUser } from '../stores/userStore';
import { usePrData } from '../stores/prDataStore';
import { settings } from '../stores/settingsStore';

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
  
  // Fetch PR data to get head SHA
  const { data: prData } = usePrData();
  
  // Fetch current user
  const { data: currentUser } = useCurrentUser();
  
  // Fetch active review for current user
  const { data: activeReview } = useActiveReview();
  
  // Mutations
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const createReview = useCreateReview();
  const addReviewComment = useAddReviewComment();
  const submitReview = useSubmitReview();

  const hasCommentChain = selectedCommentChain.value !== null;
  const isNewComment = selectedCommentLocation.value !== null;

  // Auto-focus the modal whenever the signals change (even if setting the same value again)
  // The CSS :focus-within handles visibility - focused = visible, not focused = hidden
  useEffect(() => {
    if ((hasCommentChain || isNewComment) && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedCommentChain.value, selectedCommentLocation.value]);

  // Update selectedCommentChain when allComments changes (after mutations)
  // This keeps the modal in sync with fresh comment data
  useEffect(() => {
    if (hasCommentChain && allComments.length > 0) {
      const { filename, lineNumber } = selectedCommentChain.value;
      
      // Find updated comments for this file/line
      const updatedChain = allComments.filter(comment => 
        comment.path === filename && 
        (comment.line === lineNumber || comment.start_line === lineNumber)
      );
      
      if (updatedChain.length > 0) {
        // Update with fresh data
        selectedCommentChain.value = {
          filename,
          lineNumber,
          comments: updatedChain
        };
        
        // Ensure modal stays focused after data refresh
        if (modalRef.current && document.activeElement !== modalRef.current) {
          modalRef.current.focus();
        }
      }
    }
  }, [allComments, hasCommentChain]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !prData?.pull) return;

    try {
      const commitSha = prData.pull.head.sha;
      
      // Check if we have an active review
      if (activeReview) {
        // Add comment to existing review
        const commentData = {
          reviewNodeId: activeReview.node_id,
          body: commentText,
          path: isNewComment 
            ? selectedCommentLocation.value.filename 
            : selectedCommentChain.value.filename,
          line: isNewComment 
            ? selectedCommentLocation.value.lineNumber 
            : selectedCommentChain.value.lineNumber,
          side: 'RIGHT',
        };
        
        await addReviewComment.mutateAsync(commentData);
      } else {
        // No active review - create one first, then add comment
        const newReview = await createReview.mutateAsync({
          commitId: commitSha,
          body: '',
          event: 'PENDING',
        });
        
        // Now add comment to the newly created review
        const commentData = {
          reviewNodeId: newReview.node_id,
          body: commentText,
          path: isNewComment 
            ? selectedCommentLocation.value.filename 
            : selectedCommentChain.value.filename,
          line: isNewComment 
            ? selectedCommentLocation.value.lineNumber 
            : selectedCommentChain.value.lineNumber,
          side: 'RIGHT',
        };
        
        await addReviewComment.mutateAsync(commentData);
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
    // Blur to hide modal (same pattern as directory browser)
    if (document.activeElement) {
      document.activeElement.blur();
    }
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

  const handleSubmitReview = async () => {
    if (!activeReview) return;
    
    try {
      const reviewBody = settings.value.reviewSubmissionComment || '';
      
      await submitReview.mutateAsync({
        reviewId: activeReview.id,
        body: reviewBody,
        event: 'REQUEST_CHANGES',
      });
      
      hideCommentModal();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Get comments for the current thread
  const threadComments = hasCommentChain ? (selectedCommentChain.value?.comments || []) : [];
  
  // Map comments to add isCurrentUser flag
  const commentsWithUserFlag = threadComments.map(comment => ({
    ...comment,
    isCurrentUser: currentUser && comment.user.login === currentUser.login
  }));

  return (
    <div 
      ref={modalRef}
      className="comment-modal"
      tabIndex={-1}
    >
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
        {hasCommentChain && commentsWithUserFlag.length > 0 && (
          <div className="comment-modal-thread">
            {commentsWithUserFlag.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-item-header">
                  <span className="comment-item-author">{comment.user.login}</span>
                  <span className="comment-item-date">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {comment._isPending && (
                    <span className="comment-pending-badge">Pending</span>
                  )}
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
            {activeReview && (
              <button
                type="button"
                className="comment-modal-submit-review-btn"
                onClick={handleSubmitReview}
              >
                Submit Review: Request Changes
              </button>
            )}
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
              {activeReview ? 'Add comment' : 'Add Comment and start review'}
            </button>
          </div>
        </form>
    </div>
  );
}
