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
 * Return an authentic, natural photograph matching the dish keywords and index
 */
export function getImageForRecipe(recipeName = "", cuisine = "", ingredients = [], index = 0) {
  const ingStr = Array.isArray(ingredients)
    ? ingredients.map((i) => (typeof i === "string" ? i : i.name || "")).join(" ")
    : "";
  const combined = `${recipeName} ${cuisine} ${ingStr}`.toLowerCase();

  // 1. Potato / Aloo dishes
  if (combined.includes("potato") || combined.includes("potatoes") || combined.includes("aloo")) {
    const potatoImages = [
      "/crispy_chili_potatoes.jpg",
      "/roasted_potato_wedges.jpg",
      "https://images.unsplash.com/photo-1518013034458-30b0ee243591?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
    ];
    // Always assign index-differentiated photos so dishes never duplicate
    return potatoImages[index % potatoImages.length];
  }

  // 2. Chicken & Rice
  if (combined.includes("chicken") && combined.includes("rice")) {
    const chickenRiceImages = [
      "/garlic_chicken_rice.jpg",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    ];
    return chickenRiceImages[index % chickenRiceImages.length];
  }

  // 3. Fried Rice / Egg & Rice
  if (combined.includes("fried rice") || (combined.includes("egg") && combined.includes("rice"))) {
    const eggRiceImages = [
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80",
    ];
    return eggRiceImages[index % eggRiceImages.length];
  }

  // 4. Pasta dishes
  if (combined.includes("pasta") || combined.includes("spaghetti") || combined.includes("penne") || combined.includes("fettuccine") || combined.includes("noodle")) {
    const pastaImages = [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    ];
    return pastaImages[index % pastaImages.length];
  }

  // 5. Chicken dishes
  if (combined.includes("chicken")) {
    const chickenImages = [
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
    ];
    return chickenImages[index % chickenImages.length];
  }

  // 6. Fish / Seafood
  if (combined.includes("salmon") || combined.includes("fish") || combined.includes("tuna") || combined.includes("seafood") || combined.includes("shrimp")) {
    const seafoodImages = [
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    ];
    return seafoodImages[index % seafoodImages.length];
  }

  // 7. Beef / Steak
  if (combined.includes("steak") || combined.includes("beef") || combined.includes("meat")) {
    const beefImages = [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    ];
    return beefImages[index % beefImages.length];
  }

  // 8. Soup / Stew / Broth
  if (combined.includes("soup") || combined.includes("stew") || combined.includes("broth")) {
    const soupImages = [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    ];
    return soupImages[index % soupImages.length];
  }

  // 9. Curry / Masala
  if (combined.includes("curry") || combined.includes("tikka") || combined.includes("masala")) {
    const curryImages = [
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    ];
    return curryImages[index % curryImages.length];
  }

  // 10. Salad / Greens / Vegetarian
  if (combined.includes("salad") || combined.includes("lettuce") || combined.includes("spinach") || combined.includes("veggie") || combined.includes("vegetable")) {
    const saladImages = [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    ];
    return saladImages[index % saladImages.length];
  }

  // 11. Egg / Breakfast / Toast
  if (combined.includes("egg") || combined.includes("omelet") || combined.includes("breakfast") || combined.includes("toast")) {
    const eggImages = [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    ];
    return eggImages[index % eggImages.length];
  }

  // Diverse natural culinary fallbacks (guaranteed distinct per index)
  const fallbacks = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
  ];
  return fallbacks[index % fallbacks.length];
}
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
  const hasPotato = p.includes("potato") || p.includes("potatoes") || p.includes("aloo");

  const recipes = [];

  // Recipe 1
  if (hasPotato) {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: "Crispy Pan-Seared Chili Potatoes",
      cuisine: "Homestyle Skillet",
      description:
        "Golden diced potatoes shallow-seared until delightfully crunchy on the outside and tender inside, seasoned with chili powder, sea salt, and fresh herbs.",
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "3 medium, peeled and diced into 1/2-inch cubes" },
        { name: "Cooking Oil", quantity: "3 tbsp" },
        { name: "Chili Powder", quantity: "1.5 tsp" },
        { name: "Coarse Salt", quantity: "1 tsp" },
        { name: "Fresh Parsley or Cilantro", quantity: "Chopped, for garnish" },
      ],
      steps: [
        "Peel and dice the potatoes into uniform cubes. Pat thoroughly dry with a paper towel for maximum crunch.",
        "Heat 2 tbsp oil in a wide skillet over medium-high heat until shimmering.",
        "Add diced potatoes in a single layer. Let sear undisturbed for 4-5 minutes until golden on the bottom.",
        "Flip and sauté for another 7-8 minutes, stirring occasionally until crispy and fork-tender.",
        "Reduce heat to low, drizzle the remaining oil, sprinkle chili powder and salt, tossing for 60 seconds to coat evenly without scorching.",
        "Transfer to a bowl and garnish with fresh herbs. Serve piping hot.",
      ],
      tips: [
        "Drying the potatoes completely before cooking guarantees a crunchy exterior.",
        "A squeeze of fresh lemon or lime balances the chili heat wonderfully.",
      ],
      image: "/crispy_chili_potatoes.jpg",
    });
  } else if (hasChicken && hasRice) {
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
  } else if (hasEgg && (p.includes("bread") || p.includes("toast"))) {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: "Artisan Smashed Egg & Butter Toast",
      cuisine: "Café Breakfast",
      description:
        "Thick golden toasted bread buttered to perfection, topped with soft-cooked seasoned eggs, cracked black pepper, and herbs.",
      cookingTime: "10 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Bread", quantity: "2 thick slices (sourdough or brioche)" },
        { name: "Eggs", quantity: "2 large" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Salt & Cracked Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Melt 1 tbsp butter in a skillet over medium heat. Toast bread slices on both sides until golden and crisp.",
        "Melt remaining butter in the skillet, crack eggs in, and cook sunny-side-up or soft-scrambled.",
        "Layer the warm eggs on top of the buttery toast and season with coarse salt and pepper.",
      ],
      tips: [
        "Toast slowly over medium-low heat with plenty of butter for that bakery-style crunch.",
      ],
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    });
  } else if (p.includes("salmon") || p.includes("fish")) {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: "Pan-Seared Lemon Butter Salmon",
      cuisine: "Coastal Skillet",
      description:
        "Crispy-skinned tender salmon fillets basted in luscious lemon garlic butter with fresh cracked pepper.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Salmon Fillet", quantity: "2 portions (approx. 150g each)" },
        { name: "Butter or Olive Oil", quantity: "2 tbsp" },
        { name: "Garlic", quantity: "2 cloves, minced" },
        { name: "Lemon", quantity: "1/2, juiced" },
        { name: "Salt & Pepper", quantity: "To taste" },
      ],
      steps: [
        "Pat salmon completely dry and season flesh with salt and pepper.",
        "Heat skillet with oil on medium-high until hot. Sear salmon skin-side down for 4-5 minutes until crispy.",
        "Flip, add butter, garlic, and lemon juice. Baste salmon with the foaming butter for 3-4 minutes until cooked through.",
      ],
      tips: [
        "Basting with foaming butter keeps the fish exceptionally moist and flavorful.",
      ],
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    });
  } else if (p.includes("beef") || p.includes("steak")) {
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      recipeName: "Garlic Butter Seared Beef Skillet",
      cuisine: "Steakhouse",
      description:
        "Juicy bite-sized beef seared hot and fast in garlic herb butter with caramelized edges.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Beef / Steak", quantity: "300g, cut into bite-sized cubes" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Salt & Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Season beef cubes generously with salt and coarse pepper.",
        "Get skillet searing hot with 1 tbsp oil. Cook beef in a single layer for 3-4 minutes until nicely browned.",
        "Add butter and minced garlic during the final minute, tossing constantly.",
        "Remove from heat immediately and rest 3 minutes before serving.",
      ],
      tips: [
        "Keep the heat high and pan hot so the beef sears quickly without turning tough.",
      ],
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
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

  // Recipe 2 (Potato, Egg/Rice, or Skillet Option)
  if (hasPotato) {
    recipes.push({
      id: `recipe-${Date.now()}-2`,
      recipeName: "Herb-Roasted Garlic & Chili Potato Wedges",
      cuisine: "Rustic Oven / Skillet",
      description:
        "Oven-roasted thick potato wedges seasoned with aromatic herbs, crushed garlic, and a touch of fiery chili for a savory, crispy edge.",
      cookingTime: "30 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "3 large, scrubbed & cut into thick wedges" },
        { name: "Cooking Oil or Olive Oil", quantity: "2.5 tbsp" },
        { name: "Chili Powder or Paprika", quantity: "1 tsp" },
        { name: "Garlic", quantity: "3 cloves, minced or crushed" },
        { name: "Dried Rosemary or Oregano", quantity: "1 tsp" },
        { name: "Sea Salt & Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Preheat oven or heavy skillet to 400°F (200°C).",
        "Toss the potato wedges with oil, chili powder, crushed garlic, dried herbs, and sea salt in a large bowl.",
        "Arrange wedges cut-side down in a single layer so they brown evenly without steaming.",
        "Roast for 25-30 minutes, turning halfway through, until deep golden brown and crispy.",
        "Serve hot with garlic dip, ketchup, or sour cream.",
      ],
      tips: [
        "Leave the skin on the potatoes for rustic texture and extra crispiness.",
        "Ensure wedges don't overlap on the baking sheet so they roast evenly.",
      ],
      image: "/roasted_potato_wedges.jpg",
    });
  } else if (hasEgg || hasRice) {
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

  const enrichedRecipes = recipes.map((r, index) => ({
    ...r,
    image: r.image || getImageForRecipe(r.recipeName, r.cuisine, r.ingredients, index),
  }));

  return {
    type: "recipes",
    recipes: enrichedRecipes,
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
        image:
          recipe.image ||
          getImageForRecipe(
            recipe.recipeName,
            recipe.cuisine,
            recipe.ingredients,
            index
          ),
      }));
    }

    return parsed;
  } catch {
    return generateFallbackRecipes(prompt);
  }
}
