import './App.css'

const recipes = [
  ['Herb Garden Pesto Pasta', '20 min', 'Easy', '95%'],
  ['Morning-After Root Hash', '35 min', 'Medium', '88%'],
  ['Pantry Tomato Bisque', '15 min', 'Easy', '100%'],
  ['Any-Grain Cleanse Bowl', '25 min', 'Medium', '75%'],
]

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="eyebrow">◌ Culinary clarity</span>
            <h1>Cook with what you have.</h1>
            <p>Turn the ingredients in your kitchen into thoughtful, perfectly matched recipes.</p>
            <div className="ingredient-search">
              <div className="chips"><span>Chicken <b>×</b></span><span>Garlic <b>×</b></span></div>
              <div className="search-row"><span>⌕</span><input placeholder="Add ingredients (e.g. spinach, pasta)" /><button>Get started →</button></div>
            </div>
          </div>
          <div className="hero-art" aria-label="Ingredient image placeholder">
            <div className="counter-shape" />
            <div className="match-circle"><strong>98%</strong><small>Match</small></div>
            <div className="dish-thumb">Your best match</div>
          </div>
        </section>

        <section className="steps-section">
          <div className="container centered">
            <span className="section-label">A simpler way to cook</span>
            <h2>From fridge to dinner, clearly.</h2>
            <p>Build an ingredient-first cooking experience without the clutter.</p>
            <div className="steps">
              <Step number="01" title="Input ingredients" text="Add the ingredients you already have, from staples to fresh produce." />
              <Step number="02" title="Get matches" text="See recipes ranked by how closely they fit your kitchen." />
              <Step number="03" title="Cook & share" text="Follow focused steps and share the dishes you love." />
            </div>
          </div>
        </section>

        <section className="recipes container">
          <div className="section-head"><div><span className="section-label">Made for your kitchen</span><h2>Trending clear-outs</h2></div><button className="link-button">View all →</button></div>
          <div className="recipe-grid">{recipes.map(([name, time, level, match], index) => <RecipeCard key={name} name={name} time={time} level={level} match={match} variant={index + 1} />)}</div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return <header className="header"><a className="brand" href="#top">Flavor Fusion</a><nav><a className="active" href="#explore">Explore</a><a href="#community">Community</a><a href="#saved">Saved</a></nav><div className="header-right"><button className="header-search">Search recipes... <span>⌕</span></button><button className="login">Log in</button></div></header>
}
function Step({ number, title, text }) { return <article className="step"><span className="step-number">{number}</span><div className="step-icon">✦</div><h3>{title}</h3><p>{text}</p></article> }
function RecipeCard({ name, time, level, match, variant }) { return <article className={`recipe-card recipe-${variant}`}><div className="recipe-image"><span>{match} Match</span><div className="food-illustration" /></div><div className="recipe-info"><h3>{name}</h3><p>◷ {time} <i /> ◒ {level}</p></div></article> }
function Footer() { return <footer><strong>Flavor Fusion</strong><nav><a href="#about">About</a><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a><a href="#help">Help Center</a><a href="#careers">Careers</a></nav><span>© 2024 Flavor Fusion. Culinary Clarity for Every Cook.</span></footer> }

export default App
