// Motor nutricional offline: cálculo de metas, substituição inteligente de acompanhamentos, rotação sem repetição e lista de compras
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
    manutencao: "Manutenção e saúde",
    hipertrofia: "Ganho de massa muscular"
  };

  const FALLBACK_FRUITS = [
    { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" },
    { name: "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, role: "fruit" },
    { name: "Mamão formosa", sector: "Hortifrúti", grams: 140, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false, role: "fruit" },
    { name: "Morango fresco", sector: "Hortifrúti", grams: 120, kcal100: 30, p100: 0.9, c100: 6.8, g100: 0.3, fib100: 1.7, scalable: true, isBatch: false, role: "fruit" }
  ];

  const FALLBACK_VEGS = [
    { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 110, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
    { name: "Cenoura e vagem refogadas", sector: "Hortifrúti", grams: 100, kcal100: 38, p100: 1.4, c100: 8.2, g100: 0.2, fib100: 2.8, scalable: false, isBatch: false, role: "veg" },
    { name: "Brócolis cozido", sector: "Hortifrúti", grams: 100, kcal100: 25, p100: 2.1, c100: 4.4, g100: 0.5, fib100: 3.4, scalable: false, isBatch: false, role: "veg" },
    { name: "Abobrinha grelhada", sector: "Hortifrúti", grams: 100, kcal100: 19, p100: 1.1, c100: 3.5, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
    { name: "Abóbora cabotiá cozida", sector: "Hortifrúti", grams: 110, kcal100: 48, p100: 1.4, c100: 10.8, g100: 0.7, fib100: 2.5, scalable: false, isBatch: false, role: "veg" }
  ];

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

  function matchesDislike(text, dislikes) {
    if (!dislikes || dislikes.length === 0) return false;
    const norm = normalizeText(text);
    for (const item of dislikes) {
      if (item.length >= 3 && norm.includes(item)) {
        return true;
      }
    }
    return false;
  }

  // Adapta acompanhamentos (frutas/legumes) caso o usuário não goste de um acompanhamento específico,
  // e só descarta a receita se o ingrediente principal (core) for incompatível com as restrições/aversões.
  function adaptAndFilterRecipe(recipe, restrictions, dislikes) {
    const tags = recipe.tags || [];
    if (restrictions.includes("sem_lactose") && tags.includes("lactose")) return null;
    if (restrictions.includes("sem_gluten") && tags.includes("gluten")) return null;
    if (restrictions.includes("sem_ovo") && tags.includes("ovo")) return null;
    if (restrictions.includes("sem_peixe") && tags.includes("peixe")) return null;
    if (restrictions.includes("sem_carne_vermelha") && tags.includes("carne_vermelha")) return null;
    if (
      restrictions.includes("vegetariano") &&
      (tags.includes("frango") || tags.includes("carne_vermelha") || tags.includes("peixe"))
    ) {
      return null;
    }

    const adaptedIngredients = [];
    let adaptedName = recipe.name;

    for (const ing of recipe.ingredients) {
      if (!matchesDislike(ing.name, dislikes)) {
        adaptedIngredients.push(ing);
        continue;
      }

      // Se for fruta ou legume de acompanhamento, tenta substituir por outro que o usuário goste
      if (ing.role === "fruit") {
        const replacement = FALLBACK_FRUITS.find((f) => !matchesDislike(f.name, dislikes));
        if (replacement) {
          adaptedIngredients.push({ ...replacement });
          adaptedName = adaptedName.replace(/mamão|banana|maçã|morango/gi, replacement.name.split(" ")[0].toLowerCase());
          continue;
        }
      } else if (ing.role === "veg") {
        const replacement = FALLBACK_VEGS.find((v) => !matchesDislike(v.name, dislikes));
        if (replacement) {
          adaptedIngredients.push({ ...replacement });
          adaptedName = adaptedName.replace(/brócolis|abobrinha|abóbora|cenoura|salada/gi, "legumes");
          continue;
        }
      }

      // Ingrediente principal na lista de aversões -> descarta a receita
      return null;
    }

    return {
      ...recipe,
      name: adaptedName,
      ingredients: adaptedIngredients
    };
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
    const clamped = Math.min(1.85, Math.max(0.55, scaleFactor));
    const scaledIngredients = recipe.ingredients.map((ing) => {
      const newGrams = ing.scalable ? roundTo5(ing.grams * clamped) : ing.grams;
      const factor = newGrams / 100;
      return {
        ...ing,
        grams: newGrams,
        kcal: Math.round(ing.kcal100 * factor),
        protein: Math.round(ing.p100 * factor),
        carbs: Math.round(ing.c100 * factor),
        fat: Math.round(ing.g100 * factor)
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
    if (mealCount === 5) {
      return [
        { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.20 },
        { key: "lanche1", label: "Lanche da manhã", category: "lanche", share: 0.10 },
        { key: "almoco", label: "Almoço", category: "principal", share: 0.28 },
        { key: "lanche2", label: "Café da tarde", category: "lanche", share: 0.12 },
        { key: "jantar", label: "Jantar", category: "principal", share: 0.20 },
        { key: "ceia", label: "Ceia noturna (fome à noite ou madrugada)", category: "ceia", share: 0.10 }
      ];
    }
    // Tanto para 3 quanto 4 refeições, exibe Café da manhã, Almoço, Café da tarde, Jantar e Ceia noturna
    return [
      { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.20 },
      { key: "almoco", label: "Almoço", category: "principal", share: 0.30 },
      { key: "lanche", label: "Café da tarde", category: "lanche", share: 0.13 },
      { key: "jantar", label: "Jantar", category: "principal", share: 0.27 },
      { key: "ceia", label: "Ceia noturna (fome à noite ou madrugada)", category: "ceia", share: 0.10 }
    ];
  }

  function formatQuantity(grams) {
    if (grams >= 1000) {
      return (grams / 1000).toFixed(2).replace(".", ",") + " kg";
    }
    return Math.round(grams) + " g";
  }

  function recomputePlanAggregates(plan) {
    const days = plan.days;
    days.forEach((day) => {
      day.totals = day.meals.reduce(
        (acc, m) => ({
          kcal: acc.kcal + m.recipe.macros.kcal,
          protein: acc.protein + m.recipe.macros.protein,
          carbs: acc.carbs + m.recipe.macros.carbs,
          fat: acc.fat + m.recipe.macros.fat,
          fiber: acc.fiber + m.recipe.macros.fiber
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );
    });

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
    plan.weeklyAvg = weeklyAvg;
    plan.uniqueRecipes = uniqueRecipes;
    plan.freezerBatches = uniqueRecipes.filter((entry) => entry.recipe.freezable);
    plan.shopping = {
      lote: groupBySector(batchItemsMap),
      frescos: groupBySector(freshItemsMap)
    };
    return plan;
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
      const adapted = bank
        .filter((r) => r.category === cat)
        .map((r) => adaptAndFilterRecipe(r, restrictions, dislikes))
        .filter(Boolean);

      if (adapted.length >= 2) return adapted;

      // Se o usuário marcou aversões demais que deixaram menos de 2 opções, mantém travas clínicas
      const clinicalSafe = bank
        .filter((r) => r.category === cat)
        .map((r) => adaptAndFilterRecipe(r, restrictions, []))
        .filter(Boolean);

      return clinicalSafe.length > 0 ? clinicalSafe : bank.filter((r) => r.category === cat);
    };

    const isPratica = profile.variacao === "pratica";
    const poolCafe = filterByCat("cafe");
    const poolPrincipal = filterByCat("principal");
    const poolLanche = filterByCat("lanche");
    const poolCeia = filterByCat("ceia");

    const poolsByCategory = {
      cafe: poolCafe,
      principal: poolPrincipal,
      lanche: poolLanche,
      ceia: poolCeia
    };

    const slots = getSlotTemplate(Number(profile.refeicoes) || 4);

    function scaleForTarget(recipe, targetSlotKcal) {
      const baseMacros = computeRecipeMacros(recipe.ingredients);
      const factor = baseMacros.kcal > 0 ? targetSlotKcal / baseMacros.kcal : 1;
      return scaleRecipe(recipe, factor);
    }

    // Monta 3 opções para a refeição garantindo opções sem Whey + pelo menos 1 opção com Whey (se disponível)
    function buildSlotOptions(pool, solidCursor, wheyCursor, targetSlotKcal, preferWheyFirst) {
      const solidList = pool.filter((r) => !(r.tags || []).includes("whey"));
      const wheyList = pool.filter((r) => (r.tags || []).includes("whey"));
      const chosen = [];

      const addUnique = (candidate) => {
        if (candidate && !chosen.some((c) => c.id === candidate.id)) {
          chosen.push(scaleForTarget(candidate, targetSlotKcal));
        }
      };

      if (preferWheyFirst) {
        if (wheyList.length > 0) addUnique(wheyList[wheyCursor % wheyList.length]);
        if (solidList.length > 0) addUnique(solidList[solidCursor % solidList.length]);
        if (solidList.length > 1) addUnique(solidList[(solidCursor + 1) % solidList.length]);
        if (wheyList.length > 1 && chosen.length < 3) addUnique(wheyList[(wheyCursor + 1) % wheyList.length]);
      } else {
        if (solidList.length > 0) addUnique(solidList[solidCursor % solidList.length]);
        if (solidList.length > 1) addUnique(solidList[(solidCursor + (isPratica ? 1 : 2)) % solidList.length]);
        if (wheyList.length > 0) addUnique(wheyList[wheyCursor % wheyList.length]);
      }

      for (let k = 0; k < pool.length && chosen.length < Math.min(3, pool.length); k++) {
        addUnique(pool[(solidCursor + k) % pool.length]);
      }

      return chosen;
    }

    let cafeCursor = 0;
    let lancheCursor = 0;
    let ceiaCursor = 0;

    const days = DAYS_OF_WEEK.map((dayName, dayIndex) => {
      const solidPrincipals = poolPrincipal.filter((r) => !(r.tags || []).includes("whey"));
      const mainCount = Math.max(1, solidPrincipals.length);
      const almocoIdx = (dayIndex * 2) % mainCount;
      let jantarIdx = (dayIndex * 2 + 1) % mainCount;
      if (jantarIdx === almocoIdx && mainCount > 1) {
        jantarIdx = (almocoIdx + 1) % mainCount;
      }

      const meals = slots.map((slot) => {
        const pool = poolsByCategory[slot.category] || [];
        let pickIndex = 0;
        let wheyIdx = dayIndex;

        if (slot.key === "almoco") {
          pickIndex = almocoIdx;
          wheyIdx = dayIndex;
        } else if (slot.key === "jantar") {
          pickIndex = jantarIdx;
          wheyIdx = dayIndex + 1;
        } else if (slot.category === "cafe") {
          pickIndex = cafeCursor;
          wheyIdx = cafeCursor;
          cafeCursor += 1;
        } else if (slot.category === "ceia") {
          pickIndex = ceiaCursor;
          wheyIdx = ceiaCursor;
          ceiaCursor += 1;
        } else {
          pickIndex = lancheCursor;
          wheyIdx = lancheCursor;
          lancheCursor += 1;
        }

        const slotTargetKcal = targets.kcal * slot.share;
        const options = buildSlotOptions(
          pool,
          pickIndex,
          wheyIdx,
          slotTargetKcal,
          slot.category === "ceia" && dayIndex % 2 === 0
        );

        return {
          slotKey: slot.key,
          slotLabel: slot.label,
          category: slot.category,
          share: slot.share,
          poolIndex: pickIndex,
          activeOptionIndex: 0,
          options,
          recipe: options[0]
        };
      });

      return {
        dayName,
        meals,
        totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      };
    });

    const plan = {
      profile: {
        ...profile,
        objetivoLabel: GOAL_LABELS[profile.objetivo] || profile.objetivo
      },
      targets,
      poolsByCategory,
      days
    };

    return recomputePlanAggregates(plan);
  }

  // Seleciona uma das 3 opções da refeição ou gira para novas opções do banco
  function selectMealOption(plan, dayIndex, mealIndex, optionIndex) {
    const day = plan.days[dayIndex];
    if (!day || !day.meals[mealIndex]) return plan;

    const meal = day.meals[mealIndex];
    if (!meal.options || !meal.options[optionIndex]) return plan;

    meal.activeOptionIndex = optionIndex;
    meal.recipe = meal.options[optionIndex];
    return recomputePlanAggregates(plan);
  }

  // Permite girar as 3 opções de uma refeição específica mantendo opção sem Whey + opção com Whey
  function swapMealInPlan(plan, dayIndex, mealIndex) {
    const day = plan.days[dayIndex];
    if (!day || !day.meals[mealIndex]) return plan;

    const meal = day.meals[mealIndex];
    const pool = plan.poolsByCategory[meal.category] || [];
    if (pool.length <= 1) return plan;

    const nextPoolIndex = (meal.poolIndex || 0) + 1;
    const slotTargetKcal = plan.targets.kcal * (meal.share || 0.20);
    const solidList = pool.filter((r) => !(r.tags || []).includes("whey"));
    const wheyList = pool.filter((r) => (r.tags || []).includes("whey"));
    const options = [];

    const addScaled = (candidate) => {
      if (candidate && !options.some((o) => o.id === candidate.id)) {
        const baseMacros = computeRecipeMacros(candidate.ingredients);
        const factor = baseMacros.kcal > 0 ? slotTargetKcal / baseMacros.kcal : 1;
        options.push(scaleRecipe(candidate, factor));
      }
    };

    if (solidList.length > 0) addScaled(solidList[nextPoolIndex % solidList.length]);
    if (solidList.length > 1) addScaled(solidList[(nextPoolIndex + 1) % solidList.length]);
    if (wheyList.length > 0) addScaled(wheyList[nextPoolIndex % wheyList.length]);

    for (let k = 0; k < pool.length && options.length < Math.min(3, pool.length); k++) {
      addScaled(pool[(nextPoolIndex + k) % pool.length]);
    }

    meal.poolIndex = nextPoolIndex;
    meal.activeOptionIndex = 0;
    meal.options = options;
    meal.recipe = options[0];

    return recomputePlanAggregates(plan);
  }

  return {
    generatePlan,
    selectMealOption,
    swapMealInPlan
  };
})();
