import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import Community from "./pages/Community";
import Saved from "./pages/Saved";
import {
  About,
  Careers,
  HelpCenter,
  PolicyPage,
  Terms,
} from "./pages/InfoPages";

const pathToPage = {
  "/": "home",
  "/explore": "explore",
  "/sign-in": "login",
  "/signin": "login",
  "/login": "login",
  "/sign-up": "signup",
  "/community": "community",
  "/about": "about",
  "/privacy": "privacy",
  "/terms": "terms",
  "/help": "help",
  "/careers": "careers",
  "/saved": "saved",
};
const pageToPath = {
  home: "/",
  explore: "/explore",
  login: "/login",
  signup: "/sign-up",
  community: "/community",
  saved: "/saved",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  help: "/help",
  careers: "/careers",
};

function App() {
  const [page, setPage] = useState(
    () => pathToPage[window.location.pathname] || "home",
  );

  // Auth status - check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("flavor-fusion-token");
  });

  // Update auth status when page changes or storage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("flavor-fusion-token"));
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [page]);

  // Also check on mount and when token changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("flavor-fusion-token"));
  }, [page]);

  const handleAuthChange = () => {
    setIsLoggedIn(!!localStorage.getItem("flavor-fusion-token"));
  };

  const handleLogout = () => {
    localStorage.removeItem("flavor-fusion-token");
    localStorage.removeItem("flavor-fusion-user");
    setIsLoggedIn(false);
    navigate("home");
  };
  const [selected, setSelected] = useState([
    "Chicken Breast",
    "Garlic",
    "Heavy Cream",
    "Spinach",
    "Parmesan",
  ]);
  const [saved, setSaved] = useState(() => {
    try {
      const storedSaved = JSON.parse(
        localStorage.getItem("flavor-fusion-saved"),
      );
      return Array.isArray(storedSaved) ? storedSaved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("flavor-fusion-saved", JSON.stringify(saved));
  }, [saved]);

  const toggleSave = (name) =>
    setSaved((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );

  const navigate = (nextPage) => {
    setPage(nextPage);
    window.history.pushState({}, "", pageToPath[nextPage] || "/");
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const onPopState = () =>
      setPage(pathToPage[window.location.pathname] || "home");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const toggleIngredient = (ingredient) =>
    setSelected((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    );
  if (page === "home")
    return (
      <Home
        onExplore={() => navigate("explore")}
        onSignIn={() => navigate("login")}
        selected={selected}
        onToggleIngredient={toggleIngredient}
        navigate={navigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onAuthChange={handleAuthChange}
      />
    );
  if (page === "signup")
    return (
      <SignIn
        onHome={() => {
          handleAuthChange();
          navigate("home");
        }}
        onLogin={() => navigate("login")}
        navigate={navigate}
        onAuthChange={handleAuthChange}
      />
    );
  if (page === "login")
    return (
      <Login
        onHome={() => {
          handleAuthChange();
          navigate("home");
        }}
        onSignUp={() => navigate("signup")}
        onAuthChange={handleAuthChange}
      />
    );
  if (page === "saved")
    return (
      <Saved
        saved={saved}
        onToggleSave={toggleSave}
        onSetSaved={setSaved}
        navigate={navigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
    );
  if (page === "community")
    return (
      <Community
        onHome={() => navigate("home")}
        onExplore={() => navigate("explore")}
        onCommunity={() => navigate("community")}
        onSignIn={() => navigate("login")}
        navigate={navigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
    );
  if (page === "about") return <About navigate={navigate} />;
  if (page === "privacy") return <PolicyPage navigate={navigate} />;
  if (page === "terms") return <Terms navigate={navigate} />;
  if (page === "help") return <HelpCenter navigate={navigate} />;
  if (page === "careers") return <Careers navigate={navigate} />;
  return (
    <Explore
      selected={selected}
      onSelected={setSelected}
      saved={saved}
      onToggleSave={toggleSave}
      navigate={navigate}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
  );
}

export default App;
