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
export function getImageForRecipe(
  recipeName = "",
  cuisine = "",
  ingredients = [],
  index = 0,
) {
  const ingStr = Array.isArray(ingredients)
    ? ingredients
        .map((i) => (typeof i === "string" ? i : i.name || ""))
        .join(" ")
    : "";
  const combined = `${recipeName} ${cuisine} ${ingStr}`.toLowerCase();

  // 1. Potato / Aloo dishes
  if (
    combined.includes("potato") ||
    combined.includes("potatoes") ||
    combined.includes("aloo")
  ) {
    const potatoImages = [
      "/crispy_chili_potatoes.jpg",
      "/roasted_potato_wedges.jpg",
      "https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?auto=format&fit=crop&w=800&q=80",
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
  if (
    combined.includes("fried rice") ||
    (combined.includes("egg") && combined.includes("rice"))
  ) {
    const eggRiceImages = [
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80",
    ];
    return eggRiceImages[index % eggRiceImages.length];
  }

  // 4. Pasta dishes
  if (
    combined.includes("pasta") ||
    combined.includes("spaghetti") ||
    combined.includes("penne") ||
    combined.includes("fettuccine") ||
    combined.includes("noodle")
  ) {
    const pastaImages = [
      "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
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
  if (
    combined.includes("salmon") ||
    combined.includes("fish") ||
    combined.includes("tuna") ||
    combined.includes("seafood") ||
    combined.includes("shrimp")
  ) {
    const seafoodImages = [
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    ];
    return seafoodImages[index % seafoodImages.length];
  }

  // 7. Beef / Steak
  if (
    combined.includes("steak") ||
    combined.includes("beef") ||
    combined.includes("meat")
  ) {
    const beefImages = [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    ];
    return beefImages[index % beefImages.length];
  }

  // 8. Soup / Stew / Broth
  if (
    combined.includes("soup") ||
    combined.includes("stew") ||
    combined.includes("broth")
  ) {
    const soupImages = [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    ];
    return soupImages[index % soupImages.length];
  }

  // 9. Curry / Masala
  if (
    combined.includes("curry") ||
    combined.includes("tikka") ||
    combined.includes("masala")
  ) {
    const curryImages = [
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    ];
    return curryImages[index % curryImages.length];
  }

  // 10. Salad / Greens / Vegetarian
  if (
    combined.includes("salad") ||
    combined.includes("lettuce") ||
    combined.includes("spinach") ||
    combined.includes("veggie") ||
    combined.includes("vegetable")
  ) {
    const saladImages = [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    ];
    return saladImages[index % saladImages.length];
  }

  // 11. Egg / Breakfast / Toast
  if (
    combined.includes("egg") ||
    combined.includes("omelet") ||
    combined.includes("breakfast") ||
    combined.includes("toast")
  ) {
    const eggImages = [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    ];
    return eggImages[index % eggImages.length];
  }

  // 12. Mango dishes
  if (combined.includes("mango")) {
    const mangoImages = [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80",
    ];
    return mangoImages[index % mangoImages.length];
  }

  // 13. Fruit / Smoothie / Parfait / Sweet Bowls
  // 13. Apple dishes
  if (combined.includes("apple")) {
    const appleImages = [
      "https://images.unsplash.com/photo-1575549592564-4d50aa43b3af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589462286900-15610446ff76?auto=format&fit=crop&w=800&q=80",
    ];
    return appleImages[index % appleImages.length];
  }

  // 14. Fruit / Smoothie / Parfait / Sweet Bowls
  if (
    combined.includes("smoothie") ||
    combined.includes("parfait") ||
    combined.includes("chia") ||
    combined.includes("oat") ||
    combined.includes("berry") ||
    combined.includes("fruit") ||
    combined.includes("banana") ||
    combined.includes("strawberry")
  ) {
    const fruitImages = [
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589462286900-15610446ff76?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    ];
    return fruitImages[index % fruitImages.length];
  }

  // 14. Avocado dishes
  if (combined.includes("avocado") || combined.includes("guacamole")) {
    return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80";
  }

  // Diverse natural culinary fallbacks (guaranteed distinct per index)
  const fallbacks = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
  ];
  return fallbacks[index % fallbacks.length];
}

/**
 * Check if the prompt appears to contain culinary words, foods, or cooking terms
 */
function isRecognizableFoodQuery(prompt = "") {
  const p = prompt.toLowerCase().trim();
  if (p.length < 3) return false;

  // Single or double random letters
  if (/^[a-z]{1,2}$/i.test(p)) return false;

  // Detect strings with no vowels
  if (!/[aeiouy]/i.test(p)) return false;

  // Obvious keyboard mashing patterns
  if (/\b(asdf|asdfg|qwerty|zxcv|jkl|hjkl|qwer|poiuy|lkjh)\b/i.test(p)) {
    return false;
  }

  // Common culinary terms, categories, and ingredients
  const foodTerms = [
    "potat",
    "aloo",
    "spud",
    "tater",
    "fries",
    "beef",
    "steak",
    "meat",
    "burger",
    "mince",
    "chick",
    "poultry",
    "thigh",
    "breast",
    "wing",
    "egg",
    "omelet",
    "scramble",
    "rice",
    "risotto",
    "grain",
    "quinoa",
    "pasta",
    "spaghetti",
    "penne",
    "noodle",
    "macaroni",
    "fettuccine",
    "linguine",
    "salmon",
    "fish",
    "tuna",
    "shrimp",
    "prawn",
    "seafood",
    "cod",
    "crab",
    "lobster",
    "mushroom",
    "tomato",
    "spinach",
    "greens",
    "kale",
    "lettuce",
    "cabbage",
    "carrot",
    "onion",
    "garlic",
    "ginger",
    "pepper",
    "chili",
    "broccoli",
    "cauliflower",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "feta",
    "butter",
    "milk",
    "cream",
    "yogurt",
    "bread",
    "toast",
    "sandwich",
    "flour",
    "dough",
    "soup",
    "stew",
    "broth",
    "curry",
    "sauce",
    "mango",
    "banana",
    "apple",
    "berry",
    "strawberr",
    "blueberr",
    "raspberr",
    "fruit",
    "avocado",
    "guacamole",
    "lime",
    "lemon",
    "citrus",
    "orange",
    "pineapple",
    "coconut",
    "peach",
    "watermelon",
    "melon",
    "grape",
    "kiwi",
    "papaya",
    "guava",
    "plum",
    "cherry",
    "oat",
    "oatmeal",
    "chia",
    "honey",
    "cinnamon",
    "sugar",
    "sweet",
    "dessert",
    "smoothie",
    "pancake",
    "waffle",
    "parfait",
    "chocolate",
    "vanilla",
    "nut",
    "peanut",
    "almond",
    "walnut",
    "oil",
    "olive",
    "basil",
    "oregano",
    "parsley",
    "cilantro",
    "thyme",
    "rosemary",
    "bean",
    "beans",
    "chickpea",
    "lentil",
    "corn",
    "peas",
    "cucumber",
    "zucchini",
    "eggplant",
    "tofu",
    "bacon",
    "sausage",
    "ham",
    "turkey",
    "pork",
    "lamb",
    "duck",
    "cook",
    "recipe",
    "dish",
    "meal",
    "dinner",
    "lunch",
    "breakfast",
    "bake",
    "fry",
  ];

  return foodTerms.some((term) => p.includes(term));
}

function generateFallbackRecipes(prompt) {
  const p = prompt.toLowerCase().trim();

  // Check if it's an advice/technique question rather than ingredient list
  const isQuestion =
    p.includes("how to") ||
    p.includes("substitute") ||
    p.includes("how can i") ||
    p.includes("difference between") ||
    p.includes("why does") ||
    p.includes("cooking tip");

  // If it is not a culinary question and does not contain recognizable foods, return empty
  if (!isQuestion && !isRecognizableFoodQuery(prompt)) {
    return {
      type: "recipes",
      recipes: [],
    };
  }

  if (isQuestion) {
    if (
      p.includes("substitute") &&
      (p.includes("cream") || p.includes("heavy cream"))
    ) {
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

  // Typo-tolerant ingredient detection with root stems
  const isPotato = /potat|patat|aloo|spud|tater|hashbrown|fries/i.test(p);
  const isBeef =
    /\b(beef|steak|mince|ground beef|burger)\b/i.test(p) &&
    !/no beef|meatless|vegetarian/i.test(p);
  const isChicken = /chick|poultry|thigh|breast|wing/i.test(p);
  const isEgg = /\b(egg|eggs|omelet|omelette|scramble|scrambled)\b/i.test(p);
  const isRice = /\b(rice|risotto)\b/i.test(p);
  const isPasta =
    /\b(pasta|spaghetti|penne|noodle|noodles|macaroni|fettuccine|linguine)\b/i.test(
      p,
    );
  const isSalmon = /\b(salmon|fish|tuna|shrimp|prawn|seafood|cod)\b/i.test(p);
  const isMushroom = /mushroom/i.test(p);
  const isTomato = /tomat/i.test(p);
  const isSpinach = /spinach|greens|kale/i.test(p);
  const isCheese = /cheese|cheddar|mozzarella|parmesan/i.test(p);
  const isBread = /\b(bread|toast|sandwich)\b/i.test(p);
  const isSoup = /\b(soup|stew|broth)\b/i.test(p);
  const isGarlic = /garlic/i.test(p);
  const isMango = /\b(mango|mangoes|mangos)\b/i.test(p);
  const isBanana = /\b(banana|bananas)\b/i.test(p);
  const isApple = /\b(apple|apples|applesauce)\b/i.test(p);
  const isBerry =
    /\b(berry|berries|strawberry|strawberries|blueberry|blueberries|raspberry|raspberries|blackberry)\b/i.test(
      p,
    );
  const isAvocado = /\b(avocado|avocados|guacamole)\b/i.test(p);
  const isGenericFruitSearch = /\b(fruit|fruits)\b/i.test(p);
  const isFruit =
    /fruit|berry|melon|citrus|mango|banana|apple|peach|pear|plum|cherry|pineapple|orange|grape|kiwi|lemon|lime|coconut|papaya|guava|lychee|fig|date|apricot/i.test(
      p,
    );
  const isSweetOrDessert =
    /sweet|dessert|smoothie|shake|parfait|pudding|pancake|waffle|oat|chia|yogurt|honey|cinnamon|ice cream|chocolate|cocoa|sugar|syrup|custard/i.test(
      p,
    );

  // Curated database with full ingredients, steps, and authentic photos
  const CATALOG = [
    // --- POTATO RECIPES ---
    {
      tags: ["potato", "aloo", "spud"],
      recipeName: "Crispy Pan-Seared Chili Potatoes",
      cuisine: "Homestyle Skillet",
      description:
        "Golden diced potatoes shallow-seared until delightfully crunchy on the outside and tender inside, seasoned with chili powder, sea salt, and fresh herbs.",
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "3 medium, peeled & diced" },
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
    },
    {
      tags: ["potato", "aloo", "spud", "garlic"],
      recipeName: "Herb-Roasted Garlic & Rosemary Potato Wedges",
      cuisine: "Rustic Oven / Skillet",
      description:
        "Crispy-edged thick potato wedges seasoned with aromatic rosemary, crushed garlic, and a touch of paprika for savory crunch.",
      cookingTime: "30 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "3 large, cut into thick wedges" },
        { name: "Olive Oil", quantity: "2.5 tbsp" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Paprika", quantity: "1 tsp" },
        { name: "Dried Rosemary or Thyme", quantity: "1 tsp" },
        { name: "Sea Salt & Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Preheat oven or heavy skillet to 400°F (200°C).",
        "Toss potato wedges with olive oil, garlic, paprika, herbs, salt, and pepper in a bowl.",
        "Arrange cut-side down in a single layer on a baking sheet or hot cast-iron skillet.",
        "Roast for 25-30 minutes, turning halfway through, until crispy and deep golden.",
        "Serve hot alongside garlic aioli, sour cream, or ketchup.",
      ],
      tips: [
        "Leaving skins on adds rustic texture and extra crispiness.",
        "Make sure wedges do not overlap so they roast rather than steam.",
      ],
      image: "/roasted_potato_wedges.jpg",
    },
    {
      tags: ["potato", "aloo", "cheese", "butter", "garlic"],
      recipeName: "Creamy Garlic & Cheddar Mashed Potatoes",
      cuisine: "Comfort Kitchen",
      description:
        "Velvety, buttery mashed potatoes whipped with roasted garlic, warm cream, and rich melted cheddar cheese.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "4 large, peeled & cubed" },
        { name: "Butter", quantity: "4 tbsp" },
        { name: "Heavy Cream or Milk", quantity: "1/2 cup (warm)" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Cheddar Cheese", quantity: "1/2 cup, shredded" },
        { name: "Salt & Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Boil cubed potatoes in salted water for 15 minutes until fork-tender. Drain well.",
        "In a small pan, warm butter and minced garlic over low heat until fragrant.",
        "Mash hot potatoes, gradually pouring in warm garlic butter and cream.",
        "Fold in shredded cheddar until melted and silky smooth. Season with salt and pepper.",
      ],
      tips: [
        "Use warm butter and cream so the potatoes absorb them smoothly without turning gummy.",
      ],
      image:
        "https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["potato", "aloo", "egg", "onion"],
      recipeName: "Classic Spanish Potato & Onion Tortilla",
      cuisine: "Mediterranean",
      description:
        "A beloved traditional Spanish omelet made with tender simmered potatoes and sweet caramelized onions bound in fluffy eggs.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "3 medium, thinly sliced" },
        { name: "Eggs", quantity: "4 large, whisked" },
        { name: "Onion", quantity: "1 medium, thinly sliced" },
        { name: "Olive Oil", quantity: "4 tbsp" },
        { name: "Sea Salt", quantity: "1 tsp" },
      ],
      steps: [
        "Heat olive oil in a nonstick skillet. Add potatoes and onions with salt.",
        "Cook gently for 12-15 minutes until fork-tender (do not brown heavily). Drain excess oil.",
        "Combine potatoes and onions with beaten eggs in a bowl. Let sit 5 minutes to absorb.",
        "Pour into skillet over medium-low heat. Cook 4-5 minutes until edges set.",
        "Carefully flip using a plate and cook the other side 3 minutes until golden and custardy.",
      ],
      tips: [
        "Letting cooked potatoes sit in raw egg for 5 minutes creates an ultra-tender, creamy interior.",
      ],
      image:
        "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["potato", "aloo", "garlic", "butter"],
      recipeName: "Crispy Garlic Butter Smashed Potatoes",
      cuisine: "Steakhouse Side",
      description:
        "Boiled baby potatoes crushed flat and roasted until ultra-crispy, brushed with sizzling garlic herb butter.",
      cookingTime: "35 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "500g baby potatoes, washed" },
        { name: "Butter", quantity: "3 tbsp, melted" },
        { name: "Garlic", quantity: "3 cloves, finely grated" },
        { name: "Olive Oil", quantity: "1.5 tbsp" },
        { name: "Fresh Parsley or Chives", quantity: "2 tbsp, chopped" },
        { name: "Flaky Sea Salt & Pepper", quantity: "To taste" },
      ],
      steps: [
        "Boil potatoes in salted water for 15-18 minutes until completely fork-tender. Drain.",
        "Place on a baking sheet and use a flat glass to gently press each potato flat.",
        "Whisk melted butter, olive oil, garlic, salt, and pepper. Generously brush over potatoes.",
        "Bake at 425°F (220°C) for 20-25 minutes until deeply golden and shatteringly crisp.",
        "Garnish with fresh parsley or chives and serve hot.",
      ],
      tips: [
        "Let boiled potatoes steam dry for 3 minutes before smashing so they crisp up better.",
      ],
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["potato", "aloo", "soup", "onion"],
      recipeName: "Cozy Golden Potato & Leek Soup",
      cuisine: "Cozy Kitchen",
      description:
        "Warm, velvety pureed potato soup simmered with sweet onions, garlic, and rich stock with a hint of cream.",
      cookingTime: "30 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Potatoes", quantity: "3 medium, peeled and diced" },
        { name: "Onion", quantity: "1 large, chopped" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Vegetable or Chicken Broth", quantity: "3 cups" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Cream or Milk", quantity: "1/4 cup" },
        { name: "Salt, Pepper & Dried Thyme", quantity: "To taste" },
      ],
      steps: [
        "Melt butter in a soup pot over medium heat. Sauté onions and garlic for 4 minutes until soft.",
        "Add diced potatoes, thyme, salt, and pepper. Pour in broth and bring to a boil.",
        "Reduce heat, cover, and simmer for 18 minutes until potatoes fall apart easily.",
        "Blend with an immersion blender until silky smooth.",
        "Stir in cream, adjust seasoning, and serve with crusty bread.",
      ],
      tips: [
        "Top with extra cracked black pepper or chives for contrasting flavor.",
      ],
      image:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    },

    // --- CHICKEN RECIPES ---
    {
      tags: ["chicken", "rice", "garlic", "onion"],
      recipeName: "Savory Garlic Butter Chicken & Fragrant Rice",
      cuisine: "Homestyle Skillet",
      description:
        "Tender golden-brown chicken bites tossed with caramelized onions and garlic, served over fluffy seasoned rice.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        {
          name: "Chicken Breast / Thighs",
          quantity: "350g, cut into bite-sized cubes",
        },
        { name: "Rice (Jasmine or Basmati)", quantity: "1 cup (rinsed)" },
        { name: "Garlic", quantity: "4 cloves, minced" },
        { name: "Onion", quantity: "1 medium, finely sliced" },
        { name: "Butter or Cooking Oil", quantity: "2 tbsp" },
        { name: "Salt & Fresh Cracked Pepper", quantity: "To taste" },
      ],
      steps: [
        "Rinse rice until water runs clear and cook with 2 cups salted water for 15 minutes.",
        "Season chicken cubes evenly with salt and freshly cracked black pepper.",
        "Heat oil in a skillet over medium-high heat. Sear chicken 6-7 minutes until golden on all sides. Set aside.",
        "Reduce heat to medium, add butter, onions, and garlic. Sauté 3 minutes until fragrant.",
        "Return chicken to the skillet with any pan juices, tossing for 2 minutes to meld.",
        "Serve warm chicken directly over the bed of fluffy rice.",
      ],
      tips: [
        "Deglaze skillet with a splash of water or broth to lift the flavorful browned bits.",
      ],
      image: "/garlic_chicken_rice.jpg",
    },
    {
      tags: ["chicken", "spinach", "garlic", "cream", "tomato"],
      recipeName: "Creamy Tuscan Garlic & Spinach Chicken",
      cuisine: "Italian-inspired",
      description:
        "Pan-seared seasoned chicken cutlets simmered in a luscious garlic cream sauce with wilted spinach and sweet cherry tomatoes.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        {
          name: "Chicken Breast",
          quantity: "2 fillets, pounded to even thickness",
        },
        { name: "Spinach", quantity: "2 cups, fresh" },
        { name: "Cherry Tomatoes", quantity: "1 cup, halved" },
        { name: "Heavy Cream or Milk", quantity: "1/2 cup" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Parmesan Cheese", quantity: "1/4 cup, grated" },
        { name: "Olive Oil & Butter", quantity: "1 tbsp each" },
      ],
      steps: [
        "Season chicken breasts with salt, pepper, and Italian seasoning.",
        "Heat olive oil in a skillet over medium-high heat. Sear chicken 5-6 minutes per side until golden. Remove.",
        "Melt butter in the same pan. Sauté garlic and cherry tomatoes for 2 minutes until blistered.",
        "Pour in cream and simmer gently. Stir in parmesan until smooth and slightly thickened.",
        "Add fresh spinach and let wilt. Return chicken to the pan and spoon sauce over the top.",
      ],
      tips: [
        "Serve over pasta, rice, or with warm garlic bread to soak up the sauce.",
      ],
      image:
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["chicken", "lemon", "garlic"],
      recipeName: "Crispy Lemon Herb Baked Chicken Breast",
      cuisine: "Comfort Kitchen",
      description:
        "Juicy, tender baked chicken breasts marinated in zesty lemon juice, crushed garlic, and aromatic herbs.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Chicken Breast", quantity: "2 large fillets" },
        { name: "Lemon", quantity: "1 whole (juice & zest)" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Olive Oil", quantity: "2 tbsp" },
        { name: "Dried Oregano & Thyme", quantity: "1 tsp each" },
        { name: "Salt & Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Preheat oven to 400°F (200°C).",
        "Whisk lemon juice, zest, olive oil, garlic, herbs, salt, and pepper in a bowl.",
        "Coat chicken breasts in the marinade for at least 10 minutes.",
        "Bake in a baking dish for 20-22 minutes until cooked through.",
        "Rest 5 minutes before slicing to keep juices locked in.",
      ],
      tips: [
        "Resting the chicken before cutting prevents juices from escaping.",
      ],
      image:
        "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["chicken", "pasta", "tomato", "garlic"],
      recipeName: "One-Pot Chicken & Tomato Basil Pasta",
      cuisine: "Quick & Easy",
      description:
        "Seared seasoned chicken tossed with penne pasta, sweet cherry tomatoes, and fresh basil in a light olive oil garlic sauce.",
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Chicken Breast", quantity: "250g, diced" },
        { name: "Pasta (Penne or Rigatoni)", quantity: "200g" },
        { name: "Tomatoes or Cherry Tomatoes", quantity: "1 cup, chopped" },
        { name: "Garlic", quantity: "3 cloves, sliced" },
        { name: "Olive Oil", quantity: "2 tbsp" },
        { name: "Parmesan & Fresh Basil", quantity: "For serving" },
      ],
      steps: [
        "Boil pasta in salted water until al dente. Reserve 1/3 cup cooking water and drain.",
        "In a large skillet, heat 1 tbsp oil. Cook diced chicken 5-6 minutes until golden. Set aside.",
        "Add remaining oil to the pan with garlic and tomatoes. Cook 3 minutes until tomatoes burst.",
        "Toss pasta and chicken back into the pan with reserved pasta water.",
        "Stir over low heat for 2 minutes, finishing with parmesan and fresh basil.",
      ],
      tips: [
        "Using reserved pasta water coats the pasta perfectly without needing heavy cream.",
      ],
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    },

    // --- BEEF RECIPES (ONLY WHEN BEEF/STEAK IS SEARCHED) ---
    {
      tags: ["beef", "steak", "garlic", "butter"],
      recipeName: "Garlic Butter Seared Steak Bites",
      cuisine: "Steakhouse",
      description:
        "Juicy bite-sized beef seared hot and fast in garlic herb butter with deeply caramelized edges.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Beef / Steak", quantity: "350g, cut into bite-sized cubes" },
        { name: "Butter", quantity: "2.5 tbsp" },
        { name: "Garlic", quantity: "4 cloves, minced" },
        { name: "Cooking Oil", quantity: "1 tbsp" },
        { name: "Salt & Coarse Black Pepper", quantity: "To taste" },
      ],
      steps: [
        "Pat beef cubes dry and season generously with coarse salt and black pepper.",
        "Heat a heavy skillet with oil over high heat until smoking hot.",
        "Add beef in a single layer without crowding. Sear undisturbed for 2 minutes, then flip and sear another 2 minutes.",
        "Drop heat to low, add butter and minced garlic, tossing constantly for 60 seconds to coat.",
        "Remove immediately from heat and rest 3 minutes before serving.",
      ],
      tips: ["Keep heat high so the beef browns nicely without steaming."],
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["beef", "broccoli", "soy sauce", "garlic"],
      recipeName: "Classic Beef & Broccoli Stir-Fry",
      cuisine: "Asian-inspired",
      description:
        "Tender flank steak slices and crisp broccoli florets wok-tossed in a rich savory garlic soy sauce.",
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Beef", quantity: "300g, thinly sliced" },
        { name: "Broccoli", quantity: "2 cups, florets" },
        { name: "Soy Sauce", quantity: "3 tbsp" },
        { name: "Garlic & Ginger", quantity: "2 cloves & 1 tsp grated" },
        { name: "Brown Sugar or Honey", quantity: "1 tbsp" },
      ],
      steps: [
        "Whisk soy sauce, sugar, garlic, ginger, and 3 tbsp water to make the sauce.",
        "Heat oil in a wok or skillet over high heat. Sear beef slices 3 minutes until browned. Remove beef.",
        "Add broccoli with 2 tbsp water to the pan, cover and steam 2 minutes.",
        "Return beef, pour in sauce, and stir 2 minutes until glossy and thick.",
      ],
      tips: ["Slice beef thinly across the grain for tender results."],
      image:
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["beef", "pasta", "tomato", "garlic", "onion"],
      recipeName: "Hearty Beef Bolognese & Garlic Pasta",
      cuisine: "Italian-inspired",
      description:
        "Savory minced beef simmered with sweet tomatoes, garlic, onion, and herbs folded over al dente pasta.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Ground Beef", quantity: "300g" },
        { name: "Pasta", quantity: "250g" },
        { name: "Tomato Sauce or Crushed Tomatoes", quantity: "1.5 cups" },
        { name: "Garlic & Onion", quantity: "3 cloves & 1 small diced" },
        { name: "Olive Oil", quantity: "1 tbsp" },
      ],
      steps: [
        "Boil pasta in salted water until al dente; drain.",
        "Heat olive oil in a saucepan. Sauté diced onions and garlic for 3 minutes.",
        "Add ground beef, breaking up until browned throughout. Drain excess fat.",
        "Pour in tomato sauce and herbs. Simmer over medium-low heat 10 minutes.",
        "Toss pasta directly into the rich meat sauce and serve.",
      ],
      tips: [
        "Simmer gently so the beef absorbs all the garlic and tomato flavors.",
      ],
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    },

    // --- EGG & BREAKFAST RECIPES ---
    {
      tags: ["egg", "rice", "onion", "garlic"],
      recipeName: "Golden Scrambled Egg & Aromatic Rice Bowl",
      cuisine: "Quick & Easy",
      description:
        "Fluffy seasoned eggs scrambled alongside savory onions and garlic, folded over warm rice with soy butter.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Eggs", quantity: "3 large, whisked" },
        { name: "Cooked Rice", quantity: "1.5 cups" },
        { name: "Onion or Scallions", quantity: "1/2 cup, chopped" },
        { name: "Garlic", quantity: "2 cloves, minced" },
        { name: "Butter or Oil", quantity: "1.5 tbsp" },
        { name: "Soy Sauce", quantity: "1 tbsp" },
      ],
      steps: [
        "Whisk eggs in a bowl with a pinch of salt.",
        "Heat 1 tbsp oil in a nonstick pan over medium heat. Pour in eggs, softly scramble for 60 seconds, and remove.",
        "Add remaining oil to pan, sauté garlic and onions 2 minutes until fragrant.",
        "Add cooked rice and soy sauce, breaking up any clumps with a spatula.",
        "Fold the soft scrambled eggs back into the rice and serve hot.",
      ],
      tips: ["Chilled day-old rice fries best without becoming mushy."],
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["egg", "bread", "butter"],
      recipeName: "Artisan Smashed Egg & Butter Toast",
      cuisine: "Café Breakfast",
      description:
        "Thick golden toast buttered to perfection, topped with soft-cooked seasoned eggs, sea salt, and fresh pepper.",
      cookingTime: "10 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Bread", quantity: "2 thick slices" },
        { name: "Eggs", quantity: "2 large" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Salt & Fresh Cracked Pepper", quantity: "To taste" },
      ],
      steps: [
        "Melt 1 tbsp butter in a skillet. Toast bread slices on both sides until deep golden and crunchy.",
        "Melt remaining butter in the pan, crack in the eggs, and fry to desired doneness.",
        "Layer eggs onto hot buttered toast and season with coarse salt and pepper.",
      ],
      tips: [
        "A light dusting of paprika or herbs elevates this simple classic.",
      ],
      image:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["egg", "spinach", "cheese", "garlic"],
      recipeName: "Mediterranean Spinach & Feta Scramble",
      cuisine: "Healthy & Fresh",
      description:
        "Fluffy eggs scrambled with tender wilted spinach, garlic, and creamy crumbled feta cheese.",
      cookingTime: "10 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Eggs", quantity: "3 large" },
        { name: "Fresh Spinach", quantity: "1.5 cups" },
        { name: "Feta or Cheddar Cheese", quantity: "3 tbsp, crumbled" },
        { name: "Olive Oil or Butter", quantity: "1 tbsp" },
        { name: "Garlic", quantity: "1 clove, minced" },
      ],
      steps: [
        "Heat olive oil in a skillet over medium heat. Sauté garlic and spinach for 2 minutes until wilted.",
        "Whisk eggs with a pinch of pepper and pour directly into the pan.",
        "Gently stir with a spatula over medium-low heat until soft curds form.",
        "Sprinkle cheese over the warm scramble just before pulling off the heat.",
      ],
      tips: [
        "Pull eggs off the stove while still slightly glossy so they stay soft.",
      ],
      image:
        "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
    },

    // --- PASTA RECIPES ---
    {
      tags: ["pasta", "garlic", "olive oil"],
      recipeName: "Rustic Garlic & Herb Olive Oil Pasta (Aglio e Olio)",
      cuisine: "Italian Classic",
      description:
        "Al dente spaghetti tossed in golden toasted garlic slices, extra virgin olive oil, and crushed chili flakes.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Pasta (Spaghetti or Linguine)", quantity: "250g" },
        { name: "Garlic", quantity: "5 cloves, thinly sliced" },
        { name: "Olive Oil", quantity: "1/4 cup" },
        { name: "Red Pepper Flakes", quantity: "1/2 tsp" },
        { name: "Fresh Parsley & Parmesan", quantity: "To garnish" },
      ],
      steps: [
        "Cook pasta in salted water until al dente. Reserve 1/2 cup pasta water before draining.",
        "In a wide skillet, heat olive oil over medium-low heat. Add sliced garlic and chili flakes.",
        "Gently cook garlic until pale golden (do not let it burn).",
        "Add drained pasta and 3-4 tbsp reserved pasta water to the pan.",
        "Toss vigorously for 1 minute until a glossy sauce coats the noodles. Finish with parsley and cheese.",
      ],
      tips: [
        "Low heat is essential so the garlic infuses the oil gently without scorching.",
      ],
      image:
        "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["pasta", "mushroom", "cream", "garlic", "cheese"],
      recipeName: "Creamy Parmesan & Mushroom Fettuccine",
      cuisine: "Italian-inspired",
      description:
        "Sautéed earthy mushrooms tossed with fettuccine in a rich garlic parmesan cream sauce.",
      cookingTime: "20 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Pasta", quantity: "250g" },
        { name: "Mushrooms", quantity: "200g, sliced" },
        { name: "Heavy Cream or Milk", quantity: "1/2 cup" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Parmesan Cheese", quantity: "1/3 cup, grated" },
      ],
      steps: [
        "Boil pasta until al dente; drain.",
        "Melt butter in a skillet over medium-high heat. Add mushrooms and sauté 5 minutes until browned.",
        "Add minced garlic and cook 1 minute until fragrant.",
        "Pour in cream and bring to a simmer. Stir in parmesan until melted into a silky sauce.",
        "Toss hot pasta into the sauce until thoroughly coated.",
      ],
      tips: [
        "Do not salt the mushrooms until browned so they don't release water too early.",
      ],
      image:
        "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
    },

    // --- SEAFOOD RECIPES ---
    {
      tags: ["salmon", "fish", "lemon", "butter", "garlic"],
      recipeName: "Pan-Seared Lemon Butter Salmon",
      cuisine: "Coastal Skillet",
      description:
        "Crispy-skinned tender salmon fillets basted in luscious lemon garlic butter with fresh cracked pepper.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Salmon Fillets", quantity: "2 portions (150g each)" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Garlic", quantity: "2 cloves, minced" },
        { name: "Lemon", quantity: "1/2, juiced" },
        { name: "Olive Oil", quantity: "1 tbsp" },
      ],
      steps: [
        "Pat salmon completely dry with paper towels. Season both sides with salt and pepper.",
        "Heat olive oil in a skillet on medium-high until shimmering. Place salmon skin-side down.",
        "Sear undisturbed for 4-5 minutes until skin is deeply crisp.",
        "Flip salmon, add butter, garlic, and lemon juice. Baste foaming butter over fillets for 3 minutes.",
      ],
      tips: ["Drying salmon thoroughly is the key to ultra-crispy skin."],
      image:
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    },

    // --- VEGETABLE & PANTRY DISHES ---
    {
      tags: ["mushroom", "spinach", "garlic", "butter"],
      recipeName: "Garlic Butter Sautéed Mushrooms & Spinach",
      cuisine: "Quick & Easy",
      description:
        "Tender caramelized mushrooms and vibrant spinach sautéed with rich garlic butter and a touch of lemon.",
      cookingTime: "12 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Mushrooms", quantity: "250g, sliced" },
        { name: "Spinach", quantity: "3 cups, fresh" },
        { name: "Butter", quantity: "2 tbsp" },
        { name: "Garlic", quantity: "3 cloves, minced" },
        { name: "Salt, Pepper & Lemon Juice", quantity: "To taste" },
      ],
      steps: [
        "Melt butter in a wide skillet over medium-high heat. Add mushrooms in a single layer.",
        "Cook undisturbed for 4 minutes until golden, then stir and cook 2 more minutes.",
        "Add minced garlic and sauté 1 minute until fragrant.",
        "Add fresh spinach in batches, tossing until just wilted. Season with salt, pepper, and lemon juice.",
      ],
      tips: [
        "Delicious served as a side, over rice, or spooned onto toasted sourdough.",
      ],
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["rice", "egg", "onion", "garlic"],
      recipeName: "Classic Vegetable & Egg Fried Rice",
      cuisine: "Asian-inspired",
      description:
        "A quick wok-fried rice with fluffy scrambled eggs, crisp garlic, and savory soy sauce.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Cooked Rice", quantity: "2 cups (preferably chilled)" },
        { name: "Eggs", quantity: "2 large, beaten" },
        { name: "Garlic & Onion", quantity: "2 cloves & 1/2 onion, minced" },
        { name: "Soy Sauce", quantity: "1.5 tbsp" },
        { name: "Cooking Oil", quantity: "2 tbsp" },
      ],
      steps: [
        "Heat 1 tbsp oil in a wok or skillet over high heat. Scramble eggs for 45 seconds; set aside.",
        "Heat remaining oil, add garlic and onion, sautéing for 2 minutes until aromatic.",
        "Add cold cooked rice, pressing with a spatula to separate grains.",
        "Drizzle soy sauce around the rim of the pan, tossing vigorously to coat.",
        "Fold scrambled eggs back in and serve hot.",
      ],
      tips: ["Keep the wok hot so the rice gets a slight smoky char."],
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    },
    // --- MANGO & FRESH FRUIT DISHES ---
    {
      tags: ["mango", "rice", "coconut", "sweet", "dessert", "fruit"],
      recipeName: "Thai Coconut Sticky Rice with Sweet Mango",
      cuisine: "Southeast Asian",
      description:
        "Warm, sweet coconut infused sticky rice paired with chilled ripe mango slices and toasted sesame seeds.",
      cookingTime: "25 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Ripe Sweet Mangoes", quantity: "2, sliced into fans" },
        {
          name: "Glutinous Rice or Jasmine Rice",
          quantity: "1 cup (cooked tender)",
        },
        { name: "Coconut Milk or Cream", quantity: "3/4 cup" },
        { name: "Sugar or Honey", quantity: "2 tbsp" },
        { name: "Salt", quantity: "1/4 tsp" },
        { name: "Toasted Sesame Seeds", quantity: "1 tsp, for garnish" },
      ],
      steps: [
        "In a small saucepan over medium-low heat, combine coconut milk, sugar, and salt until gently dissolved.",
        "Fold 2/3 of the warm coconut sauce into the freshly cooked rice. Let rest covered for 10 minutes to absorb.",
        "Peel and slice ripe mangoes into thin presentation fans.",
        "Plate warm sticky rice next to the mango slices, drizzle with remaining coconut cream, and top with toasted sesame seeds.",
      ],
      tips: ["Use fragrant, deeply ripe mangoes for natural honey sweetness."],
      image:
        "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["mango", "salsa", "lime", "cilantro", "onion", "fruit"],
      recipeName: "Fresh Zesty Mango & Lime Salsa",
      cuisine: "Tropical & Mexican",
      description:
        "A vibrant, refreshing tropical salsa bursting with sweet diced mango, crisp red onion, fresh cilantro, and lime juice.",
      cookingTime: "10 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Ripe Mangoes", quantity: "2 large, finely diced" },
        { name: "Red Onion", quantity: "1/4 cup, finely chopped" },
        { name: "Fresh Cilantro", quantity: "3 tbsp, chopped" },
        { name: "Lime", quantity: "1 whole, freshly juiced" },
        { name: "Sea Salt & Red Chili Flakes", quantity: "A pinch each" },
      ],
      steps: [
        "Dice peeled mangoes into small, uniform cubes.",
        "In a medium bowl, gently combine diced mango, red onion, and chopped cilantro.",
        "Squeeze fresh lime juice over the mixture and season with a pinch of sea salt and chili flakes.",
        "Toss lightly with a wooden spoon. Chill in the refrigerator for 10 minutes before serving.",
        "Serve with crispy tortilla chips, grilled tacos, or spoon over salmon.",
      ],
      tips: [
        "Letting the salsa sit for 10 minutes allows the lime juice to marry the sweet mango and savory onion.",
      ],
      image:
        "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["mango", "smoothie", "chia", "yogurt", "breakfast", "fruit"],
      recipeName: "Tropical Mango & Chia Smoothie Bowl",
      cuisine: "Café Breakfast",
      description:
        "Velvety thick blended golden mango spooned into a chilled bowl, topped with chia seeds, coconut flakes, and fresh fruit.",
      cookingTime: "10 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Frozen Mango Chunks", quantity: "2 cups" },
        { name: "Greek Yogurt or Coconut Milk", quantity: "1/2 cup" },
        { name: "Honey or Agave", quantity: "1 tbsp" },
        { name: "Chia Seeds", quantity: "1 tbsp" },
        {
          name: "Toasted Coconut Flakes & Fresh Berries",
          quantity: "For topping",
        },
      ],
      steps: [
        "Add frozen mango chunks, yogurt, and honey into a blender.",
        "Blend on low, gradually increasing to high until thick, creamy, and spoonable.",
        "Pour into a wide chilled breakfast bowl.",
        "Arrange chia seeds, coconut flakes, and fruit slices in neat rows across the top.",
      ],
      tips: [
        "Use frozen mango chunks to get a thick, sorbet-like texture without needing crushed ice.",
      ],
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["mango", "yogurt", "drink", "sweet", "fruit"],
      recipeName: "Chilled Traditional Mango Lassi",
      cuisine: "Indian-inspired",
      description:
        "A velvety, refreshing chilled yogurt drink blended with ripe sweet mango, a whisper of ground cardamom, and honey.",
      cookingTime: "5 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Ripe Mango Flesh", quantity: "1.5 cups, chopped" },
        { name: "Plain Greek or Natural Yogurt", quantity: "1 cup" },
        { name: "Milk", quantity: "1/4 cup (to adjust thickness)" },
        { name: "Honey or Sugar", quantity: "1.5 tbsp" },
        { name: "Ground Cardamom", quantity: "A pinch (optional)" },
      ],
      steps: [
        "Place chopped mango, chilled yogurt, milk, and honey into a blender.",
        "Blend on high speed for 60 seconds until completely silky and frothy.",
        "Taste and adjust sweetness or add a splash more milk if you prefer a lighter drink.",
        "Pour into chilled glasses and finish with a dusting of ground cardamom on top.",
      ],
      tips: ["A pinch of cardamom elevates the floral aroma of fresh mango."],
      image:
        "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["berry", "yogurt", "breakfast", "sweet", "fruit"],
      recipeName: "Layered Berry & Greek Yogurt Parfait",
      cuisine: "Café Breakfast",
      description:
        "Layers of thick creamy Greek yogurt, sweet strawberries, blueberries, crunchy granola, and golden honey.",
      cookingTime: "8 min",
      difficulty: "Easy",
      ingredients: [
        {
          name: "Mixed Fresh Berries (Strawberries, Blueberries)",
          quantity: "1.5 cups",
        },
        { name: "Greek Yogurt", quantity: "1 cup" },
        { name: "Granola or Rolled Oats", quantity: "1/2 cup" },
        { name: "Honey", quantity: "1.5 tbsp" },
      ],
      steps: [
        "Spoon 1/3 of the Greek yogurt into the base of a glass.",
        "Layer with fresh berries and a generous sprinkle of crunchy granola.",
        "Repeat the layers once more and drizzle pure honey across the top before serving.",
      ],
      tips: ["Layer just before eating to ensure the granola stays crunchy."],
      image:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: [
        "apple",
        "oats",
        "cinnamon",
        "honey",
        "breakfast",
        "sweet",
        "fruit",
      ],
      recipeName: "Warm Caramelized Apple & Cinnamon Oatmeal",
      cuisine: "Comfort Kitchen",
      description:
        "Hearty rolled oats cooked tender, topped with skillet-caramelized cinnamon apples and warm honey.",
      cookingTime: "15 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Apple", quantity: "1 large (Honeycrisp or Gala), diced" },
        { name: "Rolled Oats", quantity: "1 cup" },
        { name: "Milk or Water", quantity: "2 cups" },
        { name: "Butter", quantity: "1 tbsp" },
        { name: "Cinnamon", quantity: "1 tsp" },
        { name: "Honey or Brown Sugar", quantity: "1.5 tbsp" },
      ],
      steps: [
        "In a small skillet, melt butter over medium heat. Sauté diced apples with cinnamon and honey for 6 minutes until tender and caramelized.",
        "In a small pot, simmer rolled oats in milk with a pinch of salt for 5 minutes until creamy.",
        "Spoon warm oatmeal into bowls and crown with warm caramelized apples and their pan syrup.",
      ],
      tips: [
        "Sautéing the apples first creates a rich spiced syrup that flavors the whole bowl.",
      ],
      image:
        "https://images.unsplash.com/photo-1575549592564-4d50aa43b3af?auto=format&fit=crop&w=800&q=80",
    },
    {
      tags: ["avocado", "bread", "toast", "lime"],
      recipeName: "Artisan Smashed Avocado & Lime Sourdough Toast",
      cuisine: "Café Classic",
      description:
        "Creamy ripe avocado coarsely mashed with fresh lime juice, flaky sea salt, and chili flakes on golden toasted artisan bread.",
      cookingTime: "10 min",
      difficulty: "Easy",
      ingredients: [
        { name: "Ripe Avocado", quantity: "1 large" },
        { name: "Sourdough or Artisan Bread", quantity: "2 thick slices" },
        { name: "Lime", quantity: "1/2, freshly squeezed" },
        { name: "Extra Virgin Olive Oil", quantity: "1 tbsp" },
        { name: "Flaky Sea Salt & Chili Flakes", quantity: "To taste" },
      ],
      steps: [
        "Toast sourdough slices until crunchy and golden brown.",
        "In a small bowl, coarsely mash avocado with fresh lime juice and a drizzle of olive oil, keeping some texture.",
        "Generously mound mashed avocado onto warm toast.",
        "Season with flaky sea salt and a light sprinkle of red chili flakes.",
      ],
      tips: [
        "Do not over-mash; retaining chunky pieces gives superior texture.",
      ],
      image:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // STRICT FILTERING:
  // 1. NEVER include beef recipes unless the user specifically typed beef/steak
  // 2. NEVER include savory meats/alliums for sweet/fruit searches unless explicitly asked
  let matchingPool = CATALOG.filter((r) => {
    if (!isBeef && r.tags.includes("beef")) {
      return false;
    }
    if ((isFruit || isSweetOrDessert) && !isBeef && !isChicken && !isSalmon) {
      if (
        r.tags.includes("beef") ||
        r.tags.includes("chicken") ||
        r.tags.includes("salmon") ||
        r.tags.includes("fish")
      ) {
        return false;
      }
    }

    if (isMango && r.tags.includes("mango")) return true;
    if (isBerry && r.tags.includes("berry")) return true;
    if (isApple && r.tags.includes("apple")) return true;
    if (isBanana && r.tags.includes("banana")) return true;
    if (isAvocado && r.tags.includes("avocado")) return true;
    if (isGenericFruitSearch && r.tags.includes("fruit")) return true;
    if (
      isSweetOrDessert &&
      (r.tags.includes("sweet") ||
        r.tags.includes("smoothie") ||
        r.tags.includes("breakfast"))
    )
      return true;
    if (isPotato && r.tags.includes("potato")) return true;
    if (isBeef && r.tags.includes("beef")) return true;
    if (isChicken && r.tags.includes("chicken")) return true;
    if (isEgg && r.tags.includes("egg")) return true;
    if (isRice && r.tags.includes("rice")) return true;
    if (isPasta && r.tags.includes("pasta")) return true;
    if (isSalmon && (r.tags.includes("salmon") || r.tags.includes("fish")))
      return true;
    if (isMushroom && r.tags.includes("mushroom")) return true;
    if (isTomato && r.tags.includes("tomato")) return true;
    if (isSpinach && r.tags.includes("spinach")) return true;
    if (isSoup && r.tags.includes("soup")) return true;
    if (isBread && r.tags.includes("bread")) return true;

    return false;
  });

  let selectedRecipes;

  if (matchingPool.length > 0) {
    // Score based on multi-ingredient overlap
    const scoredPool = matchingPool.map((recipe) => {
      let s = 0;
      if (isMango && recipe.tags.includes("mango")) s += 10;
      if (isBerry && recipe.tags.includes("berry")) s += 8;
      if (isApple && recipe.tags.includes("apple")) s += 8;
      if (isBanana && recipe.tags.includes("banana")) s += 8;
      if (isAvocado && recipe.tags.includes("avocado")) s += 8;
      if (isGenericFruitSearch && recipe.tags.includes("fruit")) s += 4;
      if (
        isSweetOrDessert &&
        (recipe.tags.includes("sweet") ||
          recipe.tags.includes("smoothie") ||
          recipe.tags.includes("breakfast"))
      )
        s += 4;
      if (isPotato && recipe.tags.includes("potato")) s += 6;
      if (isBeef && recipe.tags.includes("beef")) s += 6;
      if (isChicken && recipe.tags.includes("chicken")) s += 6;
      if (isEgg && recipe.tags.includes("egg")) s += 4;
      if (isRice && recipe.tags.includes("rice")) s += 4;
      if (isPasta && recipe.tags.includes("pasta")) s += 4;
      if (
        isSalmon &&
        (recipe.tags.includes("salmon") || recipe.tags.includes("fish"))
      )
        s += 6;
      if (isCheese && recipe.tags.includes("cheese")) s += 2;
      if (isGarlic && recipe.tags.includes("garlic")) s += 2;
      if (isTomato && recipe.tags.includes("tomato")) s += 2;
      return { recipe, score: s };
    });

    scoredPool.sort((a, b) => b.score - a.score);

    // Pick top-tier items so high-confidence matches (e.g. 100% mango) are prioritized
    const maxScore = scoredPool[0]?.score || 0;
    const topTier = scoredPool
      .filter((item) => item.score === maxScore)
      .map((item) => item.recipe);

    if (topTier.length >= 3) {
      const shuffled = topTier.sort(() => 0.5 - Math.random());
      selectedRecipes = shuffled.slice(0, 3);
    } else {
      const candidateList = scoredPool
        .slice(0, Math.min(scoredPool.length, 5))
        .map((item) => item.recipe);
      selectedRecipes = candidateList.slice(
        0,
        Math.min(candidateList.length, 3),
      );
    }
  } else {
    // Dynamic generation strictly tailored to what the user typed (NEVER default to beef or savory garlic for sweet foods)
    const cleanWords = prompt
      .replace(/[^a-zA-Z\s]/g, " ")
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 2 &&
          ![
            "with",
            "and",
            "make",
            "cook",
            "want",
            "some",
            "like",
            "recipe",
            "recipes",
          ].includes(w.toLowerCase()),
      );

    if (cleanWords.length === 0) {
      return {
        type: "recipes",
        recipes: [],
      };
    }

    const primaryItem =
      cleanWords[0].charAt(0).toUpperCase() + cleanWords[0].slice(1);
    const secondaryItem = cleanWords[1]
      ? cleanWords[1].charAt(0).toUpperCase() + cleanWords[1].slice(1)
      : isFruit || isSweetOrDessert
        ? "Honey"
        : "Garlic";

    if (isFruit || isSweetOrDessert) {
      selectedRecipes = [
        {
          recipeName: `Refreshing Chilled ${primaryItem} & Mint Fruit Bowl`,
          cuisine: "Tropical & Fresh",
          description: `A bright, revitalizing bowl of fresh sliced ${primaryItem} dressed with zesty lime, pure honey, and fragrant garden mint.`,
          cookingTime: "10 min",
          difficulty: "Easy",
          ingredients: [
            { name: primaryItem, quantity: "2 cups, freshly sliced" },
            { name: "Honey or Maple Syrup", quantity: "1.5 tbsp" },
            { name: "Lime Juice", quantity: "1 tbsp, freshly squeezed" },
            { name: "Fresh Mint Leaves", quantity: "A small handful, torn" },
            {
              name: "Greek Yogurt or Coconut Flakes",
              quantity: "For serving (optional)",
            },
          ],
          steps: [
            `Wash, peel, and slice the ${primaryItem} into neat bite-sized pieces.`,
            "Place the sliced fruit into a chilled serving bowl.",
            "Whisk the honey and fresh lime juice together in a small ramekin until blended.",
            `Drizzle the citrus-honey dressing over the ${primaryItem} and toss gently.`,
            "Garnish with torn fresh mint and chill for 5 minutes before enjoying.",
          ],
          tips: [
            "Chill the fruit in the refrigerator for 20 minutes beforehand for maximum crisp refreshment.",
          ],
        },
        {
          recipeName: `Creamy ${primaryItem} & Chia Smoothie Parfait`,
          cuisine: "Healthy Breakfast",
          description: `A silky blended ${primaryItem} smoothie layered over rich yogurt with chia seeds and a touch of sweetness.`,
          cookingTime: "10 min",
          difficulty: "Easy",
          ingredients: [
            { name: primaryItem, quantity: "1.5 cups, chopped" },
            { name: "Greek Yogurt or Almond Milk", quantity: "3/4 cup" },
            { name: "Honey", quantity: "1 tbsp" },
            { name: "Chia Seeds or Granola", quantity: "2 tbsp" },
          ],
          steps: [
            `Add the chopped ${primaryItem}, yogurt (or milk), and honey into a blender.`,
            "Blend on high speed for 45-60 seconds until thick, velvety, and completely smooth.",
            "Pour half into a tall glass or bowl, add a layer of chia seeds or granola.",
            "Top with the remaining smoothie and garnish with fresh fruit slices.",
          ],
          tips: [
            "Use frozen fruit for a thicker, ice-cream-like smoothie texture.",
          ],
        },
      ];
    } else {
      selectedRecipes = [
        {
          recipeName: `Crispy Pan-Seared ${primaryItem} Skillet`,
          cuisine: "Comfort Kitchen",
          description: `A fast and delicious meal highlighting ${primaryItem}, seared golden in olive oil and seasoned with kitchen aromatics.`,
          cookingTime: "20 min",
          difficulty: "Easy",
          ingredients: [
            { name: primaryItem, quantity: "2 cups or 300g, prepared" },
            { name: secondaryItem, quantity: "2 cloves or 1/2 cup" },
            { name: "Olive Oil or Butter", quantity: "2 tbsp" },
            { name: "Salt & Black Pepper", quantity: "To taste" },
          ],
          steps: [
            `Chop ${primaryItem} and ${secondaryItem} into uniform bite-sized pieces.`,
            "Heat olive oil or butter in a wide skillet over medium heat.",
            `Add ${primaryItem} and sauté for 6-8 minutes until tender and golden.`,
            `Stir in ${secondaryItem}, season with salt and pepper, and cook 2 more minutes.`,
            "Serve warm as a nourishing main or side dish.",
          ],
          tips: [
            "A squeeze of fresh lemon juice brightens up the flavors before serving.",
          ],
        },
        {
          recipeName: `Herb-Roasted ${primaryItem} & ${secondaryItem} Bowl`,
          cuisine: "Healthy & Fresh",
          description: `Oven-roasted ${primaryItem} infused with aromatic herbs, sweet caramelized notes, and a touch of sea salt.`,
          cookingTime: "25 min",
          difficulty: "Easy",
          ingredients: [
            { name: primaryItem, quantity: "300g, sliced" },
            { name: secondaryItem, quantity: "1 cup, chopped" },
            { name: "Cooking Oil", quantity: "2 tbsp" },
            { name: "Dried Herbs & Sea Salt", quantity: "1 tsp each" },
          ],
          steps: [
            "Preheat oven to 400°F (200°C).",
            `Toss ${primaryItem} and ${secondaryItem} with oil, dried herbs, and sea salt in a bowl.`,
            "Spread in a single layer on a baking sheet.",
            "Roast for 20-25 minutes until tender with caramelized edges.",
            "Enjoy immediately with rice, toast, or your favorite dip.",
          ],
          tips: [
            "Do not crowd the baking sheet so ingredients roast with crispy edges instead of steaming.",
          ],
        },
      ];
    }
  }

  const enrichedRecipes = selectedRecipes.map((r, index) => ({
    ...r,
    id: `recipe-${Date.now()}-${index}`,
    image:
      r.image ||
      getImageForRecipe(r.recipeName, r.cuisine, r.ingredients, index),
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
  if (!prompt || prompt.trim().length < 2) {
    return {
      type: "recipes",
      recipes: [],
    };
  }

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
      if (
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("not supported")
      ) {
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
      const quotaError = new Error(
        "AI usage limit reached. Please try again later.",
      );
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
    rawText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

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
        ingredients: Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [],
        steps: Array.isArray(recipe.steps) ? recipe.steps : [],
        tips: Array.isArray(recipe.tips) ? recipe.tips : [],
        image:
          recipe.image ||
          getImageForRecipe(
            recipe.recipeName,
            recipe.cuisine,
            recipe.ingredients,
            index,
          ),
      }));
    }

    return parsed;
  } catch {
    return generateFallbackRecipes(prompt);
  }
}
