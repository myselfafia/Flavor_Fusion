import { useMemo, useState } from 'react'
import './App.css'

const ingredients = [
  'Chicken Breast', 'Chicken Thighs', 'Ground Beef', 'Salmon', 'Eggs', 'Tuna',
  'Garlic', 'Onion', 'Ginger', 'Spinach', 'Broccoli', 'Bell Pepper', 'Tomato', 'Cherry Tomatoes', 'Mushrooms', 'Potato', 'Sweet Potato', 'Zucchini', 'Carrot', 'Basil', 'Lemon', 'Avocado',
  'Pasta', 'Rice', 'Quinoa', 'Bread', 'Tortilla', 'Oats',
  'Heavy Cream', 'Parmesan', 'Mozzarella', 'Feta Cheese', 'Butter', 'Milk', 'Greek Yogurt',
  'Olive Oil', 'Soy Sauce', 'Tomato Sauce', 'Coconut Milk', 'Balsamic Vinegar', 'Honey', 'Chickpeas', 'Black Beans',
]

const quickAdds = ['Olive Oil', 'Onion', 'Butter', 'Pasta', 'Rice']

const dishes = [
  { name: 'Creamy Garlic Spinach Chicken', cuisine: 'Italian-inspired', time: '25 min', level: 'Easy', required: ['Chicken Breast', 'Garlic', 'Heavy Cream', 'Spinach', 'Parmesan'], visual: 'chicken' },
  { name: 'Chicken Spinach Parmesan Bake', cuisine: 'Italian-inspired', time: '45 min', level: 'Medium', required: ['Chicken Breast', 'Spinach', 'Parmesan', 'Pasta'], visual: 'bake' },
  { name: 'Grilled Chicken Spinach Salad', cuisine: 'Mediterranean', time: '15 min', level: 'Easy', required: ['Chicken Breast', 'Spinach', 'Cherry Tomatoes', 'Balsamic Vinegar'], visual: 'salad' },
  { name: 'Garlic Butter Pasta', cuisine: 'Italian', time: '20 min', level: 'Easy', required: ['Pasta', 'Garlic', 'Butter', 'Parmesan'], visual: 'pasta' },
  { name: 'Mushroom Parmesan Risotto', cuisine: 'Italian', time: '40 min', level: 'Medium', required: ['Rice', 'Mushrooms', 'Parmesan', 'Butter'], visual: 'risotto' },
  { name: 'Lemon Herb Salmon Bowl', cuisine: 'Mediterranean', time: '30 min', level: 'Easy', required: ['Salmon', 'Lemon', 'Rice', 'Broccoli'], visual: 'salmon' },
  { name: 'Vegetable Fried Rice', cuisine: 'Asian', time: '20 min', level: 'Easy', required: ['Rice', 'Eggs', 'Carrot', 'Bell Pepper', 'Soy Sauce'], visual: 'rice' },
  { name: 'Tomato Basil Pasta', cuisine: 'Italian', time: '25 min', level: 'Easy', required: ['Pasta', 'Tomato Sauce', 'Basil', 'Garlic'], visual: 'tomato' },
]

function normalize(value) { return value.trim().toLowerCase() }

