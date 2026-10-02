import { useEffect, useState } from "react";
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

  // Fetch real posts from backend API
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
          } else if (Array.isArray(res)) {
            setPosts(res);
          } else {
            setPosts([]);
          }
        }
      } catch (err) {
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
        post.id === id ? { ...post, ...change(post) } : post,
      ),
    );

  const createPost = async (event) => {
    event.preventDefault();
    if (!draft.trim() && !photo) return;

    if (!isLoggedIn) {
      setNotice("Please log in to share a recipe with the community.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          text: draft.trim(),
          image: photo,
          recipeLink: recipeLink.trim(),
        }),
      });

      if (res && res.post) {
        setPosts((current) => [res.post, ...current]);
        setDraft("");
        setPhoto("");
        setRecipeLink("");
        setNotice("Your post is live!");
      }
    } catch (err) {
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

          {/* Loading State */}
          {loading && (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="ai-spinner"></div>
              <h3>Loading community posts...</h3>
              <p>Gathering fresh culinary creations from our chefs</p>
            </div>
          )}

          {/* Empty State */}
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

          {/* Real Posts */}
          {!loading &&
            posts.map((post) => (
              <CommunityPost
                key={post.id || post._id}
                post={post}
                onUpdate={updatePost}
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

function CommunityPost({ post, onUpdate, onNotice, isLoggedIn, onSignIn }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const saved = Boolean(post.saved);

  const share = async () => {
    const url = `${window.location.origin}/community#${post.id || post._id}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "Flavor Fusion community post",
          text: post.text,
          url,
        });
      else {
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
    // Optimistic update
    const previousLiked = post.liked;
    const previousLikes = post.likes || 0;
    onUpdate(post.id || post._id, () => ({
      liked: !previousLiked,
      likes: previousLikes + (previousLiked ? -1 : 1),
    }));

    try {
      const res = await api(`/posts/${post.id || post._id}/like`, {
        method: "POST",
      });
      if (res && res.success) {
        onUpdate(post.id || post._id, () => ({
          liked: res.liked,
          likes: res.likes,
        }));
      }
    } catch {
      // Revert on error
      onUpdate(post.id || post._id, () => ({
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
    onUpdate(post.id || post._id, () => ({ saved: !previousSaved }));
    onNotice(!previousSaved ? "Post saved to your collection." : "Post removed from saved.");

    try {
      const res = await api(`/posts/${post.id || post._id}/save`, {
        method: "POST",
      });
      if (res && res.success) {
        onUpdate(post.id || post._id, () => ({ saved: res.saved }));
      }
    } catch {
      onUpdate(post.id || post._id, () => ({ saved: previousSaved }));
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
      const res = await api(`/posts/${post.id || post._id}/comment`, {
        method: "POST",
        body: JSON.stringify({ text: textToSubmit }),
      });

      if (res && res.comment) {
        onUpdate(post.id || post._id, (current) => ({
          comments: [...(current.comments || []), res.comment],
        }));
      }
    } catch (err) {
      onNotice(err.message || "Failed to add comment");
    }
  };

  return (
    <article className="community-post" id={post.id || post._id}>
      <header>
        <span className="community-avatar">{post.initials || "FF"}</span>
        <div>
          <strong>{post.name}</strong>
          <small>{post.time || "Recently"}</small>
        </div>
        <div className="post-menu">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Post options"
          >
            •••
          </button>
          {menuOpen && (
            <div>
              <button
                onClick={() => {
                  handleToggleSave();
                  setMenuOpen(false);
                }}
              >
                {saved ? "Unsave Post" : "Save Post"}
              </button>
              <button
                onClick={() => {
                  share();
                  setMenuOpen(false);
                }}
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNotice("Thanks — the post has been reported for review.");
                }}
              >
                Report
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
          aria-label={`${photoOpen ? "Close" : "Expand"} photo shared by ${post.name}`}
          aria-pressed={photoOpen}
        >
          <img src={post.image} alt={`Shared by ${post.name}`} />
          <span>{photoOpen ? "− Close photo" : "⌕ Expand photo"}</span>
          {post.cooked && <b>● Cooked this!</b>}
        </button>
      )}
      <div className="post-actions">
        <button
          className={post.liked ? "liked" : ""}
          onClick={handleLike}
        >
          {post.liked ? "♥" : "♡"} {post.likes || 0}
        </button>
        <button onClick={() => setCommentsOpen(!commentsOpen)}>
          ▢ {post.comments?.length || 0}
        </button>
        <button onClick={share}>⌯ Share</button>
        <button
          className={saved ? "saved" : ""}
          onClick={handleToggleSave}
        >
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
            <button>Send</button>
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
