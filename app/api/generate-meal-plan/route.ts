import { NextRequest, NextResponse } from "next/server";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterApiResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body as { ingredients: Ingredient[] };

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients provided" },
        { status: 400 },
      );
    }

    const ingredientList = ingredients
      .map((ing: Ingredient) =>
        ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name,
      )
      .join(", ");

    const prompt = `You are a professional chef.

Create ONE simple recipe using ONLY these ingredients:
${ingredientList}

Rules:
- Keep the response concise.
- No extra explanations.
- Keep instructions short (max 5 steps).
- Use simple estimates for nutrition.

Return EXACTLY this format:

RECIPE_TITLE: 
DESCRIPTION: 
SERVINGS: 
PREP_TIME: 
COOK_TIME: 

INGREDIENTS:
- name | quantity | unit

INSTRUCTIONS:
1. 
2. 
3. 

NUTRITION_PER_SERVING:
- Calories: 
- Protein: 
- Carbohydrates: 
- Fats: 
- Serving Size:`;

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      console.error("OPENROUTER_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 },
      );
    }

    //console.log("Calling OpenRouter API with model: gpt-3.5-turbo");

    const modelName = "openai/gpt-3.5-turbo";
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    //console.log(response);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
      });
      return NextResponse.json(
        {
          error: `OpenRouter API error: ${response.status} ${response.statusText}`,
          details: errorData,
        },
        { status: 500 },
      );
    }

    const data = (await response.json()) as OpenRouterApiResponse;
    //console.log("OpenRouter API response data:", data);
    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected OpenRouter response format:", data);
      return NextResponse.json(
        {
          error: "Invalid response from OpenRouter API",
          details: "Missing expected response format",
        },
        { status: 500 },
      );
    }

    const content = data.choices[0].message.content;

    // Parse the response
    const mealPlan = parseAIResponse(content);

    return NextResponse.json(mealPlan);
  } catch (error: unknown) {
    const errorObj = error as Error & {
      response?: {
        status?: number;
        data?: unknown;
      };
    };

    console.error("Error generating meal plan:", {
      message: errorObj?.message,
      name: errorObj?.name,
      stack: errorObj?.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to generate meal plan",
        details: errorObj?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

function parseAIResponse(content: string): MealPlan {
  try {
    // Parse title
    const titleMatch = content.match(
      /RECIPE_TITLE:\s*(.+?)(?=\n|DESCRIPTION:)/i,
    );
    const title = titleMatch ? titleMatch[1].trim() : "Delicious Meal";

    // Parse description
    const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?=\n|SERVINGS:)/i);
    const description = descMatch ? descMatch[1].trim() : "A delicious meal";

    // Parse servings
    const servingsMatch = content.match(/SERVINGS:\s*(.+?)(?=\n|PREP_TIME:)/i);
    const servings = servingsMatch ? servingsMatch[1].trim() : "2-4";

    // Parse prep time
    const prepMatch = content.match(/PREP_TIME:\s*(.+?)(?=\n|COOK_TIME:)/i);
    const prepTime = prepMatch ? prepMatch[1].trim() : "15 minutes";

    // Parse cook time
    const cookMatch = content.match(/COOK_TIME:\s*(.+?)(?=\n|INGREDIENTS:)/i);
    const cookTime = cookMatch ? cookMatch[1].trim() : "30 minutes";

    // Parse ingredients
    const ingredientsMatch = content.match(
      /INGREDIENTS:([\s\S]*?)(?=\n\nINSTRUCTIONS:|INSTRUCTIONS:)/i,
    );
    const ingredients: RecipeIngredient[] = [];
    if (ingredientsMatch) {
      const ingredientLines = ingredientsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"));

      ingredientLines.forEach((line) => {
        const cleaned = line.replace(/^-\s*/, "").trim();
        const parts = cleaned.split("|").map((p) => p.trim());

        if (parts.length >= 2) {
          ingredients.push({
            name: parts[0],
            quantity: parts[1] || "to taste",
            unit: parts[2] || "",
          });
        }
      });
    }

    // Parse instructions
    const instructionsMatch = content.match(
      /INSTRUCTIONS:([\s\S]*?)(?=\n\nNUTRITION_PER_SERVING:|NUTRITION_PER_SERVING:)/i,
    );
    const instructions: RecipeInstruction[] = [];
    if (instructionsMatch) {
      const instructionLines = instructionsMatch[1]
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\./));

      instructionLines.forEach((line) => {
        const match = line.match(/^(\d+)\.\s*(.+)/);
        if (match) {
          instructions.push({
            step: parseInt(match[1]),
            instruction: match[2].trim(),
          });
        }
      });
    }

    // Parse nutrition
    const nutritionMatch = content.match(/NUTRITION_PER_SERVING:([\s\S]*?)$/i);
    const nutrition: Nutrition = {
      servingSize: "1 serving",
      calories: { value: "N/A", unit: "kcal" },
      macronutrients: {
        protein: { value: "N/A", unit: "g" },
        carbohydrates: { value: "N/A", unit: "g" },
        fats: { value: "N/A", unit: "g" },
      },
    };

    if (nutritionMatch) {
      const nutritionText = nutritionMatch[1];

      // Parse calories
      const caloriesMatch = nutritionText.match(/Calories:\s*(\d+)\s*(kcal)?/i);
      if (caloriesMatch) {
        nutrition.calories = {
          value: parseInt(caloriesMatch[1]),
          unit: "kcal",
        };
      }

      // Parse protein
      const proteinMatch = nutritionText.match(/Protein:\s*(\d+)\s*g/i);
      if (proteinMatch) {
        nutrition.macronutrients.protein = {
          value: parseInt(proteinMatch[1]),
          unit: "g",
        };
      }

      // Parse carbs
      const carbsMatch = nutritionText.match(/Carbohydrates?:\s*(\d+)\s*g/i);
      if (carbsMatch) {
        nutrition.macronutrients.carbohydrates = {
          value: parseInt(carbsMatch[1]),
          unit: "g",
        };
      }

      // Parse fats
      const fatsMatch = nutritionText.match(/Fats?:\s*(\d+)\s*g/i);
      if (fatsMatch) {
        nutrition.macronutrients.fats = {
          value: parseInt(fatsMatch[1]),
          unit: "g",
        };
      }

      // Parse serving size
      const servingSizeMatch = nutritionText.match(
        /Serving Size:\s*(.+?)(?=\n|$)/i,
      );
      if (servingSizeMatch) {
        nutrition.servingSize = servingSizeMatch[1].trim();
      }
    }

    return {
      success: true,
      recipe: {
        title,
        description,
        servings,
        prepTime,
        cookTime,
        ingredients,
        instructions,
        nutrition,
      },
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      success: false,
      recipe: {
        title: "Error",
        description: "Failed to parse recipe",
        servings: "N/A",
        prepTime: "N/A",
        cookTime: "N/A",
        ingredients: [],
        instructions: [],
        nutrition: {
          servingSize: "1 serving",
          calories: { value: "N/A", unit: "kcal" },
          macronutrients: {
            protein: { value: "N/A", unit: "g" },
            carbohydrates: { value: "N/A", unit: "g" },
            fats: { value: "N/A", unit: "g" },
          },
        },
      },
      message: "Failed to parse recipe data",
    };
  }
}
