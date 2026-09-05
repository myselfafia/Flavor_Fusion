import Header from "../components/Header";
import { useState } from "react";
import "./SignIn.css";
import { api } from "../services/api";

function SignIn({ onHome, onLogin, navigate, onAuthChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const data = await api("/auth/register", { method: "POST", body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) });
      localStorage.setItem("flavor-fusion-token", data.token);
      localStorage.setItem("flavor-fusion-user", JSON.stringify(data.user));
      if (onAuthChange) onAuthChange();
      onHome();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app sign-in-app">
      <Header activePage="signup" onHome={onHome} />
      <main className="sign-in-page">
        <section className="sign-in-card">
          <div className="sign-in-image">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhKUTMfq6lp07QjBHdQBbr9ZlfuMwTJws6k31c9-gxqkR2QzGKMWEJQ-UO9AoU6NbYn5aCdM0Xw8HKdqeHkNCViuiITk0lieh3y_SQ6iWMmdcXslm04NVQBeonPGGuJFHMvUGOUB2-TztvswZHllaIEoX-DNMo5Sd1UPIgQQQyic6LB2SnSEAbwEkMFbrAGJ1AQKSWhrBNYceatGTExcXiMGJQ-GHagcVPLknMvE-6poI1CdWk8ugY" alt="Fresh basil and ingredients" />
            <div><strong>Flavor Fusion</strong><p>Culinary Clarity for Every Cook. Join our community to discover, save, and share your favorite recipes.</p></div>
          </div>
          <form className="create-account-form" onSubmit={submitForm}>
            <h1>Create an account</h1><p>Please enter your details to create an account.</p>
            <label>Name<input name="name" type="text" placeholder="Enter your name" required /></label>
            <label>Email<input name="email" type="email" placeholder="Enter your email" required /></label>
            <label>
              Password
              <span className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.8 10.8 0 0 1 12 5c5.5 0 9.2 5 10 7-0.4 1-1.6 2.8-3.5 4.2M6.2 6.2C4 7.8 2.6 10.2 2 12c0.8 2 4.5 7 10 7 1.3 0 2.5-0.3 3.5-0.8" />
                      <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="submit-signin" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</button>
            <p className="terms">By creating an account, you agree to our <button type="button" onClick={() => navigate("terms")}>Terms of Service</button> and <button type="button" onClick={() => navigate("privacy")}>Privacy Policy</button>.</p>
            <p className="sign-up">Already have an account? <button type="button" onClick={onLogin}>Log in</button></p>
          </form>
        </section>
      </main>
    </div>
  );
}

export default SignIn;
