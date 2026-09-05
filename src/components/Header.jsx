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
  const openCommunity = () =>
    onCommunity ? onCommunity() : window.location.assign("/community");
  const openSaved = () =>
    onSaved ? onSaved() : window.location.assign("/saved");

  // Check auth directly if not passed as prop (fallback)
  const loggedIn = typeof isLoggedIn === "boolean" ? isLoggedIn : !!localStorage.getItem("flavor-fusion-token");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("flavor-fusion-token");
      localStorage.removeItem("flavor-fusion-user");
      window.location.assign("/");
    }
  };

  const handleSignUp = () => {
    if (onSignIn) {
      onSignIn();
    } else if (onSignUp) {
      onSignUp();
    } else {
      window.location.assign("/sign-up");
    }
  };

  return (
    <header className="header">
      <button className="brand" onClick={onHome}>
        <img src={logo} alt="" />
        Flavor Fusion
      </button>
      <nav>
        <button
          className={activePage === "home" ? "active" : ""}
          onClick={onHome}
        >
          Home
        </button>
        <button
          className={activePage === "explore" ? "active" : ""}
          onClick={onExplore}
        >
          Explore
        </button>
        <button
          className={activePage === "community" ? "active" : ""}
          onClick={openCommunity}
        >
          Community
        </button>
        <button
          className={activePage === "saved" ? "active" : ""}
          onClick={openSaved}
        >
          Saved
        </button>
      </nav>
      {/* Show Log Out if logged in, Sign Up if not logged in */}
      {!['signup', 'login'].includes(activePage) && (
        loggedIn ? (
          <button type="button" className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        ) : (
          <button type="button" className="signin-button" onClick={handleSignUp}>
            Sign Up
          </button>
        )
      )}
    </header>
  );
}

export default Header;
