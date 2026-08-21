import Header from '../components/Header'
import Footer from '../components/Footer'
import './Home.css'

function Home({ onExplore, onSignIn }) {
  return <div className="app"><Header activePage="home" onExplore={onExplore} onHome={() => window.scrollTo(0, 0)} onSignIn={onSignIn} /><main><section className="landing-hero container"><div><span className="landing-label">◌ Culinary clarity</span><h1>Cook with what you have.</h1><p>Stop stressing over missing ingredients. Enter what&apos;s in your pantry and discover perfectly matched recipes instantly.</p><button className="landing-cta" onClick={onExplore}>Get started <span>→</span></button></div><div className="landing-image"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDtMbyy9W3mR5lhy6SaQs4gO4Ottzi6qmzoubFykhqRa1WHxdQY39H_BD-tIa8Wab_i-36EsFhIYxPKSgkcOEpSjj7oxGufgs8fShy-pkfmYpmaP9MdgGHpNdkIpwpCqYArqVT0gNreVkVH5LxlM-sJK_ZJNkqTzz7FB9q83mbnoF6bHgWsipWlnKibmY5GqUfHJM1vUfeyxeFs1FzOnspqEGpYd4HtqSxPi6ECsCDPil-7rhQ2ybh" alt="Fresh ingredients prepared for cooking"/><span><b>98%</b> Match</span></div></section><section className="landing-steps"><h2>Culinary clarity in three steps</h2><p>Make better meals from the groceries you already own.</p><div className="landing-step-grid container"><article><span>01</span><h3>Input ingredients</h3><p>Open your fridge and add what you see.</p></article><article><span>02</span><h3>Get matches</h3><p>Recipes rank themselves by your kitchen.</p></article><article><span>03</span><h3>Cook &amp; share</h3><p>Follow simple steps and make it yours.</p></article></div></section></main><Footer /></div>
}

export default Home
