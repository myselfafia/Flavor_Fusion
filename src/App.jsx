import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Explore from './pages/Explore'
import SignIn from './pages/SignIn'
import Community from './pages/Community'
import { About, Careers, HelpCenter, PolicyPage, Terms } from './pages/InfoPages'

const pathToPage = {
  '/': 'home', '/community': 'community', '/about': 'about', '/privacy': 'privacy',
  '/terms': 'terms', '/help': 'help', '/careers': 'careers',
}
const pageToPath = Object.fromEntries(Object.entries(pathToPage).map(([path, page]) => [page, path]))

function App() {
  const [page, setPage] = useState(() => pathToPage[window.location.pathname] || 'home')
  const [selected, setSelected] = useState(['Chicken Breast', 'Garlic', 'Heavy Cream', 'Spinach', 'Parmesan'])

  const navigate = (nextPage) => {
    setPage(nextPage)
    window.history.pushState({}, '', pageToPath[nextPage] || '/')
    window.scrollTo(0, 0)
  }
  useEffect(() => {
    const onPopState = () => setPage(pathToPage[window.location.pathname] || 'home')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const toggleIngredient = (ingredient) => setSelected((current) => current.includes(ingredient) ? current.filter((item) => item !== ingredient) : [...current, ingredient])
  if (page === 'home') return <Home onExplore={() => navigate('explore')} onSignIn={() => navigate('signin')} selected={selected} onToggleIngredient={toggleIngredient} navigate={navigate} />
  if (page === 'signin') return <SignIn onHome={() => navigate('home')} />
  if (page === 'community') return <Community onHome={() => navigate('home')} onExplore={() => navigate('explore')} onCommunity={() => navigate('community')} onSignIn={() => navigate('signin')} navigate={navigate} />
  if (page === 'about') return <About navigate={navigate} />
  if (page === 'privacy') return <PolicyPage navigate={navigate} />
  if (page === 'terms') return <Terms navigate={navigate} />
  if (page === 'help') return <HelpCenter navigate={navigate} />
  if (page === 'careers') return <Careers navigate={navigate} />
  return <Explore selected={selected} onSelected={setSelected} navigate={navigate} />
}

export default App
