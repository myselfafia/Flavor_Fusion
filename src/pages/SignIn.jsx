import Header from '../components/Header'
import './SignIn.css'

function SignIn({ onHome }) {
  return <div className="app sign-in-app"><Header activePage="signin" onHome={onHome} /><main className="sign-in-page"><section className="sign-in-card"><div className="sign-in-image"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhKUTMfq6lp07QjBHdQBbr9ZlfuMwTJws6k31c9-gxqkR2QzGKMWEJQ-UO9AoU6NbYn5aCdM0Xw8HKdqeHkNCViuiITk0lieh3y_SQ6iWMmdcXslm04NVQBeonPGGuJFHMvUGOUB2-TztvswZHllaIEoX-DNMo5Sd1UPIgQQQyic6LB2SnSEAbwEkMFbrAGJ1AQKSWhrBNYceatGTExcXiMGJQ-GHagcVPLknMvE-6poI1CdWk8ugY" alt="Fresh basil and ingredients"/><div><strong>Flavor Fusion</strong><p>Culinary Clarity for Every Cook. Join our community to discover, save, and share your favorite recipes.</p></div></div><form onSubmit={(event) => { event.preventDefault(); onHome() }}><h1>Welcome Back</h1><p>Please enter your details to sign in.</p><label>Email<input type="email" placeholder="Enter your email" required /></label><label>Password<input type="password" placeholder="••••••••" required /></label><div className="form-options"><label><input type="checkbox" /> Remember me</label><button type="button">Forgot password?</button></div><button className="submit-signin">Sign In</button><div className="divider"><span>or continue with</span></div><div className="social-buttons"><button type="button">◎ &nbsp; Google</button><button type="button">▣ &nbsp; Apple</button></div><p className="sign-up">Don&apos;t have an account? <button type="button">Sign up</button></p></form></section></main></div>
}

export default SignIn
