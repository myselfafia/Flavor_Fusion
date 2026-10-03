import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./DeleteConfirmModal.css";

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "",
  message = "Are you sure you want to delete?",
  subtext = "",
  confirmText = "Yes",
  cancelText = "No",
  postPreview = "",
  showIcon = false,
  showCloseBtn = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="delete-modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="delete-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-message"
      >
        {showCloseBtn && (
          <button
            type="button"
            className="delete-modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {showIcon && (
          <div className="delete-modal-icon-wrapper" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
        )}

        <div className="delete-modal-content">
          {title && (
            <h3 id="delete-modal-title" className="delete-modal-title">
              {title}
            </h3>
          )}
          <p id="delete-modal-message" className="delete-modal-message">
            {message}
          </p>
          {postPreview && (
            <div className="delete-modal-preview">
              &ldquo;{postPreview.length > 90 ? `${postPreview.slice(0, 90)}…` : postPreview}&rdquo;
            </div>
          )}
          {subtext && <p className="delete-modal-subtext">{subtext}</p>}
        </div>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-modal-btn cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="delete-modal-btn confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteConfirmModal;
