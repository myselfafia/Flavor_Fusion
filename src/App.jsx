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

  const verifyAuth = async () => {
    const token = localStorage.getItem("flavor-fusion-token");
    if (!token) {
      if (isLoggedIn) setIsLoggedIn(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/me`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        // If token was changed, tampered with, or expired, automatically log out
        localStorage.removeItem("flavor-fusion-token");
        localStorage.removeItem("flavor-fusion-user");
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } catch {
      // Server error or network issue
    }
  };

  // Check auth on mount, focus, storage change, and periodic poll
  useEffect(() => {
    const mountTimer = setTimeout(() => {
      verifyAuth();
    }, 0);

    const onStorage = () => verifyAuth();
    const onFocus = () => verifyAuth();
    const onAuthLogout = () => setIsLoggedIn(false);

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("auth-logout", onAuthLogout);

    const interval = setInterval(verifyAuth, 2500);

    return () => {
      clearTimeout(mountTimer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("auth-logout", onAuthLogout);
      clearInterval(interval);
    };
  }, []);

  const handleAuthChange = () => {
    setIsLoggedIn(!!localStorage.getItem("flavor-fusion-token"));
    verifyAuth();
  };

  const [welcomeName, setWelcomeName] = useState(null);

  const handleSignupWelcome = () => {
    handleAuthChange();
    try {
      const user = JSON.parse(localStorage.getItem("flavor-fusion-user"));
      setWelcomeName(user?.name || "there");
    } catch {
      setWelcomeName("there");
    }
    navigate("home");
    // Auto hide after 7 seconds
    setTimeout(() => setWelcomeName(null), 7000);
  };

  const handleLogout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem("flavor-fusion-token");
    localStorage.removeItem("flavor-fusion-user");
    setIsLoggedIn(false);
    setWelcomeName(null);
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
        welcomeName={welcomeName}
        onDismissWelcome={() => setWelcomeName(null)}
      />
    );
  if (page === "signup")
    return (
      <SignIn
        onHome={handleSignupWelcome}
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
