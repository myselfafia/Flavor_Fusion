import './Header.css'
import logo from '../assets/flavor_fusion_logo.png'

function Header({ activePage, onExplore, onHome, onCommunity, onSignIn }) {
  const openCommunity = () => onCommunity ? onCommunity() : window.location.assign('/community')
  return <header className="header"><button className="brand" onClick={onHome}><img src={logo} alt="" />Flavor Fusion</button><nav><button className={activePage === 'home' ? 'active' : ''} onClick={onHome}>Home</button><button className={activePage === 'explore' ? 'active' : ''} onClick={onExplore}>Explore</button><button className={activePage === 'community' ? 'active' : ''} onClick={openCommunity}>Community</button><a href="#saved">Saved</a></nav>{activePage !== 'signin' && <button type="button" className="signin-button" onClick={onSignIn}>Sign in</button>}</header>
}

export default Header
