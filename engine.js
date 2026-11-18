// Motor nutricional offline: cálculo de metas, filtro de restrições, ajuste de porções e lista de compras
window.DietEngine = (function () {
  const DAYS_OF_WEEK = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  const ACTIVITY_FACTORS = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725
  };

  const GOAL_LABELS = {
    emagrecimento: "Emagrecimento",
    recomposicao: "Recomposição corporal",
    manutencao: "Manutenção e organização",
    hipertrofia: "Ganho de massa muscular"
  };

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function roundTo5(val) {
    return Math.max(5, Math.round(val / 5) * 5);
  }

  function calculateTargets(profile) {
    const peso = Number(profile.peso);
    const altura = Number(profile.altura);
    const idade = Number(profile.idade);
    const isMale = profile.sexo === "M";

    // Mifflin-St Jeor
    const tmb = 10 * peso + 6.25 * altura - 5 * idade + (isMale ? 5 : -161);
    const factor = ACTIVITY_FACTORS[profile.atividade] || 1.375;
    const get = tmb * factor;

    let kcalTarget = get;
    if (profile.objetivo === "emagrecimento") {
      kcalTarget = get - Math.min(450, get * 0.2);
    } else if (profile.objetivo === "recomposicao") {
      kcalTarget = get - get * 0.08;
    } else if (profile.objetivo === "hipertrofia") {
      kcalTarget = get + 280;
    }

    const minSafeKcal = isMale ? 1400 : 1200;
    kcalTarget = Math.round(Math.max(minSafeKcal, kcalTarget) / 10) * 10;

    const proteinPerKg =
      profile.objetivo === "hipertrofia" || profile.objetivo === "recomposicao"
        ? 1.9
        : profile.objetivo === "emagrecimento"
        ? 1.8
        : 1.5;

    const proteinG = Math.round(peso * proteinPerKg);
    const fatG = Math.round(Math.max(peso * 0.75, (kcalTarget * 0.25) / 9));
    const remainingKcal = Math.max(200, kcalTarget - proteinG * 4 - fatG * 9);
    const carbG = Math.round(remainingKcal / 4);
    const fiberG = Math.round(Math.max(24, (kcalTarget / 1000) * 14));

    return {
      tmb: Math.round(tmb),
      get: Math.round(get),
      kcal: kcalTarget,
      protein: proteinG,
      carbs: carbG,
      fat: fatG,
      fiber: fiberG
    };
  }

  function isRecipeAllowed(recipe, restrictions, dislikes) {
    const tags = recipe.tags || [];
    if (restrictions.includes("sem_lactose") && tags.includes("lactose")) return false;
    if (restrictions.includes("sem_gluten") && tags.includes("gluten")) return false;
    if (restrictions.includes("sem_ovo") && tags.includes("ovo")) return false;
    if (restrictions.includes("sem_peixe") && tags.includes("peixe")) return false;
    if (restrictions.includes("sem_carne_vermelha") && tags.includes("carne_vermelha")) return false;
    if (
      restrictions.includes("vegetariano") &&
      (tags.includes("frango") || tags.includes("carne_vermelha") || tags.includes("peixe"))
    ) {
      return false;
    }

    if (dislikes.length > 0) {
      const recipeText = normalizeText(
        recipe.name + " " + recipe.ingredients.map((i) => i.name).join(" ")
      );
      for (const item of dislikes) {
        if (item.length >= 3 && recipeText.includes(item)) {
          return false;
        }
      }
    }
    return true;
  }

  function computeRecipeMacros(ingredients) {
    let kcal = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    for (const ing of ingredients) {
      const factor = ing.grams / 100;
      kcal += ing.kcal100 * factor;
      protein += ing.p100 * factor;
      carbs += ing.c100 * factor;
      fat += ing.g100 * factor;
      fiber += ing.fib100 * factor;
    }

    return {
      kcal: Math.round(kcal),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber)
    };
  }

  function scaleRecipe(recipe, scaleFactor) {
    const clamped = Math.min(1.8, Math.max(0.6, scaleFactor));
    const scaledIngredients = recipe.ingredients.map((ing) => {
      const newGrams = ing.scalable ? roundTo5(ing.grams * clamped) : ing.grams;
      return {
        ...ing,
        grams: newGrams
      };
    });
    const macros = computeRecipeMacros(scaledIngredients);
    return {
      ...recipe,
      ingredients: scaledIngredients,
      macros
    };
  }

  function getSlotTemplate(mealCount) {
    if (mealCount === 3) {
      return [
        { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.25 },
        { key: "almoco", label: "Almoço", category: "principal", share: 0.40 },
        { key: "jantar", label: "Jantar", category: "principal", share: 0.35 }
      ];
    }
    if (mealCount === 5) {
      return [
        { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.22 },
        { key: "lanche1", label: "Lanche da manhã", category: "lanche", share: 0.12 },
        { key: "almoco", label: "Almoço", category: "principal", share: 0.30 },
        { key: "lanche2", label: "Lanche da tarde", category: "lanche", share: 0.12 },
        { key: "jantar", label: "Jantar", category: "principal", share: 0.24 }
      ];
    }
    // Padrão 4 refeições
    return [
      { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.22 },
      { key: "almoco", label: "Almoço", category: "principal", share: 0.34 },
      { key: "lanche", label: "Lanche da tarde", category: "lanche", share: 0.14 },
      { key: "jantar", label: "Jantar", category: "principal", share: 0.30 }
    ];
  }

  function formatQuantity(grams) {
    if (grams >= 1000) {
      return (grams / 1000).toFixed(2).replace(".", ",") + " kg";
    }
    return Math.round(grams) + " g";
  }

  function generatePlan(profile) {
    const targets = calculateTargets(profile);
    const restrictions = profile.restricoes || [];
    const selectedDislikes = (profile.aversoesSelecionadas || []).flatMap((item) =>
      String(item)
        .split("/")
        .map(normalizeText)
        .filter(Boolean)
    );
    const typedDislikes = (profile.aversoes || "")
      .split(",")
      .map(normalizeText)
      .filter(Boolean);
    const dislikes = Array.from(new Set([...selectedDislikes, ...typedDislikes]));

    const bank = window.RECIPE_BANK || [];
    const filterByCat = (cat) => {
      const allowed = bank.filter(
        (r) => r.category === cat && isRecipeAllowed(r, restrictions, dislikes)
      );
      if (allowed.length > 0) return allowed;
      // Fallback caso aversões em texto livre zerem alguma categoria: respeita ao menos restrições clínicas
      const safeFallback = bank.filter(
        (r) => r.category === cat && isRecipeAllowed(r, restrictions, [])
      );
      return safeFallback.length > 0 ? safeFallback : bank.filter((r) => r.category === cat);
    };

    const maxMain = profile.variacao === "variada" ? 3 : 2;
    const maxOther = profile.variacao === "variada" ? 2 : 2;

    const poolCafe = filterByCat("cafe").slice(0, maxOther);
    const poolPrincipal = filterByCat("principal").slice(0, maxMain);
    const poolLanche = filterByCat("lanche").slice(0, maxOther);

    const slots = getSlotTemplate(Number(profile.refeicoes) || 4);

    // Pré-escala cada receita selecionada para seu papel típico
    const scaledRegistry = new Map();
    function getScaledForSlot(recipe, targetSlotKcal) {
      const key = `${recipe.id}__${Math.round(targetSlotKcal / 25) * 25}`;
      if (!scaledRegistry.has(key)) {
        const baseMacros = computeRecipeMacros(recipe.ingredients);
        const factor = baseMacros.kcal > 0 ? targetSlotKcal / baseMacros.kcal : 1;
        scaledRegistry.set(key, scaleRecipe(recipe, factor));
      }
      return scaledRegistry.get(key);
    }

    const days = DAYS_OF_WEEK.map((dayName, dayIndex) => {
      const meals = slots.map((slot, slotIndex) => {
        const pool =
          slot.category === "cafe"
            ? poolCafe
            : slot.category === "principal"
            ? poolPrincipal
            : poolLanche;

        // Alterna com baixa variação semanal
        const pickIndex =
          slot.category === "principal"
            ? (dayIndex + (slot.key === "jantar" ? 1 : 0)) % pool.length
            : (dayIndex + slotIndex) % pool.length;

        const baseRecipe = pool[pickIndex];
        const slotTargetKcal = targets.kcal * slot.share;
        const scaled = getScaledForSlot(baseRecipe, slotTargetKcal);

        return {
          slotLabel: slot.label,
          recipe: scaled
        };
      });

      const totals = meals.reduce(
        (acc, m) => ({
          kcal: acc.kcal + m.recipe.macros.kcal,
          protein: acc.protein + m.recipe.macros.protein,
          carbs: acc.carbs + m.recipe.macros.carbs,
          fat: acc.fat + m.recipe.macros.fat,
          fiber: acc.fiber + m.recipe.macros.fiber
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      return {
        dayName,
        meals,
        totals
      };
    });

    // Médias reais da semana
    const weeklyAvg = days.reduce(
      (acc, d) => ({
        kcal: acc.kcal + d.totals.kcal / 7,
        protein: acc.protein + d.totals.protein / 7,
        carbs: acc.carbs + d.totals.carbs / 7,
        fat: acc.fat + d.totals.fat / 7,
        fiber: acc.fiber + d.totals.fiber / 7
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    Object.keys(weeklyAvg).forEach((k) => {
      weeklyAvg[k] = Math.round(weeklyAvg[k]);
    });

    // Receitas únicas usadas na semana + contagem de porções
    const uniqueRecipesMap = new Map();
    const batchItemsMap = new Map();
    const freshItemsMap = new Map();

    days.forEach((day) => {
      day.meals.forEach((meal) => {
        const r = meal.recipe;
        if (!uniqueRecipesMap.has(r.id)) {
          uniqueRecipesMap.set(r.id, { recipe: r, count: 0 });
        }
        uniqueRecipesMap.get(r.id).count += 1;

        r.ingredients.forEach((ing) => {
          const rawFactor = ing.rawFactor || 1;
          const purchaseGrams = ing.grams * rawFactor;
          const targetMap = ing.isBatch ? batchItemsMap : freshItemsMap;
          const itemKey = `${ing.sector}::${ing.name}`;

          if (!targetMap.has(itemKey)) {
            targetMap.set(itemKey, {
              id: normalizeText(itemKey).replace(/[^a-z0-9]+/g, "-"),
              name: ing.name,
              sector: ing.sector,
              totalGrams: 0,
              hasRawAdjustment: rawFactor !== 1
            });
          }
          targetMap.get(itemKey).totalGrams += purchaseGrams;
        });
      });
    });

    const groupBySector = (map) => {
      const sectorsOrder = [
        "Açougue & Peixaria",
        "Hortifrúti",
        "Laticínios & Ovos",
        "Mercearia & Grãos",
        "Temperos / Conferir em Casa"
      ];
      const grouped = {};
      for (const item of map.values()) {
        if (!grouped[item.sector]) grouped[item.sector] = [];
        grouped[item.sector].push({
          ...item,
          displayQty: formatQuantity(item.totalGrams)
        });
      }
      return sectorsOrder
        .filter((s) => grouped[s] && grouped[s].length > 0)
        .map((sector) => ({
          sector,
          items: grouped[sector].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        }));
    };

    const uniqueRecipes = Array.from(uniqueRecipesMap.values());
    const freezerBatches = uniqueRecipes.filter((entry) => entry.recipe.freezable);

    return {
      profile: {
        ...profile,
        objetivoLabel: GOAL_LABELS[profile.objetivo] || profile.objetivo
      },
      targets,
      weeklyAvg,
      days,
      uniqueRecipes,
      freezerBatches,
      shopping: {
        lote: groupBySector(batchItemsMap),
        frescos: groupBySector(freshItemsMap)
      }
    };
  }

  return {
    generatePlan
  };
})();
