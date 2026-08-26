import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { dishes } from "../data/dishes";
import "./Saved.css";

const byMinutes = (time) => parseInt(time) || 0;

function Saved({ saved, onToggleSave, onSetSaved, navigate }) {
  const [tab, setTab] = useState("recipes");
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState("recent");
  const [notice, setNotice] = useState("");
  const lastRemoved = useRef(null);
  const clearedBackup = useRef(null);
  const lastRemovedPost = useRef(null);
  const [posts, setPosts] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("flavor-fusion-community-posts")) || []
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "flavor-fusion-community-posts",
      JSON.stringify(posts),
    );
  }, [posts]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const savedRecipes = useMemo(
    () =>
      saved
        .map((name) => dishes.find((dish) => dish.name === name))
        .filter(Boolean),
    [saved],
  );
  const cuisines = useMemo(
    () => ["All", ...new Set(savedRecipes.map((dish) => dish.cuisine))],
    [savedRecipes],
  );
  const savedPosts = useMemo(() => posts.filter((post) => post.saved), [posts]);

  const visible = useMemo(() => {
    let list = [...savedRecipes];
    if (cuisine !== "All")
      list = list.filter((dish) => dish.cuisine === cuisine);
    const term = query.trim().toLowerCase();
    if (term)
      list = list.filter(
        (dish) =>
          dish.name.toLowerCase().includes(term) ||
          dish.cuisine.toLowerCase().includes(term) ||
          dish.required.some((item) => item.toLowerCase().includes(term)),
      );
    if (sort === "recent") list.reverse();
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "time")
      list.sort((a, b) => byMinutes(a.time) - byMinutes(b.time));
    return list;
  }, [savedRecipes, cuisine, query, sort]);

  const stats = useMemo(
    () => ({
      total: savedRecipes.length,
      posts: savedPosts.length,
      cuisines: new Set(savedRecipes.map((dish) => dish.cuisine)).size,
      quickest: savedRecipes.length
        ? Math.min(...savedRecipes.map((dish) => byMinutes(dish.time)))
        : 0,
      ingredients: new Set(savedRecipes.flatMap((dish) => dish.required)).size,
    }),
    [savedRecipes, savedPosts],
  );

  const removeRecipe = (name) => {
    lastRemoved.current = { name };
    onToggleSave(name);
    setNotice(`Removed “${name}” from your collection.`);
  };

  const undoRemove = () => {
    if (!lastRemoved.current) return;
    onSetSaved((current) =>
      current.includes(lastRemoved.current.name)
        ? current
        : [...current, lastRemoved.current.name],
    );
    setNotice("Restored to your collection.");
    lastRemoved.current = null;
  };

  const clearAll = () => {
    if (!saved.length) return;
    const backup = saved;
    lastRemoved.current = null;
    onSetSaved([]);
    clearedBackup.current = backup;
    setNotice(
      `Cleared ${backup.length} recipe${backup.length === 1 ? "" : "s"} from your collection.`,
    );
  };

  const undoClear = () => {
    if (clearedBackup.current?.length) {
      onSetSaved(clearedBackup.current);
      clearedBackup.current = null;
      setNotice("Collection restored.");
    }
  };

  const unsavePost = (id) => {
    lastRemovedPost.current = id;
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, saved: false } : post,
      ),
    );
    setNotice("Removed post from your collection.");
  };

  const undoUnsavePost = () => {
    if (!lastRemovedPost.current) return;
    const id = lastRemovedPost.current;
    setPosts((current) =>
      current.map((post) => (post.id === id ? { ...post, saved: true } : post)),
    );
    setNotice("Restored to your collection.");
    lastRemovedPost.current = null;
  };

  return (
    <div className="app">
      <Header
        activePage="saved"
        onExplore={() => navigate("explore")}
        onHome={() => navigate("home")}
        onCommunity={() => navigate("community")}
        onSignIn={() => navigate("signin")}
        onSaved={() => window.scrollTo(0, 0)}
      />
      <main className="container saved-page">
        <section className="saved-hero">
          <div>
            <span className="label">YOUR COLLECTION</span>
            <h1>Your saved collection</h1>
            <p>
              Your personal cookbook of dishes and community posts worth coming
              back to. Save recipes from Explore and posts from Community — they
              all live here.
            </p>
          </div>
          <div className="saved-stats" aria-label="Collection statistics">
            <div className="stat">
              <strong>{stats.total}</strong>
              <small>recipe{stats.total === 1 ? "" : "s"} saved</small>
            </div>
            <div className="stat">
              <strong>{stats.posts}</strong>
              <small>post{stats.posts === 1 ? "" : "s"} saved</small>
            </div>
            <div className="stat">
              <strong>{stats.cuisines}</strong>
              <small>cuisine{stats.cuisines === 1 ? "" : "s"}</small>
            </div>
            <div className="stat">
              <strong>{stats.quickest || "–"}</strong>
              <small>min fastest cook</small>
            </div>
          </div>
        </section>

        <div className="saved-tabs" role="tablist" aria-label="Collection type">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "recipes"}
            className={tab === "recipes" ? "active" : ""}
            onClick={() => setTab("recipes")}
          >
            ★ Recipes <b>{savedRecipes.length}</b>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "posts"}
            className={tab === "posts" ? "active" : ""}
            onClick={() => setTab("posts")}
          >
            ▣ Community posts <b>{savedPosts.length}</b>
          </button>
        </div>

        {notice && (
          <div className="saved-notice" role="status">
            <span>{notice}</span>
            {(lastRemoved.current ||
              clearedBackup.current ||
              lastRemovedPost.current) && (
              <button
                type="button"
                onClick={
                  lastRemoved.current
                    ? undoRemove
                    : lastRemovedPost.current
                      ? undoUnsavePost
                      : undoClear
                }
              >
                Undo
              </button>
            )}
          </div>
        )}

        {tab === "recipes" && savedRecipes.length > 0 && (
          <div className="saved-toolbar">
            <div className="saved-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your saved recipes..."
                aria-label="Search saved recipes"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <div
              className="cuisine-pills"
              role="group"
              aria-label="Filter by cuisine"
            >
              {cuisines.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={cuisine === item ? "pill active" : "pill"}
                  onClick={() => setCuisine(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="sort-select">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort saved recipes"
              >
                <option value="recent">Recently saved</option>
                <option value="time">Quickest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
            <button type="button" className="clear-button" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        {tab === "recipes" &&
          (visible.length ? (
            <div className="saved-grid">
              {visible.map((dish, index) => (
                <article
                  className="saved-card"
                  key={dish.name}
                  style={{ animationDelay: `${Math.min(index * 0.07, 0.5)}s` }}
                >
                  <div className="saved-image">
                    <img src={dish.image} alt={dish.name} loading="lazy" />
                    <button
                      type="button"
                      className="unsave-button"
                      onClick={() => removeRecipe(dish.name)}
                      aria-label={`Remove ${dish.name} from saved`}
                      title="Remove from saved"
                    >
                      ★ Remove
                    </button>
                    <span className="saved-time">◷ {dish.time}</span>
                  </div>
                  <div className="saved-content">
                    <span className="cuisine-tag">{dish.cuisine}</span>
                    <h3>{dish.name}</h3>
                    <p className="saved-meta">
                      ◒ {dish.level}
                      <i />
                      {dish.required.length} ingredients
                    </p>
                    <div className="saved-ingredients">
                      {dish.required.slice(0, 3).map((item) => (
                        <em key={item}>{item}</em>
                      ))}
                      {dish.required.length > 3 && (
                        <em className="more">
                          +{dish.required.length - 3} more
                        </em>
                      )}
                    </div>
                    <button
                      type="button"
                      className="cook-button"
                      onClick={() => navigate("explore")}
                    >
                      Cook it now →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : savedRecipes.length ? (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No matches in your collection</h3>
              <p>Try a different search term or cuisine filter.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCuisine("All");
                }}
              >
                Reset filters
              </button>
            </div>
          ) : null)}

        {tab === "recipes" && !savedRecipes.length && (
          <div className="empty-state">
            <span>☆</span>
            <h3>Nothing saved yet</h3>
            <p>
              Tap the ★ on any recipe in Explore, or ☆ Save a post in Community,
              and it will live here.
            </p>
            <button type="button" onClick={() => navigate("explore")}>
              Browse recipes →
            </button>
          </div>
        )}

        {tab === "posts" &&
          (savedPosts.length ? (
            <div className="saved-grid posts">
              {savedPosts.map((post, index) => (
                <article
                  className="post-card"
                  key={post.id}
                  style={{ animationDelay: `${Math.min(index * 0.07, 0.5)}s` }}
                >
                  <header>
                    <span className="post-avatar">{post.initials}</span>
                    <div className="post-id">
                      <strong>{post.name}</strong>
                      <small>{post.time}</small>
                    </div>
                    <button
                      type="button"
                      className="unsave-post"
                      onClick={() => unsavePost(post.id)}
                      title="Remove from saved"
                    >
                      ★ Remove
                    </button>
                  </header>
                  <p className="post-text-preview">{post.text}</p>
                  {post.image && (
                    <img
                      className="post-thumb"
                      src={post.image}
                      alt={`Shared by ${post.name}`}
                      loading="lazy"
                    />
                  )}
                  {post.recipeLink && (
                    <a
                      className="post-link"
                      href={post.recipeLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View shared recipe ↗
                    </a>
                  )}
                  {post.tags?.length > 0 && (
                    <div className="post-chips">
                      {post.tags.map((item) => (
                        <em key={item}>{item}</em>
                      ))}
                    </div>
                  )}
                  <footer>
                    <span>
                      ♥ {post.likes ?? 0}
                      <i />▢ {post.comments?.length ?? 0}
                    </span>
                    <button type="button" onClick={() => navigate("community")}>
                      Open in Community →
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>▣</span>
              <h3>No saved posts yet</h3>
              <p>
                Tap ☆ Save on any community post to keep it in your collection.
              </p>
              <button type="button" onClick={() => navigate("community")}>
                Browse Community →
              </button>
            </div>
          ))}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default Saved;
