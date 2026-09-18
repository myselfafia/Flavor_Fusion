import { useState, useEffect } from "react";
import "./Header.css";
import logo from "../assets/flavor_fusion_logo.png";

function Header({
  activePage,
  onExplore,
  onHome,
  onCommunity,
  onSignIn,
  onSaved,
  isLoggedIn,
  onLogout,
  onSignUp,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC key or route navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (navAction) => {
    setMobileMenuOpen(false);
    if (navAction) navAction();
  };

  const openHome = () => handleNavClick(onHome);
  const openExplore = () => handleNavClick(onExplore);
  const openCommunity = () =>
    handleNavClick(
      onCommunity ? onCommunity : () => window.location.assign("/community")
    );
  const openSaved = () =>
    handleNavClick(
      onSaved ? onSaved : () => window.location.assign("/saved")
    );

  // Check auth directly if not passed as prop (fallback)
  const loggedIn =
    typeof isLoggedIn === "boolean"
      ? isLoggedIn
      : !!localStorage.getItem("flavor-fusion-token");

  const handleLogout = () => {
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("flavor-fusion-token");
      localStorage.removeItem("flavor-fusion-user");
      window.location.assign("/");
    }
  };

  const handleLogin = () => {
    setMobileMenuOpen(false);
    if (onSignIn) {
      onSignIn();
    } else if (onSignUp) {
      onSignUp();
    } else {
      window.location.assign("/login");
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <button className="brand" onClick={openHome}>
          <img src={logo} alt="Flavor Fusion Logo" />
          <span>Flavor Fusion</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={activePage === "home" ? "active" : ""}
            onClick={openHome}
          >
            Home
          </button>
          <button
            type="button"
            className={activePage === "explore" ? "active" : ""}
            onClick={openExplore}
          >
            Explore
          </button>
          <button
            type="button"
            className={activePage === "community" ? "active" : ""}
            onClick={openCommunity}
          >
            Community
          </button>
          <button
            type="button"
            className={activePage === "saved" ? "active" : ""}
            onClick={openSaved}
          >
            Saved
          </button>
        </nav>

        {/* Desktop Auth Button */}
        <div className="header-actions">
          {!["signup", "login"].includes(activePage) &&
            (loggedIn ? (
              <button
                type="button"
                className="logout-button desktop-auth"
                onClick={handleLogout}
              >
                Log Out
              </button>
            ) : (
              <button
                type="button"
                className="signin-button desktop-auth"
                onClick={handleLogin}
              >
                Log In
              </button>
            ))}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`hamburger-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Navigation */}
      <div
        className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-drawer-header">
          <button className="brand" onClick={openHome}>
            <img src={logo} alt="" />
            <span>Flavor Fusion</span>
          </button>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-nav-links">
          <button
            type="button"
            className={`mobile-nav-btn ${activePage === "home" ? "active" : ""}`}
            onClick={openHome}
          >
            <span>Home</span>
            {activePage === "home" && <span className="active-dot">●</span>}
          </button>
          <button
            type="button"
            className={`mobile-nav-btn ${activePage === "explore" ? "active" : ""}`}
            onClick={openExplore}
          >
            <span>Explore</span>
            {activePage === "explore" && <span className="active-dot">●</span>}
          </button>
          <button
            type="button"
            className={`mobile-nav-btn ${activePage === "community" ? "active" : ""}`}
            onClick={openCommunity}
          >
            <span>Community</span>
            {activePage === "community" && <span className="active-dot">●</span>}
          </button>
          <button
            type="button"
            className={`mobile-nav-btn ${activePage === "saved" ? "active" : ""}`}
            onClick={openSaved}
          >
            <span>Saved Recipes</span>
            {activePage === "saved" && <span className="active-dot">●</span>}
          </button>
        </nav>

        {!["signup", "login"].includes(activePage) && (
          <div className="mobile-auth-section">
            {loggedIn ? (
              <button
                type="button"
                className="logout-button mobile-auth-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            ) : (
              <button
                type="button"
                className="signin-button mobile-auth-btn"
                onClick={handleLogin}
              >
                Log In
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

