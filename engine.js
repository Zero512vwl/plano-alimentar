// Motor nutricional offline: cálculo de metas, diretrizes clínicas por doença, adaptação de rotina/trabalho/cozinha e lista de compras
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

  const ROOM_TEMP_PORTABLE_IDS = new Set([
    "lan-fruta-castanha",
    "lan-banana-aveia",
    "lan-fruta-pasta-amendoim",
    "lan-whey-fruta-castanha",
    "lan-shake-whey-banana",
    "alm-shake-substituto-whey",
    "alm-sanduiche-prato-frango"
  ]);

  const NO_REHEAT_MAIN_IDS = new Set([
    "alm-sanduiche-prato-frango",
    "alm-bowl-whey-iogurte",
    "alm-shake-substituto-whey",
    "alm-crepioca-shake-whey"
  ]);

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

  function parsePrepMinutes(prepTime) {
    const match = String(prepTime || "").match(/(\d+)/);
    return match ? Number(match[1]) : 20;
  }

  function calculateTargets(profile) {
    const peso = Number(profile.peso);
    const altura = Number(profile.altura);
    const idade = Number(profile.idade);
    const isMale = profile.sexo === "M";
    const doencas = profile.doencas || [];

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

    // Usa peso ajustado para cálculo de proteína quando IMC >= 30
    const heightM = altura / 100;
    const bmi = heightM > 0 ? peso / (heightM * heightM) : 22;
    let pesoRefProteina = peso;
    if (bmi >= 30) {
      const idealWeight = 25 * (heightM * heightM);
      pesoRefProteina = idealWeight + 0.25 * (peso - idealWeight);
    }

    let proteinPerKg =
      profile.objetivo === "hipertrofia" || profile.objetivo === "recomposicao"
        ? 1.9
        : profile.objetivo === "emagrecimento"
        ? 1.8
        : 1.5;

    // Diretriz Doença Renal Crônica: evita sobrecarga proteica (teto conservador 1,0 g/kg)
    if (doencas.includes("renal_alerta")) {
      proteinPerKg = 1.0;
    }

    const proteinG = Math.round(pesoRefProteina * proteinPerKg);
    const fatShare = doencas.includes("colesterol") ? 0.22 : 0.25;
    const fatG = Math.round(Math.max(pesoRefProteina * 0.70, (kcalTarget * fatShare) / 9));
    const remainingKcal = Math.max(200, kcalTarget - proteinG * 4 - fatG * 9);
    const carbG = Math.round(remainingKcal / 4);
    const baseFiber = Math.round(Math.max(24, (kcalTarget / 1000) * 14));
    const fiberG = doencas.includes("diabetes") || doencas.includes("colesterol")
      ? Math.max(28, baseFiber + 4)
      : baseFiber;

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

  function adaptAndFilterRecipe(recipe, restrictions, dislikes, doencas, habilidade) {
    const tags = recipe.tags || [];
    const prepMins = parsePrepMinutes(recipe.prepTime);

    // Filtro de habilidade culinária básica: descarta receitas longas/complexas (>= 30 min)
    if (habilidade === "basica" && prepMins >= 30) {
      return null;
    }

    // Restrições alimentares
    if (restrictions.includes("sem_lactose") && (tags.includes("lactose") || tags.includes("whey"))) {
      return null;
    }
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

    // Diretrizes por Doença / Condição Clínica
    if (doencas.includes("acido_urico") && tags.includes("carne_vermelha")) {
      return null; // Evita excesso de purinas de carne vermelha na gota/ácido úrico alto
    }
    if (doencas.includes("renal_alerta") && tags.includes("whey")) {
      return null; // Evita suplementos concentrados de proteína na doença renal
    }
    if (doencas.includes("gastrite_refluxo")) {
      const hasCocoa = recipe.ingredients.some((i) => /cacau/i.test(i.name));
      if (hasCocoa || recipe.id === "ceia-abacate-cacau") {
        return null; // Cacau/chocolate e excesso de gordura noturna pioram o refluxo
      }
    }

    const adaptedIngredients = [];
    let adaptedName = recipe.name;
    let adaptedNotes = recipe.notes;

    for (const rawIng of recipe.ingredients) {
      let ing = { ...rawIng };

      // Adaptações automáticas de ingredientes conforme doenças
      if (doencas.includes("diabetes")) {
        if (ing.name === "Pão francês") {
          ing = {
            ...ing,
            name: "Pão de forma integral (baixo IG)",
            kcal100: 253,
            p100: 9.4,
            c100: 49.9,
            g100: 3.7,
            fib100: 6.9
          };
          adaptedName = adaptedName.replace(/Pão francês/gi, "Pão integral");
        } else if (ing.name === "Arroz branco cozido") {
          ing = {
            ...ing,
            name: "Arroz integral cozido (baixo IG)",
            kcal100: 124,
            p100: 2.6,
            c100: 25.8,
            g100: 1.0,
            fib100: 2.7
          };
          adaptedName = adaptedName.replace(/arroz(?! integral)/gi, "arroz integral");
        }
      }

      if (doencas.includes("hipertensao")) {
        if (ing.name === "Queijo minas frescal") {
          ing = {
            ...ing,
            name: "Queijo minas frescal sem sal (ou ricota sem sal)",
            kcal100: 170,
            p100: 15.0,
            c100: 3.5,
            g100: 11.0
          };
        } else if (ing.name === "Requeijão cremoso light") {
          ing = {
            ...ing,
            name: "Ricota cremosa sem sal",
            kcal100: 150,
            p100: 11.5,
            c100: 4.0,
            g100: 10.0
          };
        }
      }

      if (doencas.includes("colesterol")) {
        if (/Iogurte natural/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Iogurte natural desnatado (0% gordura)",
            kcal100: 41,
            p100: 3.8,
            c100: 5.8,
            g100: 0.3
          };
        }
      }

      if (doencas.includes("hipotireoidismo") && /Bebida de soja/i.test(ing.name)) {
        ing = {
          ...ing,
          name: "Leite vegetal de amêndoas ou aveia (sem soja)"
        };
      }

      if (!matchesDislike(ing.name, dislikes)) {
        adaptedIngredients.push(ing);
        continue;
      }

      const alreadyInRecipe = (candidateName) =>
        recipe.ingredients.some((i) => i.name === candidateName) ||
        adaptedIngredients.some((i) => i.name === candidateName);

      if (ing.role === "fruit") {
        const replacement = FALLBACK_FRUITS.find(
          (f) => !matchesDislike(f.name, dislikes) && !alreadyInRecipe(f.name)
        );
        if (replacement) {
          adaptedIngredients.push({ ...replacement });
          const oldWord = ing.name.split(" ")[0];
          const newWord = replacement.name.split(" ")[0].toLowerCase();
          const regex = new RegExp(oldWord, "gi");
          if (regex.test(adaptedName) && !normalizeText(adaptedName).includes(normalizeText(newWord))) {
            adaptedName = adaptedName.replace(regex, newWord);
          }
          continue;
        }
      } else if (ing.role === "veg") {
        const replacement = FALLBACK_VEGS.find(
          (v) => !matchesDislike(v.name, dislikes) && !alreadyInRecipe(v.name)
        );
        if (replacement) {
          adaptedIngredients.push({ ...replacement });
          const oldWord = ing.name.split(" ")[0];
          const regex = new RegExp(oldWord, "gi");
          if (regex.test(adaptedName) && !normalizeText(adaptedName).includes("legumes")) {
            adaptedName = adaptedName.replace(regex, "legumes");
          }
          continue;
        }
      }

      return null;
    }

    if (doencas.includes("hipertensao") && !/DASH/i.test(adaptedNotes)) {
      adaptedNotes += " Diretriz Hipertensão (DASH): prepare com ervas naturais, alho e limão, reduzindo o sal de adição.";
    }

    return {
      ...recipe,
      name: adaptedName,
      notes: adaptedNotes,
      prepMinutes: prepMins,
      portableRoomTemp: ROOM_TEMP_PORTABLE_IDS.has(recipe.id),
      noReheatNeeded: NO_REHEAT_MAIN_IDS.has(recipe.id),
      badForWorkMarmita: tags.includes("peixe") || recipe.id === "alm-sopa-carne-batata",
      ingredients: adaptedIngredients
    };
  }

  function buildAppliedGuidelines(profile) {
    const list = [];
    const doencas = profile.doencas || [];

    if (profile.habilidade === "basica") {
      list.push(
        "Cozinha Básica: selecionamos apenas preparos rápidos (até 25 min), grelhados simples, airfryer, ovos, sanduíches e shakes, sem receitas complexas de pressão ou forno."
      );
    }

    if (profile.rotina_trabalho === "fora_dia_todo") {
      if (profile.armazenamento_trabalho === "mochila_sem_geladeira") {
        list.push(
          "Trabalho fora (Sem geladeira): de segunda a sexta, os lanches e opções priorizam alimentos que aguentam temperatura ambiente na mochila (frutas inteiras, castanhas, pasta de amendoim, aveia e Whey em pó para misturar com água na hora), evitando laticínios perecíveis."
        );
      } else if (profile.armazenamento_trabalho === "so_geladeira") {
        list.push(
          "Trabalho fora (Sem micro-ondas): de segunda a sexta, o almoço prioriza opções que podem ser consumidas frias ou sem aquecer (sanduíches proteicos, bowls frios e shakes completos), reservando pratos quentes para o jantar em casa."
        );
      } else {
        list.push(
          "Trabalho fora (Com geladeira e micro-ondas): de segunda a sexta, o almoço prioriza marmitas que aquecem bem sem deixar cheiro forte no ambiente (peixes e sopas líquidas ficam reservados para o jantar em casa ou fim de semana)."
        );
      }
    }

    if (doencas.includes("diabetes")) {
      list.push(
        "Diretriz Diabetes / Pré-diabetes (SBD): carboidratos refinados (pão francês e arroz branco) foram substituídos por versões integrais de baixo índice glicêmico e a meta de fibras foi elevada. Inicie o almoço e o jantar pela salada e proteína antes do carboidrato."
      );
    }
    if (doencas.includes("hipertensao")) {
      list.push(
        "Diretriz Hipertensão Arterial (Dieta DASH / SBC): queijos foram ajustados para versões sem sal, priorizando fontes naturais de potássio e magnésio. Evite temperos prontos/cubos e limite o sal adicionado a no máximo 5g por dia (1 colher de chá rasa somando todas as refeições)."
      );
    }
    if (doencas.includes("colesterol")) {
      list.push(
        "Diretriz Colesterol e Triglicérides (SBC): laticínios ajustados para versões desnatadas, com redução de gordura saturada e reforço de fibras solúveis (aveia, chia e leguminosas) e gorduras boas (azeite e castanhas)."
      );
    }
    if (doencas.includes("gastrite_refluxo")) {
      list.push(
        "Diretriz Gastrite e Refluxo: excluímos preparos com cacau/chocolate e ceias gordurosas. Evite beber líquidos volumosos junto às refeições principais e aguarde pelo menos 2 horas após o jantar/ceia antes de se deitar."
      );
    }
    if (doencas.includes("acido_urico")) {
      list.push(
        "Diretriz Ácido Úrico / Gota: carnes vermelhas ricas em purinas foram removidas do cardápio, priorizando ovos, laticínios magros, aves e proteínas vegetais. Mantenha hidratação acima de 2,5 litros de água por dia."
      );
    }
    if (doencas.includes("hipotireoidismo")) {
      list.push(
        "Diretriz Hipotireoidismo: bebidas à base de soja foram substituídas para não interferir na absorção da levotiroxina. Tome a medicação da tireoide em jejum com água e aguarde 30 a 40 minutos antes do café da manhã."
      );
    }
    if (doencas.includes("renal_alerta")) {
      list.push(
        "Alerta Doença Renal Crônica: a meta de proteína foi reduzida para um teto conservador (1,0 g/kg) e os suplementos de Whey Protein foram desativados para evitar sobrecarga renal. Valide as quantidades de potássio e fósforo presencialmente com seu nefrologista."
      );
    }

    return list;
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
    if (mealCount === 3) {
      return [
        { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.26, isOptional: false },
        { key: "almoco", label: "Almoço", category: "principal", share: 0.40, isOptional: false },
        { key: "jantar", label: "Jantar", category: "principal", share: 0.34, isOptional: false },
        { key: "ceia", label: "Ceia noturna (opcional: fome à noite ou madrugada)", category: "ceia", share: 0.12, isOptional: true }
      ];
    }
    if (mealCount === 5) {
      return [
        { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.20, isOptional: false },
        { key: "lanche1", label: "Lanche da manhã", category: "lanche", share: 0.10, isOptional: false },
        { key: "almoco", label: "Almoço", category: "principal", share: 0.32, isOptional: false },
        { key: "lanche2", label: "Café da tarde", category: "lanche", share: 0.12, isOptional: false },
        { key: "jantar", label: "Jantar", category: "principal", share: 0.26, isOptional: false },
        { key: "ceia", label: "Ceia noturna (opcional: fome à noite ou madrugada)", category: "ceia", share: 0.12, isOptional: true }
      ];
    }
    return [
      { key: "cafe", label: "Café da manhã", category: "cafe", share: 0.22, isOptional: false },
      { key: "almoco", label: "Almoço", category: "principal", share: 0.35, isOptional: false },
      { key: "lanche", label: "Café da tarde", category: "lanche", share: 0.15, isOptional: false },
      { key: "jantar", label: "Jantar", category: "principal", share: 0.28, isOptional: false },
      { key: "ceia", label: "Ceia noturna (opcional: fome à noite ou madrugada)", category: "ceia", share: 0.12, isOptional: true }
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
      const mainMeals = day.meals.filter((m) => !m.isOptional);
      const ceiaMeal = day.meals.find((m) => m.isOptional);

      day.totals = mainMeals.reduce(
        (acc, m) => ({
          kcal: acc.kcal + m.recipe.macros.kcal,
          protein: acc.protein + m.recipe.macros.protein,
          carbs: acc.carbs + m.recipe.macros.carbs,
          fat: acc.fat + m.recipe.macros.fat,
          fiber: acc.fiber + m.recipe.macros.fiber
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );
      day.optionalCeiaKcal = ceiaMeal ? ceiaMeal.recipe.macros.kcal : 0;
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
        if (meal.isOptional) return;
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
        "Suplementos",
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
    const doencas = profile.doencas || [];
    const habilidade = profile.habilidade || "intermediaria";
    const rotinaTrabalho = profile.rotina_trabalho || "casa";
    const armazenamentoTrabalho = profile.armazenamento_trabalho || "geladeira_micro";

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
        .map((r) => adaptAndFilterRecipe(r, restrictions, dislikes, doencas, habilidade))
        .filter(Boolean);

      if (adapted.length >= 2) return adapted;

      // Fallback preservando restrições clínicas e doenças
      const clinicalSafe = bank
        .filter((r) => r.category === cat)
        .map((r) => adaptAndFilterRecipe(r, restrictions, [], doencas, "avancada"))
        .filter(Boolean);

      return clinicalSafe.length > 0 ? clinicalSafe : bank.filter((r) => r.category === cat);
    };

    const isPratica = profile.variacao === "pratica";

    function capPool(list, maxSolid, maxWhey) {
      if (!isPratica) return list;
      const solids = list.filter((r) => !(r.tags || []).includes("whey")).slice(0, maxSolid);
      const wheys = list.filter((r) => (r.tags || []).includes("whey")).slice(0, maxWhey);
      return [...solids, ...wheys];
    }

    const poolCafe = capPool(filterByCat("cafe"), 2, 1);
    const poolPrincipal = capPool(filterByCat("principal"), 3, 1);
    const poolLanche = capPool(filterByCat("lanche"), 2, 1);
    const poolCeia = capPool(filterByCat("ceia"), 2, 1);

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

    function getWorkdayPoolForSlot(basePool, slotKey, isWorkday) {
      if (!isWorkday || rotinaTrabalho !== "fora_dia_todo") {
        return { pool: basePool, routineBadge: "" };
      }

      if (slotKey === "almoco") {
        if (armazenamentoTrabalho === "mochila_sem_geladeira") {
          const roomTemp = basePool.filter((r) => r.portableRoomTemp || !r.badForWorkMarmita);
          const sorted = [
            ...roomTemp.filter((r) => r.portableRoomTemp),
            ...roomTemp.filter((r) => !r.portableRoomTemp)
          ];
          return {
            pool: sorted.length > 0 ? sorted : basePool,
            routineBadge: "Prático para levar sem geladeira"
          };
        }
        if (armazenamentoTrabalho === "so_geladeira") {
          const noReheat = basePool.filter((r) => r.noReheatNeeded);
          const others = basePool.filter((r) => !r.noReheatNeeded && !r.badForWorkMarmita);
          const combined = [...noReheat, ...others];
          return {
            pool: combined.length > 0 ? combined : basePool,
            routineBadge: "Não precisa de micro-ondas"
          };
        }
        // Tem geladeira e micro-ondas: evita peixe e sopa líquida no escritório
        const marmitaGood = basePool.filter((r) => !r.badForWorkMarmita);
        return {
          pool: marmitaGood.length > 0 ? marmitaGood : basePool,
          routineBadge: "Ideal para marmita no trabalho"
        };
      }

      if (slotKey === "lanche" || slotKey === "lanche1" || slotKey === "lanche2") {
        if (armazenamentoTrabalho === "mochila_sem_geladeira") {
          const portable = basePool.filter((r) => r.portableRoomTemp);
          return {
            pool: portable.length > 0 ? portable : basePool,
            routineBadge: "Leva na mochila (sem geladeira)"
          };
        }
        return {
          pool: basePool,
          routineBadge: "Prático para levar ao trabalho"
        };
      }

      return { pool: basePool, routineBadge: "" };
    }

    function buildSlotOptions(pool, solidCursor, wheyCursor, targetSlotKcal, preferFirstFromPool) {
      const solidList = pool.filter((r) => !(r.tags || []).includes("whey"));
      const wheyList = pool.filter((r) => (r.tags || []).includes("whey"));
      const chosen = [];

      const addUnique = (candidate) => {
        if (candidate && !chosen.some((c) => c.id === candidate.id)) {
          chosen.push(scaleForTarget(candidate, targetSlotKcal));
        }
      };

      if (preferFirstFromPool) {
        for (let k = 0; k < pool.length && chosen.length < Math.min(3, pool.length); k++) {
          addUnique(pool[(solidCursor + k) % pool.length]);
        }
      } else {
        if (solidList.length > 0) addUnique(solidList[solidCursor % solidList.length]);
        if (solidList.length > 1) addUnique(solidList[(solidCursor + 1) % solidList.length]);
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
      const isWorkday = dayIndex < 5; // Segunda a Sexta
      const solidPrincipals = poolPrincipal.filter((r) => !(r.tags || []).includes("whey"));
      const mainCount = Math.max(1, solidPrincipals.length);
      const almocoIdx = (dayIndex * 2) % mainCount;
      let jantarIdx = (dayIndex * 2 + 1) % mainCount;
      if (jantarIdx === almocoIdx && mainCount > 1) {
        jantarIdx = (almocoIdx + 1) % mainCount;
      }

      const meals = slots.map((slot) => {
        const basePool = poolsByCategory[slot.category] || [];
        const { pool, routineBadge } = getWorkdayPoolForSlot(basePool, slot.key, isWorkday);

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

        const slotTargetKcal = slot.isOptional
          ? Math.min(230, Math.max(170, targets.kcal * slot.share))
          : targets.kcal * slot.share;

        const preferPoolOrder =
          (slot.category === "ceia" && dayIndex % 2 === 0) ||
          (isWorkday &&
            rotinaTrabalho === "fora_dia_todo" &&
            slot.key === "almoco" &&
            armazenamentoTrabalho !== "geladeira_micro");

        const options = buildSlotOptions(
          pool,
          pickIndex,
          wheyIdx,
          slotTargetKcal,
          preferPoolOrder
        );

        return {
          slotKey: slot.key,
          slotLabel: slot.label,
          category: slot.category,
          share: slot.share,
          isOptional: Boolean(slot.isOptional),
          routineBadge,
          poolIndex: pickIndex,
          activeOptionIndex: 0,
          options,
          recipe: options[0]
        };
      });

      return {
        dayName,
        meals,
        totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        optionalCeiaKcal: 0
      };
    });

    const plan = {
      profile: {
        ...profile,
        objetivoLabel: GOAL_LABELS[profile.objetivo] || profile.objetivo
      },
      targets,
      appliedGuidelines: buildAppliedGuidelines(profile),
      poolsByCategory,
      days
    };

    return recomputePlanAggregates(plan);
  }

  function selectMealOption(plan, dayIndex, mealIndex, optionIndex) {
    const day = plan.days[dayIndex];
    if (!day || !day.meals[mealIndex]) return plan;

    const meal = day.meals[mealIndex];
    if (!meal.options || !meal.options[optionIndex]) return plan;

    meal.activeOptionIndex = optionIndex;
    meal.recipe = meal.options[optionIndex];
    return recomputePlanAggregates(plan);
  }

  function swapMealInPlan(plan, dayIndex, mealIndex) {
    const day = plan.days[dayIndex];
    if (!day || !day.meals[mealIndex]) return plan;

    const meal = day.meals[mealIndex];
    const pool = plan.poolsByCategory[meal.category] || [];
    if (pool.length <= 1) return plan;

    const nextPoolIndex = (meal.poolIndex || 0) + 1;
    const slotTargetKcal = meal.isOptional
      ? Math.min(230, Math.max(170, plan.targets.kcal * (meal.share || 0.12)))
      : plan.targets.kcal * (meal.share || 0.20);
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