function App() {
  const [selected, setSelected] = useState(['Chicken Breast', 'Garlic', 'Heavy Cream', 'Spinach', 'Parmesan'])
  const [query, setQuery] = useState('')
  const [addedMessage, setAddedMessage] = useState('')

  const suggestions = useMemo(() => ingredients.filter((item) => normalize(item).includes(normalize(query)) && !selected.includes(item)).slice(0, 7), [query, selected])
  const matches = useMemo(() => dishes.map((dish) => {
    const available = dish.required.filter((item) => selected.includes(item))
    const missing = dish.required.filter((item) => !selected.includes(item))
    return { ...dish, available, missing, match: Math.round((available.length / dish.required.length) * 100) }
  }).filter((dish) => dish.match > 0).sort((a, b) => b.match - a.match || a.missing.length - b.missing.length), [selected])

  const addIngredient = (ingredient) => {
    const actual = ingredients.find((item) => normalize(item) === normalize(ingredient))
    if (!actual) { setAddedMessage('Choose an ingredient from the suggestion list.'); return }
    if (!selected.includes(actual)) setSelected((current) => [...current, actual])
    setQuery('')
    setAddedMessage('')
  }
  const onAdd = () => { if (query.trim()) addIngredient(query) }
  const removeIngredient = (ingredient) => setSelected((current) => current.filter((item) => item !== ingredient))

  return <div className="app">
    <Header />
    <main className="container dashboard">
      <section className="pantry-grid">
        <div className="pantry-card">
          <span className="label">YOUR PANTRY</span>
          <h1>What&apos;s in your kitchen?</h1>
          <p>Add ingredients to discover what you can cook today. The more you add, the better the match.</p>
          <div className="ingredient-input-wrap">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setAddedMessage('') }} onKeyDown={(event) => event.key === 'Enter' && onAdd()} placeholder="Type an ingredient (e.g., chicken, garlic, spinach)..." aria-label="Add an ingredient" />
            <button type="button" onClick={onAdd}>Add</button>
            {query && <div className="suggestions">{suggestions.length ? suggestions.map((item) => <button type="button" onClick={() => addIngredient(item)} key={item}>{item}<span>+</span></button>) : <p>No matching ingredient in the current list.</p>}</div>}
          </div>
          {addedMessage && <small className="input-message">{addedMessage}</small>}
          <div className="selected-list" aria-label="Selected ingredients">{selected.map((item) => <span key={item}>{item}<button type="button" onClick={() => removeIngredient(item)} aria-label={`Remove ${item}`}>×</button></span>)}</div>
        </div>
        <aside className="quick-adds">
          <div className="quick-heading"><span>▣</span><h2>Quick adds</h2></div>
          <p>Common pantry staples to boost your matches.</p>
          <div>{quickAdds.map((item) => <button key={item} type="button" disabled={selected.includes(item)} onClick={() => addIngredient(item)}>{selected.includes(item) ? '✓ ' : '+ '}{item}</button>)}</div>
        </aside>
      </section>

      <section className="matches-section">
        <div className="matches-heading"><div><span className="label">RECIPE RECOMMENDATIONS</span><h2>Top matches</h2><p>Based on {selected.length} ingredient{selected.length === 1 ? '' : 's'} in your kitchen</p></div><button className="sort-button" type="button">☷ Filter &nbsp; ⇅ Sort: Match %</button></div>
        {matches.length ? <div className="dish-grid">{matches.map((dish) => <DishCard dish={dish} key={dish.name} />)}</div> : <div className="empty-state"><span>⌕</span><h3>Start adding ingredients</h3><p>We&apos;ll surface recipes that match what&apos;s in your kitchen.</p></div>}
      </section>
    </main>
    <Footer />
  </div>
}

function Header() { return <header className="header"><a className="brand" href="#top">Flavor Fusion</a><nav><a className="active" href="#explore">Explore</a><a href="#community">Community</a><a href="#saved">Saved</a></nav><button type="button" className="avatar" aria-label="Open profile">◉</button></header> }
function DishCard({ dish }) { return <article className="dish-card"><div className={`dish-image ${dish.visual}`}><span className={dish.match === 100 ? 'match perfect' : 'match'}>{dish.match === 100 && '✦ '}{dish.match}% Match</span><div className="plate" /></div><div className="dish-content"><span className="cuisine">{dish.cuisine}</span><h3>{dish.name}</h3><p className="meta">◷ {dish.time}<i />◒ {dish.level}</p><div className="missing-area">{dish.missing.length ? <><small>Missing:</small><div>{dish.missing.map((item) => <span key={item}>{item}</span>)}</div></> : <strong>✓ You have all ingredients!</strong>}</div></div></article> }
function Footer() { return <footer><strong>Flavor Fusion</strong><nav><a href="#about">About</a><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a><a href="#help">Help Center</a><a href="#careers">Careers</a></nav><span>© 2024 Flavor Fusion. Culinary Clarity for Every Cook.</span></footer> }

export default App
