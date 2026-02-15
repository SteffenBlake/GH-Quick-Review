/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRef, useState, useEffect, useMemo } from 'preact/hooks';
import { 
  selectedCommentChain,
  selectedCommentLocation,
  clearCommentModal,
  registerModalRef,
  showCommentModal
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
  const threadContainerRef = useRef(null);
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

  // Register this modal's ref so the store can focus it directly when button is clicked
  useEffect(() => {
    registerModalRef(modalRef);
  }, []);

  // Get comments for the current thread directly from allComments
  // This prevents unnecessary signal updates that cause focus loss
  // Memoized to avoid recalculating on every render
  const threadComments = useMemo(() => {
    if (!hasCommentChain) return [];
    
    return allComments.filter(comment => 
      comment.path === selectedCommentChain.value.filename && 
      (comment.line === selectedCommentChain.value.lineNumber || 
       comment.start_line === selectedCommentChain.value.lineNumber)
    );
  }, [allComments, hasCommentChain, selectedCommentChain.value?.filename, selectedCommentChain.value?.lineNumber]);

  // BUG 1 FIX: Auto-scroll to the last comment when new comments are added
  useEffect(() => {
    if (threadComments.length > 0 && threadContainerRef.current) {
      // Scroll to the bottom of the thread container
      threadContainerRef.current.scrollTop = threadContainerRef.current.scrollHeight;
    }
  }, [threadComments.length]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    // IMMEDIATELY focus the modal to prevent focus loss during re-renders
    // The submit button might lose focus when the form re-renders, which would break :focus-within
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    if (!commentText.trim() || !prData?.pull) return;

    try {
      const commitSha = prData.pull.head.sha;
      
      // Store the location info for transitioning to thread mode
      const filename = isNewComment 
        ? selectedCommentLocation.value.filename 
        : selectedCommentChain.value.filename;
      const lineNumber = isNewComment 
        ? selectedCommentLocation.value.lineNumber 
        : selectedCommentChain.value.lineNumber;
      
      // Check if we have an active review
      if (activeReview) {
        // Add comment to existing review
        const commentData = {
          reviewNodeId: activeReview.node_id,
          body: commentText,
          path: filename,
          line: lineNumber,
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
          path: filename,
          line: lineNumber,
          side: 'RIGHT',
        };
        
        await addReviewComment.mutateAsync(commentData);
      }
      
      // BUG 2 FIX: If this was a new comment (not a reply to existing thread),
      // transition to "existing thread" mode so the comment appears in the modal immediately
      if (isNewComment) {
        showCommentModal({ filename, lineNumber });
      }
      
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const handleCancel = () => {
    setCommentText('');
    clearCommentModal();
    // Blur all focusable elements inside the modal
    if (modalRef.current) {
      const focusedElement = modalRef.current.querySelector(':focus');
      if (focusedElement) {
        focusedElement.blur();
      }
      modalRef.current.blur();
    }
  };

  const handleResolve = async () => {
    console.log('Resolve comment thread');
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
    // IMMEDIATELY focus the modal to prevent focus loss during re-renders
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
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
    // IMMEDIATELY focus the modal to prevent focus loss during re-renders
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
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
      
      // Don't blur the modal - let user continue working
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

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
          <div ref={threadContainerRef} className="comment-modal-thread">
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
