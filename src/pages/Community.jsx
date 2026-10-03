import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "./Community.css";

function Community({
  onHome,
  onExplore,
  onCommunity,
  onSignIn,
  navigate,
  isLoggedIn,
  onLogout,
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState("");
  const [recipeLink, setRecipeLink] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api("/posts");
        if (isMounted) {
          if (res && Array.isArray(res.posts)) {
            setPosts(res.posts);
          } else if (res && Array.isArray(res.data)) {
            setPosts(res.data);
          } else if (Array.isArray(res)) {
            setPosts(res);
          } else {
            setPosts([]);
          }
        }
      } catch (err) {
        console.error("Failed to load community feed:", err.message);
        if (isMounted) {
          setError(err.message || "Failed to load community feed.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const updatePost = (id, change) =>
    setPosts((current) =>
      current.map((post) =>
        String(post.id || post._id) === String(id)
          ? { ...post, ...change(post) }
          : post,
      ),
    );

  const deletePost = (id) =>
    setPosts((current) =>
      current.filter((post) => String(post.id || post._id) !== String(id)),
    );

  const createPost = async (event) => {
    event.preventDefault();
    if (!draft.trim() && !photo) return;

    if (!isLoggedIn) {
      setNotice("Please log in to share a recipe with the community.");
      if (onSignIn) {
        onSignIn();
      }
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          text: draft.trim(),
          image: photo,
          recipeLink: recipeLink.trim(),
        }),
      });

      const newPost = res?.post || res?.data;
      if (newPost) {
        setPosts((current) => [newPost, ...current]);
        setDraft("");
        setPhoto("");
        setRecipeLink("");
        setNotice("Your post is live!");
      }
    } catch (err) {
      console.error("Failed to publish post:", err.message);
      setNotice(err.message || "Failed to publish post.");
    } finally {
      setSubmitting(false);
    }
  };

  const onPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="app community-app">
      <Header
        activePage="community"
        onHome={onHome}
        onExplore={onExplore}
        onCommunity={onCommunity}
        onSignIn={onSignIn}
        onSaved={() => navigate && navigate("saved")}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />
      <main className="community-layout container">
        <CommunitySidebar />
        <section className="community-feed" aria-label="Community feed">
          <form className="composer" onSubmit={createPost}>
            <div className="composer-main">
              <span className="community-avatar you">YOU</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  isLoggedIn
                    ? "What's cooking today? Share your culinary creation..."
                    : "Log in to share your culinary creations with the community!"
                }
                aria-label="Post text"
                disabled={submitting}
              />
            </div>
            {photo && (
              <div className="photo-preview">
                <img src={photo} alt="Upload preview" />
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  aria-label="Remove photo"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>
            )}
            <div className="composer-actions">
              <label className="upload-control">
                ▣ Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhoto}
                  disabled={submitting}
                />
              </label>
              <input
                value={recipeLink}
                onChange={(event) => setRecipeLink(event.target.value)}
                placeholder="🔗 Recipe link (optional)"
                aria-label="Recipe link"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || (!draft.trim() && !photo)}
              >
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </form>

          {notice && (
            <p className="community-notice" role="status">
              {notice}
            </p>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="ai-spinner"></div>
              <h3>Loading community posts...</h3>
              <p>Gathering fresh culinary creations from our chefs</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="empty-state">
              <span>🍲</span>
              <h3>No community posts yet</h3>
              <p>
                Be the first chef to share your latest culinary dish with the
                Flavor Fusion community!
              </p>
            </div>
          )}

          {!loading &&
            posts.map((post) => (
              <CommunityPost
                key={post.id || post._id}
                post={post}
                onUpdate={updatePost}
                onDelete={deletePost}
                onNotice={setNotice}
                isLoggedIn={isLoggedIn}
                onSignIn={onSignIn}
              />
            ))}
        </section>
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

function CommunitySidebar() {
  return (
    <aside className="community-sidebar">
      <section>
        <h2>Trending Ingredients</h2>
        {["Miso Paste", "Harissa", "Black Garlic", "Yuzu"].map((item) => (
          <p key={item}>
            ⌁ <span>{item}</span>
          </p>
        ))}
      </section>
      <section>
        <h2>Top Cooks</h2>
        <div className="cook">
          <span className="community-avatar chef-sarah">CS</span>
          <p>
            <strong>Chef Sarah</strong>
            <small>42 Cooks</small>
          </p>
        </div>
        <div className="cook">
          <span className="community-avatar marcus">MR</span>
          <p>
            <strong>Marcus R.</strong>
            <small>38 Cooks</small>
          </p>
        </div>
      </section>
    </aside>
  );
}

