import './Footer.css'

const footerLinks = [['About', '/about', 'about'], ['Privacy Policy', '/privacy', 'privacy'], ['Terms of Service', '/terms', 'terms'], ['Help Center', '/help', 'help'], ['Careers', '/careers', 'careers']]

function Footer({ navigate }) {
  const activePath = window.location.pathname
  return <footer><strong>Flavor Fusion</strong><nav>{footerLinks.map(([label, href, page]) => <a key={href} href={href} className={activePath === href ? 'active' : ''} onClick={(event) => { if (navigate) { event.preventDefault(); navigate(page) } }}>{label}</a>)}</nav><span>© 2026 Flavor Fusion. Culinary Clarity for Every Cook.</span></footer>
}

export default Footer
