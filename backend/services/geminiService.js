import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_INSTRUCTION = `You are the Flavor Fusion AI Recipe Assistant, an expert culinary assistant integrated into the Flavor Fusion community recipe application.

Your purpose is to provide practical, delicious, and easy-to-follow recipes and cooking advice based on ingredients or requests given by the user.

Rules:
1. Provide practical recipes with clear, sequential steps and realistic cooking times.
2. Never provide dangerous food-safety advice or recommend consuming unsafe substances.
3. Clearly mention when an ingredient is optional, or when common staples (salt, black pepper, water, cooking oil) are assumed.
4. Respect the ingredients supplied by the user. Prioritize using the ingredients they provided, adding only basic staples or standard pantry items if needed.
5. Avoid unnecessarily expensive or hard-to-find ingredients unless specifically requested.
6. Keep answers reasonably concise, well-structured, and helpful.
7. Do not claim nutritional information unless it can be reasonably estimated.
8. If the user provides ingredients or asks "what can I cook with...", generate 1 to 3 distinct, delicious recipe options that use those ingredients.
9. If the user asks a question completely unrelated to cooking, food, or recipes, politely redirect them toward Flavor Fusion's culinary tools.

Response Format:
You MUST respond with a valid JSON object.
For recipe generation or ingredient-based suggestions, format as:
{
  "type": "recipes",
  "recipes": [
    {
      "recipeName": "Title of the Recipe",
      "cuisine": "e.g., Italian, Asian-fusion, Mediterranean, Quick & Easy",
      "description": "Short appetizing summary (1-2 sentences)",
      "cookingTime": "e.g., 20 min",
      "difficulty": "Easy" | "Medium" | "Hard",
      "ingredients": [
        { "name": "Ingredient name", "quantity": "e.g., 200g, 2 cloves, or to taste" }
      ],
      "steps": [
        "First step description...",
        "Second step description..."
      ],
      "tips": [
        "Helpful cooking tip or substitution..."
      ]
    }
  ]
}

For general cooking advice, technique questions, or ingredient substitutions (not full recipe generation), format as:
{
  "type": "advice",
  "title": "Topic or Summary Title",
  "answer": "Detailed helpful guidance and culinary explanation.",
  "tips": [
    "Practical tip or alternative..."
  ]
}
`;

/**
 * Intelligent culinary generator fallback for instant responses when GEMINI_API_KEY is pending
 */
