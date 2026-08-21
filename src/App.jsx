import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Explore from './pages/Explore'
import SignIn from './pages/SignIn'
import Community from './pages/Community'

function App() {
  const [page, setPage] = useState(() => window.location.pathname === '/community' ? 'community' : 'home')
  const [selected, setSelected] = useState(['Chicken Breast', 'Garlic', 'Heavy Cream', 'Spinach', 'Parmesan'])

  const navigate = (nextPage) => {
    setPage(nextPage)
    window.history.pushState({}, '', nextPage === 'community' ? '/community' : '/')
    window.scrollTo(0, 0)
  }
  useEffect(() => {
    const onPopState = () => setPage(window.location.pathname === '/community' ? 'community' : 'home')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (page === 'home') return <Home onExplore={() => navigate('explore')} onSignIn={() => navigate('signin')} />
  if (page === 'signin') return <SignIn onHome={() => navigate('home')} />
  if (page === 'community') return <Community onHome={() => navigate('home')} onExplore={() => navigate('explore')} onCommunity={() => navigate('community')} onSignIn={() => navigate('signin')} />
  return <Explore selected={selected} onSelected={setSelected} navigate={navigate} />
}

export default App
