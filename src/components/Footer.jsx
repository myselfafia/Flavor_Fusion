import './Footer.css'

const footerLinks = [['About', '/about', 'about'], ['Privacy Policy', '/privacy', 'privacy'], ['Terms of Service', '/terms', 'terms'], ['Help Center', '/help', 'help'], ['Careers', '/careers', 'careers']]

function Footer({ navigate }) { return <footer><strong>Flavor Fusion</strong><nav>{footerLinks.map(([label, href, page]) => <a key={href} href={href} onClick={(event) => { if (navigate) { event.preventDefault(); navigate(page) } }}>{label}</a>)}</nav><span>© 2024 Flavor Fusion. Culinary Clarity for Every Cook.</span></footer> }

export default Footer
