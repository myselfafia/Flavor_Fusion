import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "./Explore.css";

const POPULAR_STAPLES = [
  { name: "Olive Oil", icon: "🫒" },
  { name: "Garlic", icon: "🧄" },
  { name: "Eggs", icon: "🥚" },
  { name: "Onion", icon: "🧅" },
  { name: "Butter", icon: "🧈" },
  { name: "Rice", icon: "🍚" },
  { name: "Pasta", icon: "🍝" },
  { name: "Tomato", icon: "🍅" },
];

function Explore({ saved, onToggleSave, navigate, isLoggedIn, onLogout }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchedPrompt, setSearchedPrompt] = useState("");
  const [aiRecipes, setAiRecipes] = useState(null);
  const [adviceData, setAdviceData] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Load recents from localStorage
  const [recents, setRecents] = useState(() => {
    try {
      const stored = localStorage.getItem("flavor-fusion-recents");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("flavor-fusion-recents", JSON.stringify(recents));
    } catch {
      // Ignore storage errors
    }
  }, [recents]);

  const handleSearch = async (promptOverride) => {
    const promptToSearch = (promptOverride || query || "").trim();
    if (!promptToSearch) {
      setErrorMessage("Please enter some ingredients or what you'd like to cook.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSearchedPrompt(promptToSearch);
    setSelectedRecipe(null);

    try {
      const res = await api("/ai/recipe", {
        method: "POST",
        body: JSON.stringify({ prompt: promptToSearch }),
      });

      if (res && res.success && res.data) {
        if (res.data.type === "recipes" && Array.isArray(res.data.recipes)) {
          setAiRecipes(res.data.recipes);
          setAdviceData(null);

          // Save to Recents
          const newRecentItems = res.data.recipes.map((r) => ({
            ...r,
            prompt: promptToSearch,
            searchedAt: new Date().toISOString(),
          }));

          setRecents((prev) => {
            // Keep unique by recipeName and cap at 15 items
            const filtered = prev.filter(
              (item) => !newRecentItems.some((n) => n.recipeName.toLowerCase() === item.recipeName.toLowerCase())
            );
            return [...newRecentItems, ...filtered].slice(0, 15);
          });
        } else if (res.data.type === "advice") {
          setAdviceData(res.data);
          setAiRecipes(null);
        } else {
          setAiRecipes([]);
          setAdviceData(null);
        }
      } else {
        setErrorMessage(res?.error || "Could not generate recipes. Please try again.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to reach AI recipe service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStapleActive = (name) => {
    if (!query) return false;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(query);
  };

  const handleToggleStaple = (name) => {
    setErrorMessage("");
    if (isStapleActive(name)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|,\\s*)?${escaped}(\\s*,|$)`, "gi");
      let updated = query.replace(regex, (match, p1, p2) => {
        if (p1 && p1.includes(",") && p2 && p2.includes(",")) return ", ";
        return "";
      }).trim();
      updated = updated.replace(/\s*,\s*,/g, ", ").replace(/^[\s,]+|[\s,]+$/g, "").trim();
      setQuery(updated);
    } else {
      const trimmed = query.trim();
      if (!trimmed) {
        setQuery(name);
      } else {
        setQuery(`${trimmed}, ${name}`);
      }
    }
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setTimeout(() => {
      const el = document.getElementById("recipe-detail-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const clearRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem("flavor-fusion-recents");
    } catch {
      // Ignore
    }
  };

  return (
    <div className="app">
      <Header
        activePage="explore"
        onExplore={() => navigate("explore")}
        onHome={() => navigate("home")}
        onCommunity={() => navigate("community")}
        onSignIn={() => navigate("login")}
        onSaved={() => navigate("saved")}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />

      <main className="container dashboard">
        {/* UNIFIED HERO CARD */}
        <section className="explore-hero">
          <div className="explore-hero-card">
            <span className="label">✦ AI RECIPE ASSISTANT</span>
            <h1>What&apos;s in your kitchen?</h1>
            <p>
              Enter any ingredients you have on hand or describe what you want to cook. Our AI assistant will create tailored recipes for you.
            </p>

            <div className="ingredient-input-wrap">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setErrorMessage("");
                }}
                onKeyDown={(event) => event.key === "Enter" && !loading && handleSearch()}
                placeholder="Enter ingredients (e.g., chicken, rice, onion, garlic, egg)..."
                aria-label="Enter ingredients or recipe prompt"
                disabled={loading}
              />
              {query && (
                <button
                  type="button"
                  className="clear-input-btn"
                  onClick={() => {
                    setQuery("");
                    setErrorMessage("");
                  }}
                  aria-label="Clear input"
                  title="Clear input"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                className="go-btn"
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
              >
                {loading ? "Searching..." : "Go"}
              </button>
            </div>

            {errorMessage && (
              <div className="error-banner" role="alert">
                <span className="error-icon">⚠️</span>
                <div className="error-content">
                  <strong>{errorMessage}</strong>
                  {errorMessage.toLowerCase().includes("gemini api key") && (
                    <div className="api-setup-help">
                      <p>To connect the Google Gemini Free API:</p>
                      <ol>
                        <li>
                          Get your free key at{" "}
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Google AI Studio ↗
                          </a>{" "}
                          (100% free, no credit card required).
                        </li>
                        <li>
                          Open <code>backend/.env</code> in your editor.
                        </li>
                        <li>
                          Set <code>GEMINI_API_KEY=your_key_here</code> and save.
                        </li>
                        <li>Click <strong>Go</strong> again!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QUICK STAPLES ROW */}
            <div className="staples-toolbar">
              <span className="toolbar-label">Quick Staples:</span>
              <div className="staple-chips-group">
                {POPULAR_STAPLES.map(({ name, icon }) => {
                  const active = isStapleActive(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`staple-chip ${active ? "active" : ""}`}
                      onClick={() => handleToggleStaple(name)}
                      title={active ? `Remove ${name}` : `Add ${name} to search`}
                    >
                      <span className="staple-icon">{active ? "✓" : icon}</span>
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* LOADING STATE */}
        {loading && (
          <section className="ai-loading-state" aria-live="polite">
            <div className="ai-spinner"></div>
            <h3>Consulting Flavor Fusion AI Chef...</h3>
            <p>Crafting delicious recipe matches with your ingredients</p>
          </section>
        )}

        {/* RECIPE DETAIL VIEW (User will customize later) */}
        {selectedRecipe && !loading && (
          <section id="recipe-detail-section" className="recipe-detail-card" aria-label="Recipe details">
            <div className="recipe-detail-header">
              <div>
                <span className="cuisine-badge">{selectedRecipe.cuisine}</span>
                <h2>{selectedRecipe.recipeName}</h2>
                <div className="recipe-meta-row">
                  <span>◷ {selectedRecipe.cookingTime}</span>
                  <span>◒ {selectedRecipe.difficulty}</span>
                </div>
              </div>
              <div className="detail-actions">
                {onToggleSave && (
                  <button
                    type="button"
                    className={`save-detail-btn ${saved?.includes(selectedRecipe.recipeName) ? "saved" : ""}`}
                    onClick={() => onToggleSave(selectedRecipe.recipeName)}
                  >
                    {saved?.includes(selectedRecipe.recipeName) ? "★ Saved" : "☆ Save Recipe"}
                  </button>
                )}
                <button
                  type="button"
                  className="close-detail-btn"
                  onClick={() => setSelectedRecipe(null)}
                  aria-label="Close recipe details"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {selectedRecipe.image && (
              <div className="recipe-detail-image-banner">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.recipeName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <p className="recipe-description">{selectedRecipe.description}</p>

            <div className="recipe-detail-grid">
              <div className="recipe-ingredients-block">
                <h3>Ingredients</h3>
                <ul>
                  {selectedRecipe.ingredients?.map((ing, idx) => (
                    <li key={idx}>
                      <span className="ing-qty">{ing.quantity}</span>
                      <span className="ing-name">{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recipe-steps-block">
                <h3>Cooking Instructions</h3>
                <ol>
                  {selectedRecipe.steps?.map((step, idx) => (
                    <li key={idx}>
                      <span className="step-num">{(idx + 1).toString().padStart(2, "0")}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {selectedRecipe.tips?.length > 0 && (
              <div className="recipe-tips-block">
                <strong>💡 Chef&apos;s Tips:</strong>
                <ul>
                  {selectedRecipe.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* GENERAL ADVICE STATE */}
        {adviceData && !loading && (
          <section className="advice-section">
            <div className="advice-card">
              <span className="label">💡 CULINARY ADVICE</span>
              <h2>{adviceData.title || "Cooking Guidance"}</h2>
              <div className="advice-text">{adviceData.answer}</div>
              {adviceData.tips?.length > 0 && (
                <div className="recipe-tips-block" style={{ marginTop: 20 }}>
                  <strong>💡 Chef&apos;s Tips:</strong>
                  <ul>
                    {adviceData.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* NO MATCHES FOUND STATE */}
        {aiRecipes && aiRecipes.length === 0 && !loading && (
          <section className="no-matches-section" aria-live="polite">
            <div className="no-matches-card">
              <div className="no-matches-icon">🍽️</div>
              <h2>No recipe matches found</h2>
              <p>
                We couldn&apos;t find any recipes for <strong>&ldquo;{searchedPrompt}&rdquo;</strong>.
                Please try searching for recognizable cooking ingredients or a dish name.
              </p>
              <div className="no-matches-suggestions">
                <span className="suggestion-title">Try searching for:</span>
                <div className="suggestion-chips-row">
                  {["Potato", "Chicken", "Pasta", "Eggs", "Mango", "Rice", "Salmon"].map((staple) => (
                    <button
                      key={staple}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => {
                        setQuery(staple);
                        handleSearch(staple);
                      }}
                    >
                      + {staple}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEARCH RESULTS: MATCHING RECIPES */}
        {aiRecipes && aiRecipes.length > 0 && !loading && (
          <section className="matches-section">
            <div className="matches-heading">
              <div>
                <span className="label">AI RECIPE MATCHES</span>
                <h2>Top matches</h2>
                <p>Recipes created for: &ldquo;{searchedPrompt}&rdquo;</p>
              </div>
            </div>

            <div className="ai-recipes-grid">
              {aiRecipes.map((recipe) => (
                <article
                  key={recipe.id || recipe.recipeName}
                  className={`ai-recipe-card ${selectedRecipe?.recipeName === recipe.recipeName ? "selected" : ""}`}
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  {onToggleSave && (
                    <button
                      type="button"
                      className={`card-save-btn ${saved?.includes(recipe.recipeName) ? "saved" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(recipe.recipeName);
                      }}
                      aria-label={saved?.includes(recipe.recipeName) ? "Remove from saved" : "Save recipe"}
                      title={saved?.includes(recipe.recipeName) ? "Saved" : "Save recipe"}
                    >
                      {saved?.includes(recipe.recipeName) ? "★" : "☆"}
                    </button>
                  )}
                  {recipe.image && (
                    <div className="ai-card-image-wrap">
                      <img
                        src={recipe.image}
                        alt={recipe.recipeName}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="ai-card-content">
                    <div className="ai-card-header">
                      <span className="cuisine-badge">{recipe.cuisine}</span>
                      <span className="time-badge">◷ {recipe.cookingTime}</span>
                    </div>
                    <h3 className="recipe-name-title">{recipe.recipeName}</h3>
                    <p className="recipe-short-desc">{recipe.description}</p>
                    <div className="recipe-card-footer">
                      <span className="difficulty-tag">◒ {recipe.difficulty}</span>
                      <button
                        type="button"
                        className="view-recipe-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRecipe(recipe);
                        }}
                      >
                        View Recipe →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* RECENTS SECTION (Shown initially instead of hardcoded matches) */}
        {!aiRecipes && !loading && (
          <section className="matches-section recents-section">
            <div className="matches-heading">
              <div>
                <span className="label">DISCOVERY HISTORY</span>
                <h2>Recents</h2>
                <p>
                  {recents.length
                    ? "Recipes you previously searched and discovered"
                    : "Your recently searched recipes will appear here"}
                </p>
              </div>
              {recents.length > 0 && (
                <button
                  type="button"
                  className="clear-recents-btn"
                  onClick={clearRecents}
                  title="Clear search history"
                >
                  Clear Recents
                </button>
              )}
            </div>

            {recents.length > 0 ? (
              <div className="ai-recipes-grid">
                {recents.map((item, idx) => (
                  <article
                    key={`${item.recipeName}-${idx}`}
                    className="ai-recipe-card recent-card"
                    onClick={() => handleSelectRecipe(item)}
                  >
                    {onToggleSave && (
                      <button
                        type="button"
                        className={`card-save-btn ${saved?.includes(item.recipeName) ? "saved" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(item.recipeName);
                        }}
                        aria-label={saved?.includes(item.recipeName) ? "Remove from saved" : "Save recipe"}
                        title={saved?.includes(item.recipeName) ? "Saved" : "Save recipe"}
                      >
                        {saved?.includes(item.recipeName) ? "★" : "☆"}
                      </button>
                    )}
                    {item.image && (
                      <div className="ai-card-image-wrap">
                        <img
                          src={item.image}
                          alt={item.recipeName}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="ai-card-content">
                      <div className="ai-card-header">
                        <span className="cuisine-badge">{item.cuisine || "Recipe"}</span>
                        <span className="time-badge">◷ {item.cookingTime}</span>
                      </div>
                      <h3 className="recipe-name-title">{item.recipeName}</h3>
                      <p className="recipe-short-desc">{item.description}</p>
                      <div className="recipe-card-footer">
                        <span className="prompt-source-tag">
                          🔍 {item.prompt ? item.prompt.slice(0, 30) + (item.prompt.length > 30 ? "..." : "") : "Search"}
                        </span>
                        <button
                          type="button"
                          className="view-recipe-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRecipe(item);
                          }}
                        >
                          View Recipe →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span>✦</span>
                <h3>Start exploring with AI</h3>
                <p>
                  Type the ingredients in your fridge or pantry above and click <strong>&ldquo;Go&rdquo;</strong> to generate custom recipes!
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default Explore;
