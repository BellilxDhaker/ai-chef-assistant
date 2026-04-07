"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ResultsDisplay from "@/components/ResultsDisplay";

const ALL_INGREDIENTS = [
  "Onion",
  "Garlic",
  "Tomato",
  "Spinach",
  "Carrot",
  "Bell Pepper",
  "Broccoli",
  "Mushroom",
  "Zucchini",
  "Potato",
  "Sweet Potato",
  "Eggplant",
  "Cauliflower",
  "Cucumber",
  "Avocado",
  "Lemon",
  "Lime",
  "Apple",
  "Pear",
  "Strawberry",
  "Blueberry",
  "Banana",
  "Orange",
  "Chicken",
  "Beef",
  "Pork",
  "Turkey",
  "Shrimp",
  "Salmon",
  "Tuna",
  "Eggs",
  "Milk",
  "Cheese",
  "Yogurt",
  "Butter",
  "Olive Oil",
  "Basil",
  "Cilantro",
  "Parsley",
  "Ginger",
  "Rice",
  "Pasta",
  "Bread",
  "Beans",
  "Lentils",
  "Chickpeas",
  "Tofu",
  "Quinoa",
  "Corn",
  "Peas",
  "Honey",
  "Soy Sauce",
  "Chili Flakes",
  "Paprika",
  "Cumin",
  "Coconut Milk",
  "Almonds",
  "Walnuts",
];

const CLOUD_SIZE = 14;

const toId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface SelectedIngredient {
  id: string;
  name: string;
  quantity: string;
}

interface IngredientChip {
  id: string;
  name: string;
}

interface NutritionValue {
  value: number | string;
  unit: string;
}

interface Macronutrients {
  protein: NutritionValue;
  carbohydrates: NutritionValue;
  fats: NutritionValue;
}

interface Nutrition {
  servingSize: string;
  calories: NutritionValue;
  macronutrients: Macronutrients;
}

interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

interface RecipeInstruction {
  step: number;
  instruction: string;
}

interface Recipe {
  title: string;
  description: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutrition: Nutrition;
}

interface MealPlan {
  success: boolean;
  recipe: Recipe;
  message?: string;
}

