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
  { name: 'Creamy Garlic Spinach Chicken', cuisine: 'Italian-inspired', time: '25 min', level: 'Easy', required: ['Chicken Breast', 'Garlic', 'Heavy Cream', 'Spinach', 'Parmesan'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZN4eH2nUnlQm0HMpEgEXScl2Cx5vXaWg1t_GUnDDG3NVqPXOLAwGAcDKR1xzggOkE1c67yp3FWJ1Ar_q685bjIUYk_ofjR7zh1Lg7wvD5WgC1pE3a2d8hIcvhMlpYg6gcLL57sAApyWfoLyunC9R9NTTqABBsgfHCXHti7Ksig_jIg5zwR9PQgUKFfmcJT4aAPW3TC8kR-yT9SndLYvqRuV7hzI-7JSWzcBFjhU37u3KpvRrCUiTUCA' },
  { name: 'Chicken Spinach Parmesan Bake', cuisine: 'Italian-inspired', time: '45 min', level: 'Medium', required: ['Chicken Breast', 'Spinach', 'Parmesan', 'Pasta'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzJV-flC8zvXxCwTDTo_AUwAk7Yav57A4np5AYbzu6fHBpoAKYUZbcdTkbJh-i8EiKiBrJ46TH_afn678Ndandcw9bsi7vMmNnDme8c3khwHB_9HrRZUpYUN-ALQSaosE9xmzA0k86xxItSZTW6XH_q3agW3NrMmA6h4fyB41gZ97O8lUlquVSebjDY4I5djk_TBQ9CSeXPODslJoSUIlw-Lr9EUGihFFEAnFezxRyb9G1IivKKIGx5Q' },
  { name: 'Grilled Chicken Spinach Salad', cuisine: 'Mediterranean', time: '15 min', level: 'Easy', required: ['Chicken Breast', 'Spinach', 'Cherry Tomatoes', 'Balsamic Vinegar'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7yfFyoVxj02jNGTBRYUyQ4mRv1kR01-7PReoyPYfAhwDOYjJrDLHMignva2Y6CohyA3YAKd4oitMqpD1jG_5qT8mVWIRkFGFGvuaploprYLMDny8wnDyOZiXqnZScfiSWYW0IMKw_qsPcOmslzAnktxbxHhwfJVraBHZNwxxf377iaOmmMM0FmQAgs-FN3I2fKudPmUbRwV3jlw6wzhILD1flDkYty9Ws-gk1SBJ_9PIMIZtJ70YUwQ' },
  { name: 'Garlic Butter Pasta', cuisine: 'Italian', time: '20 min', level: 'Easy', required: ['Pasta', 'Garlic', 'Butter', 'Parmesan'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQx6IFzupngMkrD6RsZWCX1YCv_KK9ocT1wJnj3EDSCdZMTzJCyeSkUFbUlsm_1L-_9L0G7EC6u12o7kykr4n_N9RG1-Jxbpxod2BpkpmhS6bne9iCyxtWzSFz_q0GQeDBSNIOIyjoYg_btBKtkeFZw0uiS3UaaYxy8iRkdZXAUX2l0TIli57VTbTx4dYyepLNSIqyBjBy8rDGD7AGjfpjpJ9JdekPYA5mXxxj_sRTue6mczocc6fT-A' },
  { name: 'Mushroom Parmesan Risotto', cuisine: 'Italian', time: '40 min', level: 'Medium', required: ['Rice', 'Mushrooms', 'Parmesan', 'Butter'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHgfbGFOU427_NIqHYi1bgf-FAqgHkuKtmIbVLNp4dX1C4C-2hmunkWRjs_9d0zAsBewvMFbTm0VTqn7NiI8dm9ksK_MqF_tIOgm79k2_OM3AgUUSEyCE1LkwFgk8cyphiD6gBTl5txcFXE0KXQe67SbZcWq_UXv7cfgPnOU03tsqhEQZQmMUQDjiNr1dfvsHgPkOt7-J785Lic1MbkuwUkUgp3OaNbi2bkL4vedCbI2efLCVpiKkE' },
  { name: 'Lemon Herb Salmon Bowl', cuisine: 'Mediterranean', time: '30 min', level: 'Easy', required: ['Salmon', 'Lemon', 'Rice', 'Broccoli'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjrI-OVs9zQ-mSylOVzLI6uLOO96uXA3KFhlBXuFX1hcxNXATXECJyqpTpDaqtTmHWDZXmt4idA7Oi4WuMVTRQbhjbsq_rFuQ2eWmhXYCWXOYwSW0HJK5DOGdE_lcYZmLLW0hZXSwnjSKwfv8kbwn0VDxm3iHHUcinBYaZ-WDK01-FqMv0U4as3obyn7PKJV0DPP_isEPM00sdoul6zA22eLoxLlMcvBwHCC2D5RDUCtBquv2e3PugwA' },
  { name: 'Vegetable Fried Rice', cuisine: 'Asian', time: '20 min', level: 'Easy', required: ['Rice', 'Eggs', 'Carrot', 'Bell Pepper', 'Soy Sauce'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9mf6yiXrdyuHHLU1DZBG2DqtiDSlXoIwz_3NZGKHiWClspgzmTtq2yBwvpZ0vXa6DqvetHi9e-NuBIlfpPtX0RxgcEixiwMc7VkNpC39rgJO_YMDJiug5CuI4Khe0064odYR3jRUVi3Hj5L_X14DQ-EFtD2__Ai4YvMdHhEqeIhdy1uFxaHB1nk7AtHwqykb-PxTeePMLYs5eQ8NwDnmdTW5wR95v55HMySgLbULT2qQY-C3n0oYcLw' },
  { name: 'Tomato Basil Pasta', cuisine: 'Italian', time: '25 min', level: 'Easy', required: ['Pasta', 'Tomato Sauce', 'Basil', 'Garlic'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFn6ZrUtuTa-oAN-BXRQGNm_hyTQVBMmr_vp87zbXtl78mQMkHI_l_mo2NSELU1desWQltfnqcjPyXIoCxq2iNwWeqxZlVqkz00CNP8jp1VvMJ09a0qmWXBy8mAyjg07LCDs5hNrds4gRxBjU_kWCR50J15yQ11UrnhSldezLP0O7cpFdFYYkSy0Xuf2v3Aj9fVu-eZxsUQzxXz878wyWTPh-OleTo3c8J7RcjgjRNK6GvS-MorZkZGQ' },
]

function normalize(value) { return value.trim().toLowerCase() }

function App() {
  const [page, setPage] = useState('home')
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

  if (page === 'home') return <Landing onExplore={() => setPage('explore')} onSignIn={() => setPage('signin')} />
  if (page === 'signin') return <SignIn onHome={() => setPage('home')} onExplore={() => setPage('explore')} onSignIn={() => setPage('signin')} />
  return <div className="app">
    <Header activePage="explore" onExplore={() => setPage('explore')} onHome={() => setPage('home')} onSignIn={() => setPage('signin')} />
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

function Header({ activePage, onExplore, onHome, onSignIn }) {
  return <header className="header"><button className="brand" onClick={onHome}>Flavor Fusion</button><nav><button className={activePage === 'home' ? 'active' : ''} onClick={onHome}>Home</button><button className={activePage === 'explore' ? 'active' : ''} onClick={onExplore}>Explore</button><a href="#community">Community</a><a href="#saved">Saved</a></nav>{activePage !== 'signin' && <button type="button" className="signin-button" onClick={onSignIn}>Sign in</button>}</header>
}
function Landing({ onExplore, onSignIn }) { return <div className="app"><Header activePage="home" onExplore={onExplore} onHome={() => window.scrollTo(0, 0)} onSignIn={onSignIn} /><main><section className="landing-hero container"><div><span className="landing-label">◌ Culinary clarity</span><h1>Cook with what you have.</h1><p>Stop stressing over missing ingredients. Enter what&apos;s in your pantry and discover perfectly matched recipes instantly.</p><button className="landing-cta" onClick={onExplore}>Get started <span>→</span></button></div><div className="landing-image"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDtMbyy9W3mR5lhy6SaQs4gO4Ottzi6qmzoubFykhqRa1WHxdQY39H_BD-tIa8Wab_i-36EsFhIYxPKSgkcOEpSjj7oxGufgs8fShy-pkfmYpmaP9MdgGHpNdkIpwpCqYArqVT0gNreVkVH5LxlM-sJK_ZJNkqTzz7FB9q83mbnoF6bHgWsipWlnKibmY5GqUfHJM1vUfeyxeFs1FzOnspqEGpYd4HtqSxPi6ECsCDPil-7rhQ2ybh" alt="Fresh ingredients prepared for cooking"/><span><b>98%</b> Match</span></div></section><section className="landing-steps"><h2>Culinary clarity in three steps</h2><p>Make better meals from the groceries you already own.</p><div className="landing-step-grid container"><article><span>01</span><h3>Input ingredients</h3><p>Open your fridge and add what you see.</p></article><article><span>02</span><h3>Get matches</h3><p>Recipes rank themselves by your kitchen.</p></article><article><span>03</span><h3>Cook &amp; share</h3><p>Follow simple steps and make it yours.</p></article></div></section></main><Footer /></div> }
function SignIn({ onHome, onExplore, onSignIn }) { return <div className="app sign-in-app"><Header activePage="signin" onHome={onHome} onExplore={onExplore} onSignIn={onSignIn} /><main className="sign-in-page"><section className="sign-in-card"><div className="sign-in-image"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhKUTMfq6lp07QjBHdQBbr9ZlfuMwTJws6k31c9-gxqkR2QzGKMWEJQ-UO9AoU6NbYn5aCdM0Xw8HKdqeHkNCViuiITk0lieh3y_SQ6iWMmdcXslm04NVQBeonPGGuJFHMvUGOUB2-TztvswZHllaIEoX-DNMo5Sd1UPIgQQQyic6LB2SnSEAbwEkMFbrAGJ1AQKSWhrBNYceatGTExcXiMGJQ-GHagcVPLknMvE-6poI1CdWk8ugY" alt="Fresh basil and ingredients"/><div><strong>Flavor Fusion</strong><p>Culinary Clarity for Every Cook. Join our community to discover, save, and share your favorite recipes.</p></div></div><form onSubmit={(event) => { event.preventDefault(); onHome() }}><h1>Welcome Back</h1><p>Please enter your details to sign in.</p><label>Email<input type="email" placeholder="Enter your email" required /></label><label>Password<input type="password" placeholder="••••••••" required /></label><div className="form-options"><label><input type="checkbox" /> Remember me</label><button type="button">Forgot password?</button></div><button className="submit-signin">Sign In</button><div className="divider"><span>or continue with</span></div><div className="social-buttons"><button type="button">◎ &nbsp; Google</button><button type="button">▣ &nbsp; Apple</button></div><p className="sign-up">Don&apos;t have an account? <button type="button">Sign up</button></p></form></section></main></div> }
function DishCard({ dish }) { return <article className="dish-card"><div className="dish-image"><img src={dish.image} alt={dish.name}/><span className={dish.match === 100 ? 'match perfect' : 'match'}>{dish.match === 100 && '✦ '}{dish.match}% Match</span></div><div className="dish-content"><span className="cuisine">{dish.cuisine}</span><h3>{dish.name}</h3><p className="meta">◷ {dish.time}<i />◒ {dish.level}</p><div className="missing-area">{dish.missing.length ? <><small>Missing:</small><div>{dish.missing.map((item) => <span key={item}>{item}</span>)}</div></> : <strong>✓ You have all ingredients!</strong>}</div></div></article> }
function Footer() { return <footer><strong>Flavor Fusion</strong><nav><a href="#about">About</a><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a><a href="#help">Help Center</a><a href="#careers">Careers</a></nav><span>© 2024 Flavor Fusion. Culinary Clarity for Every Cook.</span></footer> }

export default App
