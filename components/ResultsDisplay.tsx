"use client";

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

export default function ResultsDisplay({ mealPlan }: { mealPlan: MealPlan }) {
  if (!mealPlan.success) {
    return (
      <div className="text-stone-600 dark:text-stone-400 text-center py-8">
        <p>Unable to generate recipe. Please try again.</p>
      </div>
    );
  }

  const { recipe } = mealPlan;

  return (
    <div className="space-y-8">
      {/* Recipe Header */}
      <div className="rounded-[32px] border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-[#0d0d0d]/90 shadow-xl shadow-stone-200/40 dark:shadow-black/40 backdrop-blur p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500 dark:text-stone-400">
          Your Personalized Recipe
        </p>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold text-stone-900 dark:text-white mb-3 leading-tight font-display">
          {recipe.title}
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-300 mb-6">
          {recipe.description}
        </p>

        {/* Recipe Metadata */}
        <div className="flex flex-wrap gap-6 text-sm text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Servings:
            </span>
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Prep:
            </span>
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Cook:
            </span>
            <span>{recipe.cookTime}</span>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      {recipe.ingredients.length > 0 && (
        <div className="rounded-[32px] border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-[#0d0d0d]/90 shadow-xl shadow-stone-200/40 dark:shadow-black/40 backdrop-blur p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500 dark:text-stone-400">
            Ingredients
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-stone-900 dark:text-white mb-8 font-display">
            What you'll need
          </h3>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-stone-700 dark:text-stone-300"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2"></span>
                <span>
                  {ingredient.quantity}
                  {ingredient.unit && ` ${ingredient.unit}`} of{" "}
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {ingredient.name}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions Section */}
      {recipe.instructions.length > 0 && (
        <div className="rounded-[32px] border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-[#0d0d0d]/90 shadow-xl shadow-stone-200/40 dark:shadow-black/40 backdrop-blur p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500 dark:text-stone-400">
            Cooking Steps
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-stone-900 dark:text-white mb-8 font-display">
            Follow these steps to cook
          </h3>

          <div className="space-y-4">
            {recipe.instructions.map((instruction) => (
              <div
                key={instruction.step}
                className="flex gap-4 p-5 rounded-2xl border border-stone-200/70 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-semibold text-sm">
                  {instruction.step}
                </div>
                <p className="text-stone-700 dark:text-stone-200 leading-relaxed pt-0.5">
                  {instruction.instruction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Section */}
      <div className="rounded-[32px] border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-[#0d0d0d]/90 shadow-xl shadow-stone-200/40 dark:shadow-black/40 backdrop-blur p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500 dark:text-stone-400">
          Nutritional Information
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-stone-900 dark:text-white mb-2 font-display">
          Nutrition breakdown
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-8">
          Per serving ({recipe.nutrition.servingSize})
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-stone-200/70 dark:border-stone-700 p-5 text-center">
            <p className="text-stone-600 dark:text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Calories
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-semibold text-stone-900 dark:text-white">
                {recipe.nutrition.calories.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {recipe.nutrition.calories.unit}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 dark:border-stone-700 p-5 text-center">
            <p className="text-stone-600 dark:text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Protein
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-semibold text-stone-900 dark:text-white">
                {recipe.nutrition.macronutrients.protein.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {recipe.nutrition.macronutrients.protein.unit}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 dark:border-stone-700 p-5 text-center">
            <p className="text-stone-600 dark:text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Carbs
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-semibold text-stone-900 dark:text-white">
                {recipe.nutrition.macronutrients.carbohydrates.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {recipe.nutrition.macronutrients.carbohydrates.unit}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 dark:border-stone-700 p-5 text-center">
            <p className="text-stone-600 dark:text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Fats
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-semibold text-stone-900 dark:text-white">
                {recipe.nutrition.macronutrients.fats.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {recipe.nutrition.macronutrients.fats.unit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
