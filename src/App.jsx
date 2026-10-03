import { useEffect, useState, useCallback } from "react";
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
import {
  api,
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
} from "./services/api";
import CarbonFootprintDisplay from "./components/CarbonFootprintDisplay";

const pathToPage = {
  "/": "home",
  "/explore": "explore",
  "/sign-in": "login",
  "/signin": "login",
  "/login": "login",
  "/sign-up": "signup",
  "/signup": "signup",
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

  const navigate = useCallback((nextPage) => {
    setPage(nextPage);
    window.history.pushState({}, "", pageToPath[nextPage] || "/");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPopState = () =>
      setPage(pathToPage[window.location.pathname] || "home");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Authentication State (In-Memory)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [welcomeName, setWelcomeName] = useState(null);

  // Pantry State (starts empty - no hardcoded sample data)
  const [selected, setSelected] = useState([]);

  // Saved recipes state (synced with backend API)
  const [saved, setSaved] = useState([]);

  // Initial silent auth check on mount via httpOnly refresh token cookie
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const token = await refreshAccessToken();
        if (token && isMounted) {
          const profile = await api("/auth/me");
          if (profile && profile.user && isMounted) {
            setUser(profile.user);
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.warn("Session restore check:", err.message);
        if (isMounted) {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };

    initAuth();

    const onAuthLogout = () => {
      clearAccessToken();
      setIsLoggedIn(false);
      setUser(null);
      setSaved([]);
    };

    const onAuthRefreshed = (e) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
        setIsLoggedIn(true);
      }
    };

    window.addEventListener("auth-logout", onAuthLogout);
    window.addEventListener("auth-refreshed", onAuthRefreshed);

    return () => {
      isMounted = false;
      window.removeEventListener("auth-logout", onAuthLogout);
      window.removeEventListener("auth-refreshed", onAuthRefreshed);
    };
  }, []);

  // Fetch saved recipes from API whenever authentication state becomes true
  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;
    api("/saved")
      .then((res) => {
        if (isMounted) {
          if (res && Array.isArray(res.recipes)) {
            setSaved(res.recipes);
          } else if (res && Array.isArray(res.data?.recipes)) {
            setSaved(res.data.recipes);
          } else if (Array.isArray(res)) {
            setSaved(res);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch saved recipes on login:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const handleAuthChange = (authenticatedUser) => {
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setIsLoggedIn(true);
    } else {
      api("/auth/me")
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            setIsLoggedIn(true);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch profile in authChange:", err.message);
        });
    }
  };

  const handleSignupWelcome = (newUser) => {
    handleAuthChange(newUser);
    const displayName =
      newUser?.name || newUser?.displayName || user?.name || "there";
    setWelcomeName(displayName);
    navigate("home");
    setTimeout(() => setWelcomeName(null), 7000);
  };

  const handleLogout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request notice:", err.message);
    }
    clearAccessToken();
    setAccessToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setSaved([]);
    setWelcomeName(null);
    navigate("home");
  };

  const toggleSave = useCallback(
    async (recipe) => {
      if (!isLoggedIn) {
        navigate("login");
        return;
      }

      const recipeTitle =
        typeof recipe === "string"
          ? recipe
          : recipe.recipeName || recipe.name || "";
      if (!recipeTitle) return;

      const isAlreadySaved = saved.some(
        (item) =>
          (item.name || item.recipeName || item).toLowerCase() ===
          recipeTitle.toLowerCase(),
      );

      if (isAlreadySaved) {
        // Optimistic remove
        setSaved((curr) =>
          curr.filter(
            (item) =>
              (item.name || item.recipeName || item).toLowerCase() !==
              recipeTitle.toLowerCase(),
          ),
        );
        try {
          await api(`/saved/${encodeURIComponent(recipeTitle)}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.error("Failed to delete saved recipe:", err.message);
          // Re-fetch on error to sync with backend
          api("/saved")
            .then((res) => {
              if (res?.recipes) setSaved(res.recipes);
            })
            .catch((fetchErr) => {
              console.warn(
                "Failed to re-sync saved recipes:",
                fetchErr.message,
              );
            });
        }
      } else {
        // Optimistic add
        const itemToAdd =
          typeof recipe === "string"
            ? { name: recipe, recipeName: recipe }
            : recipe;
        setSaved((curr) => [itemToAdd, ...curr]);
        try {
          const res = await api("/saved", {
            method: "POST",
            body: JSON.stringify(itemToAdd),
          });
          if (res && (res.recipe || res.data?.recipe)) {
            const savedItem = res.recipe || res.data?.recipe;
            setSaved((curr) =>
              curr.map((r) =>
                (r.name || r.recipeName) === recipeTitle ? savedItem : r,
              ),
            );
          }
        } catch (err) {
          console.error("Failed to save recipe:", err.message);
          // Revert on error
          setSaved((curr) =>
            curr.filter(
              (item) =>
                (item.name || item.recipeName || item).toLowerCase() !==
                recipeTitle.toLowerCase(),
            ),
          );
        }
      }
    },
    [isLoggedIn, navigate, saved],
  );

  const toggleIngredient = (ingredient) =>
    setSelected((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    );

  const renderPage = () => {
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

    if (page === "about")
      return (
        <About
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      );

    if (page === "privacy")
      return (
        <PolicyPage
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      );

    if (page === "terms")
      return (
        <Terms
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      );

    if (page === "help")
      return (
        <HelpCenter
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      );

    if (page === "careers")
      return (
        <Careers
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      );

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
  };

  return (
    <>
      {renderPage()}
      <CarbonFootprintDisplay />
    </>
  );
}

export default App;
