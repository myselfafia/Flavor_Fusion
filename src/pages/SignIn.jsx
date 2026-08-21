import Header from '../components/Header'
import { useState } from 'react'
import './SignIn.css'

function SignIn({ onHome }) {
  const [creatingAccount, setCreatingAccount] = useState(false)

  const submitForm = (event) => {
    event.preventDefault()
    onHome()
  }

  return <div className="app sign-in-app"><Header activePage="signin" onHome={onHome} /><main className="sign-in-page"><section className="sign-in-card"><div className="sign-in-image"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhKUTMfq6lp07QjBHdQBbr9ZlfuMwTJws6k31c9-gxqkR2QzGKMWEJQ-UO9AoU6NbYn5aCdM0Xw8HKdqeHkNCViuiITk0lieh3y_SQ6iWMmdcXslm04NVQBeonPGGuJFHMvUGOUB2-TztvswZHllaIEoX-DNMo5Sd1UPIgQQQyic6LB2SnSEAbwEkMFbrAGJ1AQKSWhrBNYceatGTExcXiMGJQ-GHagcVPLknMvE-6poI1CdWk8ugY" alt="Fresh basil and ingredients"/><div><strong>Flavor Fusion</strong><p>Culinary Clarity for Every Cook. Join our community to discover, save, and share your favorite recipes.</p></div></div>{creatingAccount ? <form className="create-account-form" onSubmit={submitForm}><h1>Create An Account</h1><p>Please enter your details to create an account.</p><label>Name<input type="text" placeholder="Enter your name" required /></label><label>Email<input type="email" placeholder="Enter your email" required /></label><label>Password<input type="password" placeholder="Create a password" required /></label><button className="submit-signin">Create Account</button><p className="terms">By creating an account, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p><p className="sign-up">Already have an account? <button type="button" onClick={() => setCreatingAccount(false)}>Sign in</button></p></form> : <form onSubmit={submitForm}><h1>Welcome Back</h1><p>Please enter your details to sign in.</p><label>Email<input type="email" placeholder="Enter your email" required /></label><label>Password<input type="password" placeholder="••••••••" required /></label><div className="form-options"><label><input type="checkbox" /> Remember me</label><button type="button">Forgot password?</button></div><button className="submit-signin">Sign In</button><div className="divider"><span>or continue with</span></div><div className="social-buttons"><button type="button">◎ &nbsp; Google</button><button type="button">▣ &nbsp; Apple</button></div><p className="sign-up">Don&apos;t have an account? <button type="button" onClick={() => setCreatingAccount(true)}>Sign up</button></p></form>}</section></main></div>
}

export default SignIn
