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
import { api, clearAuthSession, getAuthToken, getStoredUser } from "./services/api";

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
    () => pathToPage[window.location.pathname] || "home"
  );

  // Auth status state initialized from local session
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAuthToken());
  const [welcomeName, setWelcomeName] = useState(null);

  // Saved recipes array holding rich recipe objects
  const [saved, setSaved] = useState(() => {
    try {
      const storedSaved = JSON.parse(
        localStorage.getItem("flavor-fusion-saved")
      );
      return Array.isArray(storedSaved) ? storedSaved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("flavor-fusion-saved", JSON.stringify(saved));
    } catch {
      // Ignore storage errors
    }
  }, [saved]);

  // Auth verification helper for user interactions
  const verifyAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const res = await api("/auth/me");
      if (res && res.user) {
        localStorage.setItem("flavor-fusion-user", JSON.stringify(res.user));
        setIsLoggedIn(true);

        if (Array.isArray(res.user.savedRecipes) && res.user.savedRecipes.length > 0) {
          setSaved((current) => {
            const currentNames = new Set(
              current.map((r) => (typeof r === "string" ? r : r.recipeName || r.name).toLowerCase())
            );
            const merged = [...current];
            for (const r of res.user.savedRecipes) {
              const name = (r.recipeName || r.name || "").toLowerCase();
              if (name && !currentNames.has(name)) {
                merged.push(r);
                currentNames.add(name);
              }
            }
            return merged;
          });
        }
      } else {
        clearAuthSession();
        setIsLoggedIn(false);
      }
    } catch {
      clearAuthSession();
      setIsLoggedIn(false);
    }
  }, []);

  // Run startup verification once on mount and attach reactive listeners (no polling)
  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken();

    if (token) {
      api("/auth/me")
        .then((res) => {
          if (!isMounted) return;
          if (res && res.user) {
            localStorage.setItem("flavor-fusion-user", JSON.stringify(res.user));
            setIsLoggedIn(true);

            if (Array.isArray(res.user.savedRecipes) && res.user.savedRecipes.length > 0) {
              setSaved((current) => {
                const currentNames = new Set(
                  current.map((r) =>
                    (typeof r === "string" ? r : r.recipeName || r.name).toLowerCase()
                  )
                );
                const merged = [...current];
                for (const r of res.user.savedRecipes) {
                  const name = (r.recipeName || r.name || "").toLowerCase();
                  if (name && !currentNames.has(name)) {
                    merged.push(r);
                    currentNames.add(name);
                  }
                }
                return merged;
              });
            }
          } else {
            clearAuthSession();
            setIsLoggedIn(false);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          clearAuthSession();
          setIsLoggedIn(false);
        });
    }

    const onStorage = (e) => {
      if (e.key === "flavor-fusion-token") {
        setIsLoggedIn(!!e.newValue);
      }
    };
    const onAuthLogout = () => setIsLoggedIn(false);
    const onAuthChange = () => {
      setIsLoggedIn(!!getAuthToken());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-logout", onAuthLogout);
    window.addEventListener("auth-change", onAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-logout", onAuthLogout);
      window.removeEventListener("auth-change", onAuthChange);
    };
  }, []);

  const handleAuthChange = () => {
    setIsLoggedIn(!!getAuthToken());
    verifyAuth();
  };

  const handleSignupWelcome = () => {
    handleAuthChange();
    const user = getStoredUser();
    setWelcomeName(user?.name || "there");
    navigate("home");
    // Auto hide welcome banner after 7 seconds
    setTimeout(() => setWelcomeName(null), 7000);
  };

  const handleLogout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    clearAuthSession();
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

  const toggleSave = (recipeOrName) => {
    if (!recipeOrName) return;

    const targetName =
      typeof recipeOrName === "string"
        ? recipeOrName
        : recipeOrName.recipeName || recipeOrName.name;

    if (!targetName) return;

    setSaved((current) => {
      const exists = current.some((item) => {
        const itemName =
          typeof item === "string" ? item : item.recipeName || item.name;
        return itemName?.toLowerCase() === targetName.toLowerCase();
      });

      let updated;
      if (exists) {
        updated = current.filter((item) => {
          const itemName =
            typeof item === "string" ? item : item.recipeName || item.name;
          return itemName?.toLowerCase() !== targetName.toLowerCase();
        });

        // Sync with backend if logged in
        if (getAuthToken()) {
          api(`/users/saved/${encodeURIComponent(targetName)}`, {
            method: "DELETE",
          }).catch(() => {});
        }
      } else {
        const itemToAdd =
          typeof recipeOrName === "object" && recipeOrName !== null
            ? {
                ...recipeOrName,
                name: recipeOrName.recipeName || recipeOrName.name || targetName,
                recipeName: recipeOrName.recipeName || recipeOrName.name || targetName,
              }
            : {
                name: targetName,
                recipeName: targetName,
                cuisine: "Homestyle",
                cookingTime: "25 min",
                difficulty: "Easy",
                required: [],
                ingredients: [],
                steps: [],
                tips: [],
              };
        updated = [...current, itemToAdd];

        // Sync with backend if logged in
        if (getAuthToken()) {
          api("/users/saved", {
            method: "POST",
            body: JSON.stringify(itemToAdd),
          }).catch(() => {});
        }
      }

      return updated;
    });
  };

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
        : [...current, ingredient]
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
