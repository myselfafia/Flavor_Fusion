import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { communityPosts } from "../data/communityPosts";
import "./Community.css";

function Community({ onHome, onExplore, onCommunity, onSignIn, navigate, isLoggedIn, onLogout }) {
  const [posts, setPosts] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("flavor-fusion-community-posts")) ||
        communityPosts
      );
    } catch {
      return communityPosts;
    }
  });
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState("");
  const [recipeLink, setRecipeLink] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    localStorage.setItem(
      "flavor-fusion-community-posts",
      JSON.stringify(posts),
    );
  }, [posts]);
  const updatePost = (id, change) =>
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, ...change(post) } : post,
      ),
    );
  const createPost = (event) => {
    event.preventDefault();
    if (!draft.trim() && !photo) return;
    setPosts((current) => [
      {
        id: `post-${Date.now()}`,
        name: "You",
        initials: "YO",
        time: "Just now",
        text: draft.trim() || "Shared a new culinary creation.",
        tags: recipeLink ? ["Recipe link"] : [],
        image: photo,
        likes: 0,
        comments: [],
        recipeLink,
      },
      ...current,
    ]);
    setDraft("");
    setPhoto("");
    setRecipeLink("");
    setNotice("Your post is live!");
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
          {posts.map((post) => (
            <CommunityPost
              key={post.id}
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
  const addComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    onUpdate(post.id, (current) => ({
      comments: [...current.comments, { id: Date.now(), text: comment.trim() }],
    }));
    setComment("");
  };
  return (
    <article className="community-post" id={post.id}>
      <header>
        <span className="community-avatar">{post.initials}</span>
        <div>
          <strong>{post.name}</strong>
          <small>{post.time}</small>
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
                  onUpdate(post.id, () => ({ saved: !saved }));
                  setMenuOpen(false);
                  onNotice(
                    saved ? "Post removed from saved items." : "Post saved.",
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
          onClick={() =>
            onUpdate(post.id, (current) => ({
              liked: !current.liked,
              likes: current.likes + (current.liked ? -1 : 1),
            }))
          }
        >
          {post.liked ? "♥" : "♡"} {post.likes}
        </button>
        <button onClick={() => setCommentsOpen(!commentsOpen)}>
          ▢ {post.comments.length}
        </button>
        <button onClick={share}>⌯ Share</button>
        <button
          className={saved ? "saved" : ""}
          onClick={() => {
            onUpdate(post.id, () => ({ saved: !saved }));
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
            <button>Send</button>
          </form>
          {post.comments.map((item) => (
            <p key={item.id}>
              <strong>You</strong> {item.text}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

export default Community;
