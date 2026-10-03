import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "./Saved.css";

const byMinutes = (time) => parseInt(time, 10) || 0;

function Saved({
  saved = [],
  onToggleSave,
  onSetSaved,
  navigate,
  isLoggedIn,
  onLogout,
}) {
  const [tab, setTab] = useState("recipes");
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState("recent");
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState(null);

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");

  const savedRecipes = saved;

  // Fetch saved community posts from backend API
  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;
    const fetchSavedPosts = async () => {
      try {
        setLoadingPosts(true);
        setError("");
        const res = await api("/saved");
        if (isMounted) {
          if (res && Array.isArray(res.posts)) {
            setSavedPosts(res.posts);
          } else if (res && Array.isArray(res.data?.posts)) {
            setSavedPosts(res.data.posts);
          }
        }
      } catch (err) {
        console.error("Failed to load saved posts:", err.message);
        if (isMounted) {
          setError(err.message || "Failed to load saved posts.");
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    };

    fetchSavedPosts();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice("");
      setUndo(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const cuisines = useMemo(
    () => [
      "All",
      ...new Set(
        savedRecipes
          .map((dish) => dish.cuisine)
          .filter((c) => Boolean(c) && c !== "General")
      ),
    ],
    [savedRecipes]
  );

  const visible = useMemo(() => {
    let list = [...savedRecipes];
    if (cuisine !== "All") {
      list = list.filter((dish) => dish.cuisine === cuisine);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter((dish) => {
        const name = (dish.name || dish.recipeName || "").toLowerCase();
        const cuis = (dish.cuisine || "").toLowerCase();
        const reqs = Array.isArray(dish.required)
          ? dish.required
          : Array.isArray(dish.ingredients)
            ? dish.ingredients.map((i) => (typeof i === "string" ? i : i.name))
            : [];
        return (
          name.includes(term) ||
          cuis.includes(term) ||
          reqs.some((item) => String(item).toLowerCase().includes(term))
        );
      });
    }
    if (sort === "name") {
      list.sort((a, b) =>
        (a.name || a.recipeName || "").localeCompare(b.name || b.recipeName || "")
      );
    } else if (sort === "time") {
      list.sort(
        (a, b) =>
          byMinutes(a.time || a.cookingTime) -
          byMinutes(b.time || b.cookingTime)
      );
    }
    return list;
  }, [savedRecipes, cuisine, query, sort]);

  const stats = useMemo(() => {
    const validTimes = savedRecipes
      .map((d) => byMinutes(d.time || d.cookingTime))
      .filter((t) => t > 0);

    return {
      total: savedRecipes.length,
      posts: savedPosts.length,
      cuisines: new Set(
        savedRecipes.map((dish) => dish.cuisine).filter(Boolean)
      ).size,
      quickest: validTimes.length ? Math.min(...validTimes) : 0,
    };
  }, [savedRecipes, savedPosts]);

  const removeRecipe = async (dish) => {
    setUndo({ type: "recipe", item: dish });
    if (onToggleSave) {
      onToggleSave(dish);
    }
    setNotice(
      `Removed “${dish.name || dish.recipeName}” from your collection.`
    );
  };

  const unsavePost = async (post) => {
    const postId = post.id || post._id;
    setUndo({ type: "post", item: post });
    setSavedPosts((curr) => curr.filter((p) => (p.id || p._id) !== postId));
    setNotice("Removed post from your collection.");

    try {
      await api(`/saved/${postId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to unsave post:", err.message);
      setNotice(err.message || "Failed to unsave post.");
    }
  };

  const clearAllRecipes = async () => {
    if (!savedRecipes.length) return;
    const backup = [...savedRecipes];
    if (onSetSaved) {
      onSetSaved([]);
    }
    setUndo({ type: "clear", items: backup });
    setNotice(
      `Cleared ${backup.length} recipe${backup.length === 1 ? "" : "s"} from your collection.`
    );

    for (const r of backup) {
      const idOrName = r._id || r.recipeId || r.name || r.recipeName;
      try {
        await api(`/saved/${encodeURIComponent(idOrName)}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn(`Could not delete recipe ${idOrName}:`, err.message);
      }
    }
  };

  const undoLastChange = async () => {
    if (!undo) return;

    if (undo.type === "recipe" && undo.item) {
      const item = undo.item;
      if (onToggleSave) {
        onToggleSave(item);
      }
    } else if (undo.type === "clear" && undo.items) {
      if (onSetSaved) {
        onSetSaved(undo.items);
      }
      for (const item of undo.items) {
        try {
          await api("/saved", {
            method: "POST",
            body: JSON.stringify(item),
          });
        } catch (err) {
          console.warn("Could not re-save item on undo:", err.message);
        }
      }
    } else if (undo.type === "post" && undo.item) {
      const item = undo.item;
      setSavedPosts((curr) => [item, ...curr]);
      try {
        await api("/saved", {
          method: "POST",
          body: JSON.stringify({ type: "post", postId: item.id || item._id }),
        });
      } catch (err) {
        console.warn("Could not re-save post on undo:", err.message);
      }
    }

    setNotice("Restored to your collection.");
    setUndo(null);
  };

  return (
    <div className="app">
      <Header
        activePage="saved"
        onExplore={() => navigate("explore")}
        onHome={() => navigate("home")}
        onCommunity={() => navigate("community")}
        onSignIn={() => navigate("login")}
        onSaved={() => window.scrollTo(0, 0)}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
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
            {undo && (
              <button type="button" onClick={undoLastChange}>
                Undo
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
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
            {cuisines.length > 1 && (
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
            )}
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
            <button
              type="button"
              className="clear-button"
              onClick={clearAllRecipes}
            >
              Clear all
            </button>
          </div>
        )}

        {tab === "recipes" &&
          (visible.length ? (
            <div className="saved-grid">
              {visible.map((dish, index) => {
                const dishName = dish.name || dish.recipeName;
                const dishTime = dish.time || dish.cookingTime || "30 min";
                const dishLevel = dish.level || dish.difficulty || "Easy";
                const dishCuisine = dish.cuisine || "General";
                const dishReqs =
                  Array.isArray(dish.required) && dish.required.length > 0
                    ? dish.required
                    : Array.isArray(dish.ingredients)
                      ? dish.ingredients.map((i) =>
                          typeof i === "string" ? i : i.name
                        )
                      : [];

                return (
                  <article
                    className="saved-card"
                    key={dish._id || dish.id || dishName}
                    style={{
                      animationDelay: `${Math.min(index * 0.07, 0.5)}s`,
                    }}
                  >
                    <div className="saved-image">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dishName}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 180,
                            background: "var(--color-surface, #f5f5f5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 36,
                          }}
                        >
                          🍲
                        </div>
                      )}
                      <button
                        type="button"
                        className="unsave-button"
                        onClick={() => removeRecipe(dish)}
                        aria-label={`Remove ${dishName} from saved`}
                        title="Remove from saved"
                      >
                        ★ Remove
                      </button>
                      <span className="saved-time">◷ {dishTime}</span>
                    </div>
                    <div className="saved-content">
                      <span className="cuisine-tag">{dishCuisine}</span>
                      <h3>{dishName}</h3>
                      <p className="saved-meta">
                        ◒ {dishLevel}
                        <i />
                        {dishReqs.length} ingredients
                      </p>
                      {dishReqs.length > 0 && (
                        <div className="saved-ingredients">
                          {dishReqs.slice(0, 3).map((item) => (
                            <em key={item}>{item}</em>
                          ))}
                          {dishReqs.length > 3 && (
                            <em className="more">
                              +{dishReqs.length - 3} more
                            </em>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        className="cook-button"
                        onClick={() => navigate("explore")}
                      >
                        Cook it now →
                      </button>
                    </div>
                  </article>
                );
              })}
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
          (loadingPosts ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="ai-spinner"></div>
              <h3>Loading saved posts...</h3>
            </div>
          ) : savedPosts.length ? (
            <div className="saved-grid posts">
              {savedPosts.map((post, index) => (
                <article
                  className="post-card"
                  key={post.id || post._id}
                  style={{
                    animationDelay: `${Math.min(index * 0.07, 0.5)}s`,
                  }}
                >
                  <header>
                    <span className="post-avatar">
                      {post.initials || "FF"}
                    </span>
                    <div className="post-id">
                      <strong>{post.name || "Chef"}</strong>
                      <small>{post.time || "Recently"}</small>
                    </div>
                    <button
                      type="button"
                      className="unsave-post"
                      onClick={() => unsavePost(post)}
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
                    <button
                      type="button"
                      onClick={() => navigate("community")}
                    >
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
