import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

process.env.NODE_ENV = "test";
import app from "./server.js";
import User from "./models/User.js";
import SavedRecipe from "./models/SavedRecipe.js";
import Post from "./models/Post.js";
import Recent from "./models/Recent.js";

async function runTests() {
  const dbUrl = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!dbUrl) {
    console.error("MONGODB_URI is missing in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(dbUrl);
  console.log("✓ Connected to MongoDB for testing");

  const testEmail = `test_chef_${Date.now()}@flavorfusion.test`;
  const testPassword = "Password123!";
  const TEST_PORT = 5099;

  const server = app.listen(TEST_PORT, async () => {
    try {
      const BASE = `http://localhost:${TEST_PORT}/api`;
      let refreshCookie = "";
      let accessToken = "";
      let testUserId = "";

      console.log("\n--- TEST 1: Register validation and creation ---");
      // Test invalid email
      const badEmailRes = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Chef",
          email: "invalid-email",
          password: testPassword,
        }),
      });
      const badEmailData = await badEmailRes.json();
      if (badEmailRes.status !== 400 || badEmailData.success !== false) {
        throw new Error(
          `Expected 400 for bad email, got ${badEmailRes.status}`,
        );
      }
      console.log(
        "✓ Invalid email rejected with 400 and consistent error JSON",
      );

      // Test valid register
      const regRes = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Chef",
          email: testEmail,
          password: testPassword,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.accessToken || regData.success !== true) {
        throw new Error(`Register failed: ${JSON.stringify(regData)}`);
      }
      accessToken = regData.accessToken;
      testUserId = regData.user._id || regData.user.id;
      const setCookieHeader = regRes.headers.get("set-cookie");
      if (!setCookieHeader || !setCookieHeader.includes("refreshToken=")) {
        throw new Error("Expected set-cookie with refreshToken");
      }
      refreshCookie = setCookieHeader.split(";")[0];
      console.log(
        "✓ Registered successfully, received accessToken and httpOnly refreshToken cookie",
      );

      console.log("\n--- TEST 2: Login flow ---");
      const loginRes = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const loginData = await loginRes.json();
      if (
        !loginRes.ok ||
        loginData.success !== true ||
        !loginData.accessToken
      ) {
        throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
      }
      accessToken = loginData.accessToken;
      refreshCookie = loginRes.headers.get("set-cookie").split(";")[0];
      console.log("✓ Login succeeded, access token updated");

      console.log("\n--- TEST 3: Silent Refresh Token Rotation ---");
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: refreshCookie,
        },
      });
      const refreshData = await refreshRes.json();
      if (
        !refreshRes.ok ||
        refreshData.success !== true ||
        !refreshData.accessToken
      ) {
        throw new Error(`Refresh failed: ${JSON.stringify(refreshData)}`);
      }
      accessToken = refreshData.accessToken;
      refreshCookie = refreshRes.headers.get("set-cookie").split(";")[0];
      console.log("✓ Refresh token rotated successfully");

      console.log("\n--- TEST 4: Profile /auth/me ---");
      const meRes = await fetch(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const meData = await meRes.json();
      if (
        !meRes.ok ||
        meData.success !== true ||
        meData.user.email !== testEmail
      ) {
        throw new Error(`/auth/me failed: ${JSON.stringify(meData)}`);
      }
      console.log("✓ Current profile fetched successfully:", meData.user.email);

      console.log("\n--- TEST 5: Saved Recipes CRUD ---");
      // Unauthenticated rejected
      const unauthSaveRes = await fetch(`${BASE}/saved`);
      if (unauthSaveRes.status !== 401) {
        throw new Error(
          `Expected 401 for unauthenticated /saved, got ${unauthSaveRes.status}`,
        );
      }
      console.log("✓ Unauthenticated /saved correctly rejected with 401");

      // Save recipe
      const saveRes = await fetch(`${BASE}/saved`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipeName: "Crispy Garlic Chili Potatoes",
          cuisine: "Homestyle",
          cookingTime: "20 min",
          difficulty: "Easy",
          ingredients: [
            { name: "Potatoes", quantity: "3" },
            { name: "Garlic", quantity: "2 cloves" },
          ],
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || saveData.success !== true || !saveData.recipe) {
        throw new Error(`Save recipe failed: ${JSON.stringify(saveData)}`);
      }
      console.log("✓ Saved recipe created:", saveData.recipe.name);

      // Get saved recipes
      const getSavedRes = await fetch(`${BASE}/saved`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const getSavedData = await getSavedRes.json();
      if (!getSavedRes.ok || getSavedData.recipes.length !== 1) {
        throw new Error(
          `Expected 1 saved recipe, got ${getSavedData.recipes?.length}`,
        );
      }
      console.log("✓ Fetched saved collection:", getSavedData.recipes[0].name);

      // Delete saved recipe
      const deleteSaveRes = await fetch(
        `${BASE}/saved/${encodeURIComponent("Crispy Garlic Chili Potatoes")}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const deleteSaveData = await deleteSaveRes.json();
      if (!deleteSaveRes.ok || deleteSaveData.success !== true) {
        throw new Error(
          `Delete saved recipe failed: ${JSON.stringify(deleteSaveData)}`,
        );
      }
      console.log("✓ Recipe deleted from collection");

      console.log("\n--- TEST 6: Community Posts & Interactivity ---");
      // Create post
      const createPostRes = await fetch(`${BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          text: "Fresh sourdough focaccia with rosemary and sea salt! 🍞",
          recipeLink: "https://example.com/focaccia",
          tags: ["Baking", "Bread"],
        }),
      });
      const createPostData = await createPostRes.json();
      if (
        !createPostRes.ok ||
        createPostData.success !== true ||
        !createPostData.post
      ) {
        throw new Error(
          `Create post failed: ${JSON.stringify(createPostData)}`,
        );
      }
      const postId = createPostData.post.id;
      console.log("✓ Community post created:", createPostData.post.text);

      // Like post
      const likeRes = await fetch(`${BASE}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const likeData = await likeRes.json();
      if (!likeRes.ok || likeData.success !== true || likeData.likes !== 1) {
        throw new Error(`Like post failed: ${JSON.stringify(likeData)}`);
      }
      console.log("✓ Liked post successfully. Likes count:", likeData.likes);

      // Comment on post
      const commentRes = await fetch(`${BASE}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text: "That crust looks incredible!" }),
      });
      const commentData = await commentRes.json();
      if (
        !commentRes.ok ||
        commentData.success !== true ||
        !commentData.comment
      ) {
        throw new Error(`Comment failed: ${JSON.stringify(commentData)}`);
      }
      console.log("✓ Added comment to post:", commentData.comment.text);

      // Toggle save post
      const savePostRes = await fetch(`${BASE}/posts/${postId}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const savePostData = await savePostRes.json();
      if (
        !savePostRes.ok ||
        savePostData.success !== true ||
        !savePostData.saved
      ) {
        throw new Error(
          `Save post toggle failed: ${JSON.stringify(savePostData)}`,
        );
      }
      console.log("✓ Post saved to user collection");

      // Delete post
      const deletePostRes = await fetch(`${BASE}/posts/${postId}`, {
        method: "DELETE",
      });
      const deletePostData = await deletePostRes.json();
      if (!deletePostRes.ok || deletePostData.success !== true) {
        throw new Error(`Delete post failed: ${JSON.stringify(deletePostData)}`);
      }
      console.log("✓ Community post deleted successfully via DELETE /api/posts/:id");

      // Verify post is gone
      const verifyPostRes = await fetch(`${BASE}/posts`);
      const verifyPostData = await verifyPostRes.json();
      const stillExists = (verifyPostData.posts || []).some(
        (p) => String(p.id || p._id) === String(postId)
      );
      if (stillExists) {
        throw new Error("Post still exists in feed after deletion!");
      }
      console.log("✓ Verified post no longer exists in community feed");

      console.log("\n--- TEST 7: Recents API ---");
      const addRecentRes = await fetch(`${BASE}/recents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: "potatoes, garlic",
          recipeName: "Crispy Pan-Seared Chili Potatoes",
        }),
      });
      const addRecentData = await addRecentRes.json();
      if (!addRecentRes.ok || addRecentData.success !== true) {
        throw new Error(`Add recent failed: ${JSON.stringify(addRecentData)}`);
      }
      console.log("✓ Recent search added");

      const getRecentsRes = await fetch(`${BASE}/recents`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const getRecentsData = await getRecentsRes.json();
      if (!getRecentsRes.ok || getRecentsData.recents.length !== 1) {
        throw new Error(
          `Expected 1 recent search, got ${getRecentsData.recents?.length}`,
        );
      }
      console.log("✓ Fetched recents:", getRecentsData.recents[0].recipeName);

      // Clean up test data
      await User.deleteOne({ email: testEmail });
      await SavedRecipe.deleteMany({ user: testUserId });
      await Post.deleteOne({ _id: postId });
      await Recent.deleteMany({ user: testUserId });

      console.log("\n==============================================");
      console.log("🎉 ALL BACKEND INTEGRATION TESTS PASSED 100%!");
      console.log("==============================================\n");
    } catch (testErr) {
      console.error("\n❌ TEST FAILED:", testErr);
      process.exitCode = 1;
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(process.exitCode || 0);
    }
  });
}

runTests();