function CommunityPost({
  post,
  onUpdate,
  onDelete,
  onNotice,
  isLoggedIn,
  onSignIn,
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);
  const saved = Boolean(post.saved);

  const postId = post.id || post._id;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const share = async () => {
    const url = `${window.location.origin}/community#${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Flavor Fusion community post",
          text: post.text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        onNotice("Post link copied to your clipboard.");
      }
    } catch {
      onNotice("Sharing was cancelled.");
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      if (onSignIn) onSignIn();
      return;
    }
    const previousLiked = post.liked;
    const previousLikes = post.likes || 0;
    onUpdate(postId, () => ({
      liked: !previousLiked,
      likes: previousLikes + (previousLiked ? -1 : 1),
    }));

    try {
      const res = await api(`/posts/${postId}/like`, {
        method: "POST",
      });
      if (res && res.success) {
        onUpdate(postId, () => ({
          liked: res.liked,
          likes: res.likes,
        }));
      }
    } catch (err) {
      console.warn("Could not toggle like:", err.message);
      onUpdate(postId, () => ({
        liked: previousLiked,
        likes: previousLikes,
      }));
    }
  };

  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      if (onSignIn) onSignIn();
      return;
    }
    const previousSaved = saved;
    onUpdate(postId, () => ({ saved: !previousSaved }));
    onNotice(
      !previousSaved
        ? "Post saved to your collection."
        : "Post removed from saved.",
    );

    try {
      const res = await api(`/posts/${postId}/save`, {
        method: "POST",
      });
      if (res && res.success) {
        onUpdate(postId, () => ({ saved: res.saved }));
      }
    } catch (err) {
      console.warn("Could not toggle save post:", err.message);
      onUpdate(postId, () => ({ saved: previousSaved }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await api(`/posts/${postId}`, {
        method: "DELETE",
      });
      if (onDelete) {
        onDelete(postId);
      }
      onNotice("Post deleted successfully.");
    } catch (err) {
      console.error("Failed to delete post:", err.message);
      onNotice(err.message || "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    if (!isLoggedIn) {
      if (onSignIn) onSignIn();
      return;
    }

    const textToSubmit = comment.trim();
    setComment("");

    try {
      const res = await api(`/posts/${postId}/comment`, {
        method: "POST",
        body: JSON.stringify({ text: textToSubmit }),
      });

      const newComment = res?.comment || res?.data;
      if (newComment) {
        onUpdate(postId, (current) => ({
          comments: [...(current.comments || []), newComment],
        }));
      }
    } catch (err) {
      console.error("Failed to add comment:", err.message);
      onNotice(err.message || "Failed to add comment.");
    }
  };

  return (
    <article className="community-post" id={postId}>
      <header>
        <span className="community-avatar">{post.initials || "FF"}</span>
        <div>
          <strong>{post.name || "Community Member"}</strong>
          <small>{post.time || "Recently"}</small>
        </div>
        <div className="post-menu" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Post options"
          >
            •••
          </button>
          {menuOpen && (
            <div>
              <button
                type="button"
                onClick={() => {
                  handleToggleSave();
                  setMenuOpen(false);
                }}
              >
                {saved ? "Unsave Post" : "Save Post"}
              </button>
              <button
                type="button"
                onClick={() => {
                  share();
                  setMenuOpen(false);
                }}
              >
                Copy Link
              </button>
              <button
                type="button"
                className="delete-post-btn"
                onClick={() => {
                  setMenuOpen(false);
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete Post"}
              </button>
            </div>
          )}
        </div>
      </header>
      <p className="post-text">{post.text}</p>
      {post.recipeLink && (
        <a
          className="recipe-link"
          href={post.recipeLink}
          target="_blank"
          rel="noreferrer"
        >
          View shared recipe ↗
        </a>
      )}
      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {post.image && (
        <button
          className={`post-image ${photoOpen ? "open" : ""}`}
          onClick={() => setPhotoOpen(!photoOpen)}
          aria-label={`${photoOpen ? "Close" : "Expand"} photo shared by ${post.name || "member"}`}
          aria-pressed={photoOpen}
        >
          <img src={post.image} alt={`Shared by ${post.name || "member"}`} />
          <span>{photoOpen ? "− Close photo" : "⌕ Expand photo"}</span>
        </button>
      )}
      <div className="post-actions">
        <button className={post.liked ? "liked" : ""} onClick={handleLike}>
          {post.liked ? "♥" : "♡"} {post.likes || 0}
        </button>
        <button onClick={() => setCommentsOpen(!commentsOpen)}>
          ▢ {post.comments?.length || 0}
        </button>
        <button onClick={share}>⌯ Share</button>
        <button className={saved ? "saved" : ""} onClick={handleToggleSave}>
          {saved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
      {commentsOpen && (
        <div className="comments">
          <form onSubmit={addComment}>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit">Send</button>
          </form>
          {(post.comments || []).map((item) => (
            <p key={item.id || item._id}>
              <strong>{item.name || "Chef"}</strong> {item.text}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

export default Community;
