import { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DishCard from "../components/DishCard";
import { ingredients, quickAdds } from "../data/ingredients";
import { dishes } from "../data/dishes";
import { normalize } from "../utils/strings";
import "./Explore.css";

function Explore({ selected, onSelected, saved, onToggleSave, navigate }) {
  const [query, setQuery] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const suggestions = useMemo(
    () =>
      ingredients
        .filter(
          (item) =>
            normalize(item).includes(normalize(query)) &&
            !selected.includes(item),
        )
        .slice(0, 7),
    [query, selected],
  );
  const matches = useMemo(
    () =>
      dishes
        .map((dish) => {
          const available = dish.required.filter((item) =>
            selected.includes(item),
          );
          const missing = dish.required.filter(
            (item) => !selected.includes(item),
          );
          return {
            ...dish,
            available,
            missing,
            match: Math.round((available.length / dish.required.length) * 100),
          };
        })
        .filter((dish) => dish.match > 0)
        .sort(
          (a, b) => b.match - a.match || a.missing.length - b.missing.length,
        ),
    [selected],
  );

  const addIngredient = (ingredient) => {
    const actual = ingredients.find(
      (item) => normalize(item) === normalize(ingredient),
    );
    if (!actual) {
      setAddedMessage("Choose an ingredient from the suggestion list.");
      return;
    }
    if (!selected.includes(actual))
      onSelected((current) => [...current, actual]);
    setQuery("");
    setAddedMessage("");
  };
  const onAdd = () => {
    if (query.trim()) addIngredient(query);
  };
  const removeIngredient = (ingredient) =>
    onSelected((current) => current.filter((item) => item !== ingredient));

  return (
    <div className="app">
      <Header
        activePage="explore"
        onExplore={() => navigate("explore")}
        onHome={() => navigate("home")}
        onCommunity={() => navigate("community")}
        onSignIn={() => navigate("signin")}
        onSaved={() => navigate("saved")}
      />
      <main className="container dashboard">
        <section className="pantry-grid">
          <div className="pantry-card">
            <span className="label">YOUR PANTRY</span>
            <h1>What&apos;s in your kitchen?</h1>
            <p>
              Add ingredients to discover what you can cook today. The more you
              add, the better the match.
            </p>
            <div className="ingredient-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setAddedMessage("");
                }}
                onKeyDown={(event) => event.key === "Enter" && onAdd()}
                placeholder="Type an ingredient (e.g., chicken, garlic, spinach)..."
                aria-label="Add an ingredient"
              />
              <button type="button" onClick={onAdd}>
                Add
              </button>
              {query && (
                <div className="suggestions">
                  {suggestions.length ? (
                    suggestions.map((item) => (
                      <button
                        type="button"
                        onClick={() => addIngredient(item)}
                        key={item}
                      >
                        {item}
                        <span>+</span>
                      </button>
                    ))
                  ) : (
                    <p>No matching ingredient in the current list.</p>
                  )}
                </div>
              )}
            </div>
            {addedMessage && (
              <small className="input-message">{addedMessage}</small>
            )}
            <div className="selected-list" aria-label="Selected ingredients">
              {selected.map((item) => (
                <span key={item}>
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIngredient(item)}
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <aside className="quick-adds">
            <div className="quick-heading">
              <span>▣</span>
              <h2>Quick adds</h2>
            </div>
            <p>Common pantry staples to boost your matches.</p>
            <div>
              {quickAdds.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={selected.includes(item)}
                  onClick={() => addIngredient(item)}
                >
                  {selected.includes(item) ? "✓ " : "+ "}
                  {item}
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="matches-section">
          <div className="matches-heading">
            <div>
              <span className="label">RECIPE RECOMMENDATIONS</span>
              <h2>Top matches</h2>
              <p>
                Based on {selected.length} ingredient
                {selected.length === 1 ? "" : "s"} in your kitchen
              </p>
            </div>
            <button className="sort-button" type="button">
              ☷ Filter &nbsp; ⇅ Sort: Match %
            </button>
          </div>
          {matches.length ? (
            <div className="dish-grid">
              {matches.map((dish) => (
                <DishCard
                  dish={dish}
                  saved={saved?.includes(dish.name)}
                  onToggleSave={onToggleSave}
                  key={dish.name}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>⌕</span>
              <h3>Start adding ingredients</h3>
              <p>
                We&apos;ll surface recipes that match what&apos;s in your
                kitchen.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default Explore;
