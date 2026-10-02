import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import app from "./server.js";
import User from "./models/User.js";
import SavedRecipe from "./models/SavedRecipe.js";
import Post from "./models/Post.js";
import Recent from "./models/Recent.js";

async function runE2E() {
  await mongoose.connect(process.env.MONGODB_URI);
  const testEmail = `e2e_${Date.now()}@flavorfusion.test`;
  const testPassword = "SecurePassword2026!";

  const server = app.listen(5098, async () => {
    try {
      const BASE = "http://localhost:5098/api";
      let cookie = "";

      console.log("--> Testing 1: Register");
      const regRes = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E Chef",
          email: testEmail,
          password: testPassword,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.accessToken) {
        throw new Error(`Register failed: ${JSON.stringify(regData)}`);
      }
      console.log("✓ Registered user:", regData.user.email);
      cookie = regRes.headers.get("set-cookie").split(";")[0];

      console.log("--> Testing 2: Refresh token");
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: cookie },
      });
      const refreshData = await refreshRes.json();
      if (!refreshRes.ok || !refreshData.accessToken) {
        throw new Error(`Refresh failed: ${JSON.stringify(refreshData)}`);
      }
      console.log("✓ Refresh token rotated successfully");
      cookie = refreshRes.headers.get("set-cookie").split(";")[0];
      const token = refreshData.accessToken;

      console.log("--> Testing 3: Unauthenticated /saved rejected with 401");
      const unauthRes = await fetch(`${BASE}/saved`);
      if (unauthRes.status !== 401) {
        throw new Error(`Expected 401, got ${unauthRes.status}`);
      }
      console.log("✓ Protected endpoints reject unauthenticated requests");

      console.log("--> Testing 4: Authenticated /saved CRUD");
      const saveRes = await fetch(`${BASE}/saved`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipeName: "Creamy Garlic Truffle Pasta",
          cuisine: "Italian",
          cookingTime: "25 min",
          difficulty: "Easy",
          ingredients: [
            { name: "Pasta", quantity: "200g" },
            { name: "Truffle Oil", quantity: "1 tbsp" },
          ],
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.recipe) {
        throw new Error(`Save recipe failed: ${JSON.stringify(saveData)}`);
      }
      console.log("✓ Saved recipe created:", saveData.recipe.name);

      const getSavedRes = await fetch(`${BASE}/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const getSavedData = await getSavedRes.json();
      if (getSavedData.recipes.length !== 1) {
        throw new Error(`Expected 1 saved recipe, got ${getSavedData.recipes.length}`);
      }
      console.log("✓ Retrieved saved recipes:", getSavedData.recipes[0].name);

      const deleteRes = await fetch(
        `${BASE}/saved/${encodeURIComponent("Creamy Garlic Truffle Pasta")}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const deleteData = await deleteRes.json();
      if (!deleteRes.ok) {
        throw new Error(`Delete failed: ${JSON.stringify(deleteData)}`);
      }
      console.log("✓ Recipe successfully removed from saved");

      console.log("--> Testing 5: Community posts and interactions");
      const postRes = await fetch(`${BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: "Handmade tagliatelle with wild chanterelles! 🍄",
          tags: ["Pasta", "Dinner"],
        }),
      });
      const postData = await postRes.json();
      if (!postRes.ok || !postData.post) {
        throw new Error(`Post creation failed: ${JSON.stringify(postData)}`);
      }
      console.log("✓ Created community post:", postData.post.text);
      const postId = postData.post.id;

      // Like
      const likeRes = await fetch(`${BASE}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const likeData = await likeRes.json();
      if (!likeData.liked || likeData.likes !== 1) {
        throw new Error(`Like failed: ${JSON.stringify(likeData)}`);
      }
      console.log("✓ Toggled like on post:", likeData.likes, "like");

      // Comment
      const commentRes = await fetch(`${BASE}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: "Recipe please!" }),
      });
      const commentData = await commentRes.json();
      if (!commentData.comment) {
        throw new Error(`Comment failed: ${JSON.stringify(commentData)}`);
      }
      console.log("✓ Added comment to post:", commentData.comment.text);

      console.log("--> Testing 6: Recents API");
      const addRecentRes = await fetch(`${BASE}/recents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: "lemon, garlic",
          recipeName: "Lemon Garlic Shrimp",
        }),
      });
      const addRecentData = await addRecentRes.json();
      if (!addRecentRes.ok) {
        throw new Error(`Add recent failed: ${JSON.stringify(addRecentData)}`);
      }
      console.log("✓ Added to discovery history");

      const getRecentsRes = await fetch(`${BASE}/recents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const getRecentsData = await getRecentsRes.json();
      if (getRecentsData.recents.length !== 1) {
        throw new Error(`Expected 1 recent item, got ${getRecentsData.recents.length}`);
      }
      console.log("✓ Fetched recents:", getRecentsData.recents[0].recipeName);

      // Cleanup
      await User.deleteOne({ email: testEmail });
      await SavedRecipe.deleteMany({ user: regData.user._id });
      await Post.deleteOne({ _id: postId });
      await Recent.deleteMany({ user: regData.user._id });

      console.log("\n>>> ALL INTEGRATION TESTS PASSED! SUCCESS! <<<");
    } catch (e) {
      console.error("Test error:", e);
      process.exitCode = 1;
    } finally {
      server.close();
      await mongoose.disconnect();
    }
  });
}

runE2E();