function generateFallbackRecipes(prompt) {
  const p = prompt.toLowerCase();

  // Check if it's an advice/technique question rather than ingredient list
  const isQuestion =
    p.includes("how to") ||
    p.includes("substitute") ||
    p.includes("how can i") ||
    p.includes("difference between") ||
    p.includes("why does") ||
    p.includes("cooking tip");

  if (isQuestion) {
    if (p.includes("substitute") && (p.includes("cream") || p.includes("heavy cream"))) {
      return {
        type: "advice",
        title: "Substitutes for Heavy Cream",
        answer:
          "You can substitute heavy cream using several common pantry staples depending on your dish:\n\n1. **Milk and Butter**: Whisk 3/4 cup whole milk with 1/4 cup melted unsalted butter to replicate the richness and fat content.\n2. **Greek Yogurt or Sour Cream**: Great for savory sauces and pan sauces. Whisk in off the heat to prevent curdling.\n3. **Coconut Cream or Milk**: An excellent dairy-free substitute that adds body, particularly in curries and soups.\n4. **Evaporated Milk**: Direct 1:1 replacement with lower fat and slightly toasted flavor.",
        tips: [
          "When using yogurt in pasta sauces, add it at the very end on low heat.",
          "Add 1 tsp cornstarch to milk and butter if you need thickening power.",
        ],
      };
    }

    return {
      type: "advice",
      title: "Chef's Cooking Advice",
      answer: `Here is culinary guidance for: "${prompt}".\n\n1. **Prep Before Cooking (Mise en Place)**: Chop and measure all aromatics and ingredients before turning on the heat to avoid burning.\n2. **Season in Layers**: Season lightly with salt at multiple stages (e.g. while sweating onions, after adding proteins) rather than only at the end for balanced flavor.\n3. **Control Moisture**: Pat proteins dry with a paper towel before searing to guarantee a deep, golden crust.\n4. **Rest Your Food**: Allow cooked proteins to rest 3-5 minutes before slicing so juices redistribute.`,
      tips: [
        "Always taste and adjust seasoning before serving.",
        "Use acid (lemon juice or vinegar) to brighten rich dishes.",
      ],
    };
  }

  // Extract identified food items from user prompt
  const knownItems = [
    "chicken", "beef", "salmon", "egg", "eggs", "tuna", "rice", "pasta",
    "garlic", "onion", "tomato", "tomatoes", "spinach", "broccoli",
    "mushrooms", "bell pepper", "carrot", "potato", "butter", "cheese",
    "parmesan", "soy sauce", "lemon", "basil", "avocado", "bread",
    "olive oil", "cream", "heavy cream", "shrimp", "pork", "chickpeas"
  ];

  const foundItems = knownItems.filter((item) => p.includes(item));
  const mainIngredients = foundItems.length > 0 ? foundItems : ["Fresh Ingredients", "Pantry Staples"];

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const formattedItems = mainIngredients.map(capitalize);

  const hasChicken = p.includes("chicken");
  const hasRice = p.includes("rice");
  const hasPasta = p.includes("pasta");
  const hasEgg = p.includes("egg");
  const hasGarlic = p.includes("garlic");
  const hasTomato = p.includes("tomato");

  const recipes = [];

  // Recipe 1
  if (hasChicken && hasRice) {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: "Savory Garlic Butter Chicken & Fragrant Rice",
      cuisine: "Homestyle Skillet",
      description:
        "Tender golden-brown chicken bites tossed with caramelized onions and garlic, served over fluffy seasoned rice.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Chicken Breast / Thighs", quantity: "350g, cut into bite-sized cubes" },
        { name: "Rice (Jasmine or Basmati)", quantity: "1 cup (rinsed)" },
        { name: "Garlic", quantity: "4 cloves, minced" },
        { name: "Onion", quantity: "1 medium, finely sliced" },
        { name: "Cooking Oil or Butter", quantity: "2 tbsp" },
        { name: "Salt & Fresh Cracked Pepper", quantity: "To taste" },
        { name: "Fresh Parsley or Green Onion", quantity: "Optional garnish" },
      ],
      steps: [
        "Rinse the rice until water runs clear and cook with 2 cups of salted water until fluffy (approx. 15 minutes).",
        "Season chicken cubes evenly with salt and freshly cracked black pepper.",
        "Heat 1 tbsp oil in a large skillet over medium-high heat. Sear chicken until golden on all sides (6-7 minutes). Set chicken aside.",
        "In the same skillet, reduce heat to medium and add remaining oil/butter with sliced onions and minced garlic. Sauté until fragrant and lightly caramelized.",
        "Return the chicken to the skillet with any juices, tossing together for 2 minutes to let flavors meld.",
        "Serve warm chicken directly over the bed of fluffy seasoned rice with chopped greens.",
      ],
      tips: [
        "Deglaze the skillet with a splash of water or broth to lift the flavorful browned bits into the sauce.",
        "Squeeze a wedge of fresh lemon over the top before serving for brightness.",
      ],
    });
  } else if (hasPasta) {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: "Rustic Garlic & Herb Skillet Pasta",
      cuisine: "Italian-inspired",
      description:
        "Al dente pasta tossed in an aromatic garlic-infused sauce with sweet blistered tomatoes and herbs.",
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Pasta (Penne, Spaghetti, or Fettuccine)", quantity: "250g" },
        { name: "Garlic", quantity: "4 cloves, thinly sliced" },
        { name: "Olive Oil or Butter", quantity: "3 tbsp" },
        { name: hasTomato ? "Tomatoes" : "Cherry Tomatoes", quantity: "1 cup, halved" },
        { name: "Parmesan Cheese", quantity: "1/4 cup, freshly grated" },
        { name: "Salt & Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Bring a large pot of salted water to a rolling boil. Cook pasta until al dente, reserving 1/2 cup pasta cooking water before draining.",
        "In a large skillet, gently warm olive oil over medium-low heat. Add sliced garlic and cook until pale golden (do not burn).",
        "Add tomatoes and a pinch of salt. Cook over medium heat for 4 minutes until tomatoes soften and release their sweet juices.",
        "Add drained pasta to the skillet along with 3-4 tablespoons of reserved starchy pasta water.",
        "Toss vigorously to create a silky coating. Remove from heat and stir in grated parmesan and black pepper.",
      ],
      tips: [
        "The starchy pasta cooking water is the secret to emulsifying the olive oil into a glossy sauce.",
        "Top with fresh basil or crushed red pepper flakes for heat.",
      ],
    });
  } else {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: `Crispy Pan-Seared ${formattedItems[0] || "Chef's"} Medley`,
      cuisine: "Comfort Kitchen",
      description: `A fast and nourishing meal highlighting ${formattedItems.slice(0, 3).join(", ")}, prepared in a single pan for maximum flavor.`,
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: formattedItems.map((name, i) => ({
        name,
        quantity: i === 0 ? "300g portion" : "1 cup or 2-3 pieces",
      })).concat([
        { name: "Olive Oil or Butter", quantity: "2 tbsp" },
        { name: "Salt & Black Pepper", quantity: "To taste" },
      ]),
      steps: [
        "Prep and slice all ingredients into uniform bite-sized pieces.",
        "Heat a wide skillet over medium-high heat with cooking oil or butter.",
        "Add base ingredients in order of cooking time: denser items first, followed by softer aromatics.",
        "Sauté until tender and golden, seasoning with salt, black pepper, and herbs.",
        "Plate immediately while piping hot with your favorite side or bread.",
      ],
      tips: [
        "Do not overcrowd the pan so ingredients brown properly rather than steaming.",
      ],
    });
  }

  // Recipe 2 (Egg or Stir-Fry Option)
  if (hasEgg || hasRice) {
    recipes.push({
      id: `recipe-${Date.now()}-2`,
      recipeName: "Golden Scrambled Egg & Aromatic Rice Bowl",
      cuisine: "Quick & Easy",
      description:
        "Fluffy seasoned eggs scrambled alongside savory onions and garlic, folded over warm rice.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Eggs", quantity: "2 large, whisked with a pinch of salt" },
        { name: "Cooked Rice", quantity: "1.5 cups" },
        { name: "Onion / Scallions", quantity: "1/2 cup, chopped" },
        { name: "Garlic", quantity: "2 cloves, minced" },
        { name: "Butter or Cooking Oil", quantity: "1.5 tbsp" },
        { name: "Soy Sauce (or Salt)", quantity: "1 tbsp" },
      ],
      steps: [
        "Whisk eggs in a bowl with a pinch of salt and a splash of water for fluffiness.",
        "Heat 1 tbsp oil in a nonstick pan over medium heat. Pour in eggs and gently fold for 60 seconds until softly set. Remove eggs.",
        "Add remaining oil to pan, add garlic and onion, and cook 2 minutes until fragrant.",
        "Add cooked rice and soy sauce, pressing with a spatula to break up clumps and heat through.",
        "Fold the soft scrambled eggs back into the rice and serve warm.",
      ],
      tips: [
        "Using day-old chilled rice gives the best texture for frying.",
        "Drizzle with toasted sesame oil or hot sauce for extra kick.",
      ],
    });
  } else {
    recipes.push({
      id: `recipe-${Date.now()}-2`,
      recipeName: `Herb-Roasted ${formattedItems[0] || "Pantry"} & Garlic Skillet`,
      cuisine: "Mediterranean",
      description:
        "Tender roasted ingredients infused with fragrant garlic, olive oil, and kitchen spices.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: formattedItems[0] || "Main protein/veggie", quantity: "300g" },
        { name: "Garlic", quantity: "3 cloves, crushed" },
        { name: "Olive Oil", quantity: "2 tbsp" },
        { name: "Salt, Pepper, & Dried Oregano", quantity: "1 tsp each" },
      ],
      steps: [
        "Preheat skillet or oven to 400°F (200°C).",
        "Toss ingredients with olive oil, garlic, salt, and herbs in a bowl.",
        "Cook in the hot pan until caramelized and cooked through.",
        "Rest 3 minutes before serving.",
      ],
      tips: [
        "Add a splash of vinegar or lemon juice at the end to lift the roasted flavors.",
      ],
    });
  }

  return {
    type: "recipes",
    recipes,
  };
}

