import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api, getStoredUser } from "../services/api";
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
  const [posts, setPosts] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("flavor-fusion-community-posts")) || []
      );
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState("");
  const [recipeLink, setRecipeLink] = useState("");
  const [notice, setNotice] = useState("");

  // Fetch real posts from backend API on mount
  useEffect(() => {
    let isMounted = true;

    api("/posts")
      .then((res) => {
        if (isMounted && res && res.data) {
          setPosts(res.data);
          try {
            localStorage.setItem(
              "flavor-fusion-community-posts",
              JSON.stringify(res.data)
            );
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote community posts:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "flavor-fusion-community-posts",
        JSON.stringify(posts)
      );
    } catch {
      // Ignore storage errors
    }
  }, [posts]);

  const updatePost = (id, change) =>
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, ...change(post) } : post
      )
    );

  const createPost = async (event) => {
    event.preventDefault();
    if (!draft.trim() && !photo) return;

    const payload = {
      text: draft.trim(),
      image: photo,
      recipeLink: recipeLink.trim(),
      tags: recipeLink ? ["Recipe link"] : [],
    };

    const user = getStoredUser();
    const fallbackName = user?.name || "You";
    const fallbackInitials = user?.name
      ? user.name.substring(0, 2).toUpperCase()
      : "YO";

    try {
      const res = await api("/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newPost =
        res && res.data
          ? res.data
          : {
              id: `post-${Date.now()}`,
              name: fallbackName,
              initials: fallbackInitials,
              time: "Just now",
              text: draft.trim() || "Shared a new culinary creation.",
              tags: recipeLink ? ["Recipe link"] : [],
              image: photo,
              likes: 0,
              comments: [],
              recipeLink,
            };

      setPosts((current) => [newPost, ...current]);
      setDraft("");
      setPhoto("");
      setRecipeLink("");
      setNotice("Your post is live!");
    } catch (err) {
      setNotice(err.message || "Failed to publish post.");
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
              <span className="community-avatar you">YO</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What's cooking today? Share your culinary creation..."
                aria-label="Post text"
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
                <input type="file" accept="image/*" onChange={onPhoto} />
              </label>
              <input
                value={recipeLink}
                onChange={(event) => setRecipeLink(event.target.value)}
                placeholder="🔗 Recipe link (optional)"
                aria-label="Recipe link"
              />
              <button type="submit">Post</button>
            </div>
          </form>
          {notice && (
            <p className="community-notice" role="status">
              {notice}
            </p>
          )}

          {loading && posts.length === 0 && (
            <div className="community-loading" style={{ textAlign: "center", padding: "30px" }}>
              <p>Loading community posts...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div
              className="empty-community-state"
              style={{
                textAlign: "center",
                padding: "48px 24px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                border: "1px dashed rgba(255,255,255,0.15)",
                margin: "24px 0",
              }}
            >
              <span style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }}>🍳</span>
              <h3 style={{ margin: "0 0 8px 0" }}>No community posts yet</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", margin: 0 }}>
                Be the first cook to share a dish, recipe link, or kitchen creation above!
              </p>
            </div>
          )}

          {posts.map((post) => (
            <CommunityPost
              key={post.id || post._id}
              post={post}
              onUpdate={updatePost}
              onNotice={setNotice}
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

function CommunityPost({ post, onUpdate, onNotice }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const saved = Boolean(post.saved);

  const share = async () => {
    const url = `${window.location.origin}/community#${post.id}`;
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

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    const commentText = comment.trim();
    setComment("");

    try {
      const res = await api(`/posts/${post.id || post._id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText }),
      });

      const newComment = res?.data || {
        id: `comment-${Date.now()}`,
        name: "You",
        text: commentText,
      };

      onUpdate(post.id || post._id, (current) => ({
        comments: [...(current.comments || []), newComment],
      }));
    } catch {
      onUpdate(post.id || post._id, (current) => ({
        comments: [
          ...(current.comments || []),
          { id: `comment-${Date.now()}`, name: "You", text: commentText },
        ],
      }));
    }
  };

  const handleLike = async () => {
    const newLiked = !post.liked;
    onUpdate(post.id || post._id, (current) => ({
      liked: newLiked,
      likes: Math.max(0, (current.likes || 0) + (newLiked ? 1 : -1)),
    }));

    try {
      await api(`/posts/${post.id || post._id}/like`, { method: "POST" });
    } catch {
      // Revert if error
    }
  };

  return (
    <article className="community-post" id={post.id || post._id}>
      <header>
        <span className="community-avatar">{post.initials || "CC"}</span>
        <div>
          <strong>{post.name || "Community Member"}</strong>
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
                  onUpdate(post.id || post._id, () => ({ saved: !saved }));
                  setMenuOpen(false);
                  onNotice(
                    saved ? "Post removed from saved items." : "Post saved."
                  );
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
          aria-label={`${photoOpen ? "Close" : "Expand"} photo shared by ${post.name || "member"}`}
          aria-pressed={photoOpen}
        >
          <img src={post.image} alt={`Shared by ${post.name || "member"}`} />
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
          ▢ {post.comments ? post.comments.length : 0}
        </button>
        <button onClick={share}>⌯ Share</button>
        <button
          className={saved ? "saved" : ""}
          onClick={() => {
            onUpdate(post.id || post._id, () => ({ saved: !saved }));
            onNotice(saved ? "Post removed from saved items." : "Post saved.");
          }}
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
            <button type="submit">Send</button>
          </form>
          {post.comments &&
            post.comments.map((item) => (
              <p key={item.id || item._id}>
                <strong>{item.name || "You"}</strong> {item.text}
              </p>
            ))}
        </div>
      )}
    </article>
  );
}

export default Community;