export default function LandingHero() {
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [manualInput, setManualInput] = useState("");
  const [fadingIndex, setFadingIndex] = useState<number | null>(null);
  const selectedRef = useRef<SelectedIngredient[]>([]);
  const [cloudIngredients, setCloudIngredients] = useState<IngredientChip[]>(
    ALL_INGREDIENTS.slice(0, CLOUD_SIZE).map((name) => ({
      id: toId(name),
      name,
    })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    selectedRef.current = selectedIngredients;
  }, [selectedIngredients]);

  useEffect(() => {
    const shuffled = [...ALL_INGREDIENTS].sort(() => 0.5 - Math.random());
    setCloudIngredients(
      shuffled.slice(0, CLOUD_SIZE).map((name) => ({
        id: toId(name),
        name,
      })),
    );
  }, []);

  const selectedIds = useMemo(
    () => new Set(selectedIngredients.map((ingredient) => ingredient.id)),
    [selectedIngredients],
  );

  const pickReplacement = (excludeIds: Set<string>) => {
    const available = ALL_INGREDIENTS.filter(
      (name) => !excludeIds.has(toId(name)),
    );
    if (available.length === 0) {
      return null;
    }
    const name = available[Math.floor(Math.random() * available.length)];
    return { id: toId(name), name };
  };

  const addSelectedIngredient = (ingredient: IngredientChip) => {
    if (selectedIds.has(ingredient.id)) {
      return;
    }
    setSelectedIngredients((prev) => [
      ...prev,
      { id: ingredient.id, name: ingredient.name, quantity: "" },
    ]);
    setError("");
  };

  const handleCloudPick = (ingredient: IngredientChip, index: number) => {
    addSelectedIngredient(ingredient);
    setFadingIndex(index);
    window.setTimeout(() => {
      setCloudIngredients((prev) => {
        const excludeIds = new Set([
          ...prev.map((item) => item.id),
          ...selectedRef.current.map((item) => item.id),
        ]);
        excludeIds.add(ingredient.id);
        const replacement = pickReplacement(excludeIds);
        if (!replacement) {
          return prev;
        }
        const next = [...prev];
        next[index] = replacement;
        return next;
      });
      setFadingIndex(null);
    }, 180);
  };

  const handleManualAdd = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      return;
    }
    const ingredient = { id: toId(trimmed), name: trimmed };
    addSelectedIngredient(ingredient);
    setManualInput("");
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((ingredient) => ingredient.id !== ingredientId),
    );
  };

  const handleGenerateMealPlan = async () => {
    if (selectedIngredients.length === 0) {
      setError("Please select at least one ingredient");
      return;
    }

    setLoading(true);
    setError("");
    setMealPlan(null);

    try {
      console.log("Sending request with ingredients:", selectedIngredients);
      const response = await axios.post("/api/generate-meal-plan", {
        ingredients: selectedIngredients,
      });

      console.log("API Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);

      setMealPlan(response.data);
    } catch (err) {
      setError("Failed to generate meal plan. Please try again.");
      console.error("API Error:", err);
      console.error("Error Response:", (err as any)?.response);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedIngredients([]);
    setMealPlan(null);
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f3ee] dark:bg-[#070707] transition-colors">
      <div className="relative overflow-hidden">
        <div className="absolute -top-32 left-8 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute top-16 right-6 h-80 w-80 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-500/10" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-300/30 blur-3xl dark:bg-rose-500/10" />
      </div>

      <header className="w-full py-6 px-6 md:px-12 border-b border-stone-200/80 dark:border-stone-800 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white font-display">
              AI Chef
            </h1>
          </div>
        </div>
      </header>

      <main
        id="discover"
        className="flex-1 w-full px-6 md:px-12 py-16 md:py-24 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {!mealPlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-start">
              <div className="flex flex-col gap-10">
                <div className="w-fit">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm font-semibold text-amber-900 dark:text-amber-100">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Interactive Ingredient Discovery
                  </span>
                </div>

                <div className="space-y-5">
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-white font-display">
                    Build flavors
                    <br />
                    like a game.
                  </h2>
                  <p className="text-lg md:text-xl text-stone-600 dark:text-stone-300 leading-relaxed max-w-md">
                    Tap a chip, watch the cloud refill instantly, then generate
                    a chef-grade plan from your personalized tray.
                  </p>
                </div>
                <div>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleManualAdd();
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      id="manual-ingredient"
                      value={manualInput}
                      onChange={(event) => setManualInput(event.target.value)}
                      placeholder="Add ingredient..."
                      className="flex-1 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111111] px-4 py-3 text-sm font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                    />

                    <button
                      type="submit"
                      className="rounded-full bg-stone-900 text-white px-12 py-3 text-sm font-semibold hover:bg-stone-800 dark:bg-white dark:text-stone-900"
                    >
                      Add
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-200/80 dark:border-stone-800">
                  <div>
                    <div className="text-2xl md:text-3xl font-semibold text-amber-600 dark:text-amber-400">
                      10k+
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Recipes Generated
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-semibold text-black dark:text-white">
                      95%
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Zero Waste
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-semibold text-black dark:text-white">
                      24/7
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Always Available
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-[#0d0d0d]/90 shadow-xl shadow-stone-200/40 dark:shadow-black/40 backdrop-blur">
                <div className="p-8 md:p-10">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-stone-500 dark:text-stone-400">
                        Dynamic Cloud
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-stone-900 dark:text-white font-display">
                        Tap to collect, watch it refill.
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {cloudIngredients.map((ingredient, index) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => handleCloudPick(ingredient, index)}
                        aria-label={`Add ${ingredient.name} to selection`}
                        className={`inline-flex rounded-full border border-stone-200/70 dark:border-stone-700 bg-white/80 dark:bg-[#141414] px-4 py-2.75 text-sm font-semibold text-stone-700 dark:text-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400/70 whitespace-nowrap ${
                          fadingIndex === index
                            ? "opacity-0 translate-y-2"
                            : "opacity-100 translate-y-0 animate-fade-slide"
                        }`}
                      >
                        {ingredient.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-200/80 dark:border-stone-800 px-8 pb-8">
                  <div className="mt-6 flex flex-col gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-stone-500 dark:text-stone-400">
                        Selection Tray
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedIngredients.length === 0 ? (
                          <span className="text-sm text-stone-400">
                            Your selections appear here.
                          </span>
                        ) : (
                          selectedIngredients.map((ingredient) => (
                            <span
                              key={ingredient.id}
                              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-900 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 line-through decoration-stone-400/60"
                            >
                              {ingredient.name}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveIngredient(ingredient.id)
                                }
                                aria-label={`Remove ${ingredient.name}`}
                                className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-200">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Every tap adds to your plan. Ready to cook?
                      </p>
                      <button
                        onClick={handleGenerateMealPlan}
                        disabled={loading || selectedIngredients.length === 0}
                        className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-stone-700"
                      >
                        {loading
                          ? "Generating Meal Plan..."
                          : "Generate Meal Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8 flex flex-col items-center">
              <ResultsDisplay mealPlan={mealPlan} />

              <button
                onClick={handleReset}
                className="w-[30%] rounded-full bg-stone-900 text-white py-3 px-6 text-sm font-semibold hover:bg-stone-800 dark:bg-white dark:text-stone-900"
              >
                Create Another Meal Plan
              </button>
            </div>
          )}
        </div>
      </main>

      {!mealPlan && (
        <section className="w-full py-16 px-6 md:px-12 border-t border-stone-200/80 dark:border-stone-800 bg-gradient-to-br from-amber-50 dark:from-amber-900/10 to-transparent relative z-10">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-semibold text-stone-900 dark:text-white font-display">
              Ready to transform your kitchen?
            </h3>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Start creating personalized recipes in seconds. No subscription
              required.
            </p>
            <a
              href="#discover"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold hover:scale-105 active:scale-95 transition-transform"
            >
              <span>Try It Now</span>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