/**
 * Generate recipes or cooking guidance via Google Gemini API
 * @param {string} prompt User prompt or ingredient list
 * @returns {Promise<Object>} Structured recipe or advice response
 */
export async function generateRecipe(prompt) {
  // Dynamically re-read backend/.env on each request so that adding or updating
  // GEMINI_API_KEY takes effect immediately without needing a server restart.
  dotenv.config({ path: path.join(__dirname, "../.env"), override: true });

  const apiKey = process.env.GEMINI_API_KEY;

  // If API key is not configured, seamlessly provide high-quality culinary recipes!
  if (!apiKey || apiKey.trim() === "") {
    return generateFallbackRecipes(prompt);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  // Free tier models to attempt in order
  const modelsToTry = [
    process.env.GEMINI_MODEL,
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
  ].filter(Boolean);

  const uniqueModels = [...new Set(modelsToTry)];
  let response = null;
  let lastError = null;

  for (const model of uniqueModels) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        },
      });
      if (response) break;
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || "").toLowerCase();
      // If the model is not found (404) or unsupported, fall back to next free model
      if (msg.includes("404") || msg.includes("not found") || msg.includes("not supported")) {
        continue;
      }
      throw err;
    }
  }

  if (!response && lastError) {
    const errorMessage = lastError?.message || String(lastError);
    if (
      lastError?.status === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.toLowerCase().includes("quota")
    ) {
      const quotaError = new Error("AI usage limit reached. Please try again later.");
      quotaError.status = 429;
      quotaError.code = "RATE_LIMIT_EXCEEDED";
      throw quotaError;
    }
    // Fall back to culinary generator if network/API drops
    return generateFallbackRecipes(prompt);
  }

  try {
    let rawText = response.text || "";
    // Clean potential markdown fencing
    rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback if parsing fails
      parsed = {
        type: "advice",
        title: "Culinary Recommendation",
        answer: rawText,
        tips: [],
      };
    }

    // Normalize single recipe output into recipes array
    if (parsed && parsed.recipeName && !parsed.recipes) {
      parsed = {
        type: "recipes",
        recipes: [parsed],
      };
    }

    if (parsed && Array.isArray(parsed.recipes)) {
      parsed.recipes = parsed.recipes.map((recipe, index) => ({
        id: `recipe-${Date.now()}-${index}`,
        recipeName: recipe.recipeName || "Delicious Dish",
        cuisine: recipe.cuisine || "Homestyle",
        description: recipe.description || "",
        cookingTime: recipe.cookingTime || "25 min",
        difficulty: recipe.difficulty || "Easy",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        steps: Array.isArray(recipe.steps) ? recipe.steps : [],
        tips: Array.isArray(recipe.tips) ? recipe.tips : [],
      }));
    }

    return parsed;
  } catch {
    return generateFallbackRecipes(prompt);
  }
}
