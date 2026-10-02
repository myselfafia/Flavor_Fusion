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
<<<<<<< HEAD
import { api, clearAuthSession, getAuthToken, getStoredUser } from "./services/api";
=======
import { api, setAccessToken, refreshAccessToken } from "./services/api";
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f

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
    () => pathToPage[window.location.pathname] || "home"
  );

<<<<<<< HEAD
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
=======
  const navigate = useCallback((nextPage) => {
    setPage(nextPage);
    window.history.pushState({}, "", pageToPath[nextPage] || "/");
    window.scrollTo(0, 0);
  }, []);
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f

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

  // Pantry State (starts empty - no hardcoded ingredients)
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
      } catch {
        if (isMounted) {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };

    initAuth();

    const onAuthLogout = () => {
      setAccessToken(null);
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
          } else if (Array.isArray(res)) {
            setSaved(res);
          }
        }
      })
      .catch(() => {});

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
        .catch(() => {});
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
    } catch {
      // Ignore network errors on logout
    }
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
        } catch {
          // Re-fetch on error
          api("/saved")
            .then((res) => {
              if (res?.recipes) setSaved(res.recipes);
            })
            .catch(() => {});
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
          if (res && res.recipe) {
            setSaved((curr) =>
              curr.map((r) =>
                (r.name || r.recipeName) === recipeTitle ? res.recipe : r,
              ),
            );
          }
        } catch {
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
