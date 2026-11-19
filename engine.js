// Motor nutricional offline: cálculo de metas, escalonamento duplo (proteína + calorias), diretrizes clínicas oficiais e adaptação de horários
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
    { name: "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, role: "fruit" },
    { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" },
    { name: "Mamão formosa", sector: "Hortifrúti", grams: 140, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false, role: "fruit" },
    { name: "Morango fresco", sector: "Hortifrúti", grams: 120, kcal100: 30, p100: 0.9, c100: 6.8, g100: 0.3, fib100: 1.7, scalable: true, isBatch: false, role: "fruit" }
  ];

  const FALLBACK_FRUITS_LOW_K = [
    { name: "Maçã sem casca (baixo potássio)", sector: "Hortifrúti", grams: 130, kcal100: 52, p100: 0.3, c100: 14.0, g100: 0.2, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" },
    { name: "Pera williams (baixo potássio)", sector: "Hortifrúti", grams: 130, kcal100: 57, p100: 0.4, c100: 15.2, g100: 0.1, fib100: 2.4, scalable: true, isBatch: false, role: "fruit" },
    { name: "Abacaxi pérola picado (baixo potássio)", sector: "Hortifrúti", grams: 130, kcal100: 50, p100: 0.5, c100: 13.1, g100: 0.1, fib100: 1.4, scalable: true, isBatch: false, role: "fruit" },
    { name: "Morango fresco (baixo potássio)", sector: "Hortifrúti", grams: 120, kcal100: 30, p100: 0.9, c100: 6.8, g100: 0.3, fib100: 1.7, scalable: true, isBatch: false, role: "fruit" }
  ];

  const FALLBACK_VEGS = [
    { name: "Cenoura e vagem refogadas", sector: "Hortifrúti", grams: 100, kcal100: 38, p100: 1.4, c100: 8.2, g100: 0.2, fib100: 2.8, scalable: false, isBatch: false, role: "veg" },
    { name: "Abobrinha grelhada", sector: "Hortifrúti", grams: 100, kcal100: 19, p100: 1.1, c100: 3.5, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
    { name: "Brócolis cozido", sector: "Hortifrúti", grams: 100, kcal100: 25, p100: 2.1, c100: 4.4, g100: 0.5, fib100: 3.4, scalable: false, isBatch: false, role: "veg" },
    { name: "Abóbora cabotiá cozida", sector: "Hortifrúti", grams: 110, kcal100: 48, p100: 1.4, c100: 10.8, g100: 0.7, fib100: 2.5, scalable: false, isBatch: false, role: "veg" },
    { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 110, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
  ];

  const ROOM_TEMP_PORTABLE_IDS = new Set([
    "lan-fruta-castanha",
    "lan-banana-aveia",
    "lan-fruta-pasta-amendoim",
    "lan-whey-fruta-castanha",
    "lan-shake-whey-banana",
    "alm-shake-substituto-whey",
    "alm-sanduiche-prato-frango",
    "pre-banana-aveia-canela",
    "pre-shake-whey-banana",
    "pre-tapioca-geleia-fruta"
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

  function roundQuarter(h) {
    return Math.round(h * 4) / 4;
  }

  function formatHour(h) {
    const norm = ((Number(h) % 24) + 24) % 24;
    const totalMinutes = Math.round(norm * 60) % 1440;
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const mm = String(totalMinutes % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function parseTimeStr(str) {
    if (!str || typeof str !== "string" || !str.includes(":")) return null;
    const parts = str.split(":");
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh + mm / 60;
  }

  function getRenalStage(profile) {
    if (!profile) return "nenhuma";
    const explicit = profile.nivel_renal;
    if (
      explicit === "drc_leve" ||
      explicit === "drc_conservador" ||
      explicit === "drc_avancada" ||
      explicit === "drc_dialise"
    ) {
      return explicit;
    }
    if ((profile.doencas || []).includes("renal_alerta")) {
      return "drc_conservador";
    }
    return "nenhuma";
  }

  // Distribui os horários sem permitir sobreposição entre refeições, em qualquer turno (diurno ou noturno)
  function computeDailySchedule(profile, isWorkday) {
    const wake = Number(profile.hora_acorda ?? 6);
    const rawSleep = Number(profile.hora_dorme ?? 22.5);
    let sleep = rawSleep <= wake + 4 ? rawSleep + 24 : rawSleep;
    if (sleep - wake > 20) sleep = wake + 16.5;

    const awakeSpan = Math.max(10, sleep - wake);
    const wStart = Number(profile.trabalho_inicio ?? 7);
    const wEnd = Number(profile.trabalho_fim ?? 17);
    const worksOutside = Boolean(
      isWorkday &&
        (profile.rotina_trabalho === "fora_dia_todo" ||
          profile.rotina_trabalho === "fora_meio_periodo")
    );

    const rushedMorning = worksOutside && wStart >= wake && wStart <= wake + 1.0;
    const cafeHour = rushedMorning
      ? roundQuarter(Math.min(wake + 0.25, Math.max(wake, wStart - 0.5)))
      : roundQuarter(wake + 0.5);

    // Garante que o almoço fique pelo menos 3h30 após o café da manhã
    let almocoHour;
    if (worksOutside && wake <= 9 && wStart <= 11) {
      const targetLunch = 11.5 + (wStart - 6) * 0.5;
      almocoHour = roundQuarter(Math.max(cafeHour + 3.5, Math.min(14.5, Math.max(11.0, targetLunch))));
    } else {
      almocoHour = roundQuarter(cafeHour + Math.min(5.25, awakeSpan * 0.34));
    }

    let jantarHour = roundQuarter(Math.max(almocoHour + 5.5, sleep - 2.25));
    if (jantarHour <= almocoHour + 3.0) {
      jantarHour = roundQuarter(almocoHour + 4.5);
    }

    if (worksOutside && wStart < wEnd && wEnd >= jantarHour - 0.5 && wEnd <= sleep - 1.5) {
      jantarHour = roundQuarter(Math.max(almocoHour + 4.0, Math.min(sleep - 1.25, wEnd + 0.5)));
    }

    const lanche1Hour = roundQuarter((cafeHour + almocoHour) / 2);
    const lancheTardeHour = roundQuarter((almocoHour + jantarHour) / 2);
    const ceiaHour = roundQuarter(Math.max(jantarHour + 1.5, sleep - 0.75));

    const isAtWork = (hour) => {
      if (!worksOutside) return false;
      const normH = ((hour % 24) + 24) % 24;
      if (wStart <= wEnd) {
        return normH >= wStart && normH <= wEnd - 0.15;
      }
      return normH >= wStart || normH <= wEnd - 0.15;
    };

    const hoursByKey = {
      cafe: cafeHour,
      lanche1: lanche1Hour,
      almoco: almocoHour,
      lanche: lancheTardeHour,
      lanche2: lancheTardeHour,
      jantar: jantarHour,
      ceia: ceiaHour
    };

    const customHours = profile.customMealHours || {};
    const mealCount = Number(profile.refeicoes) || 4;
    const hasWorkout = Boolean(profile.atividade && profile.atividade !== "sedentario");
    const rawTrainHour = Number(profile.hora_treino ?? 18);

    const toRel = (h) => {
      const norm = ((Number(h) % 24) + 24) % 24;
      return norm < wake - 1.5 ? norm + 24 : norm;
    };

    const baseSlots = getSlotTemplate(mealCount).map((s) => ({ ...s }));

    if (hasWorkout) {
      const trainRel = toRel(rawTrainHour);
      const preTrainRel =
        trainRel <= wake + 1.0
          ? roundQuarter(Math.max(wake, trainRel - 0.5))
          : roundQuarter(Math.max(wake + 0.25, trainRel - 0.75));
      const preTrainHour = ((preTrainRel % 24) + 24) % 24;
      const trainTimeStr = formatHour(rawTrainHour);

      // Evita que café, almoço, jantar ou ceia colidam com o horário do treino ou fiquem colados ao pré-treino
      if (Math.abs(toRel(hoursByKey.cafe) - trainRel) < 0.75 || (preTrainRel <= toRel(hoursByKey.cafe) + 0.25 && trainRel <= toRel(hoursByKey.cafe) + 1.25)) {
        hoursByKey.cafe = ((roundQuarter(trainRel + 1.0) % 24) + 24) % 24;
      }
      if (Math.abs(toRel(hoursByKey.almoco) - trainRel) < 0.85) {
        hoursByKey.almoco = ((roundQuarter(trainRel + 1.0) % 24) + 24) % 24;
      }
      if (Math.abs(toRel(hoursByKey.jantar) - trainRel) < 0.85 || Math.abs(toRel(hoursByKey.jantar) - preTrainRel) < 1.0) {
        hoursByKey.jantar = ((roundQuarter(trainRel + 1.0) % 24) + 24) % 24;
      }
      if (toRel(hoursByKey.ceia) <= Math.max(toRel(hoursByKey.jantar) + 0.75, trainRel + 1.0)) {
        hoursByKey.ceia = ((roundQuarter(Math.max(toRel(hoursByKey.jantar) + 1.25, trainRel + 1.25)) % 24) + 24) % 24;
      }

      hoursByKey.pre_treino = preTrainHour;

      const snackIndices = baseSlots
        .map((s, idx) => (s.category === "lanche" ? idx : -1))
        .filter((idx) => idx >= 0);

      let convertedSnack = false;
      if (snackIndices.length > 0) {
        let bestIdx = snackIndices[0];
        let bestDiff = Math.abs(toRel(hoursByKey[baseSlots[bestIdx].key]) - preTrainRel);
        for (const sIdx of snackIndices) {
          const diff = Math.abs(toRel(hoursByKey[baseSlots[sIdx].key]) - preTrainRel);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = sIdx;
          }
        }
        if (bestDiff <= 3.25) {
          baseSlots[bestIdx] = {
            key: "pre_treino",
            label: `Lanche Pré-Treino (Treino às ${trainTimeStr})`,
            category: "pre_treino",
            share: Math.max(0.12, baseSlots[bestIdx].share),
            isOptional: false
          };
          convertedSnack = true;
        }
      }

      if (!convertedSnack) {
        const preShare = 0.12;
        baseSlots.forEach((s) => {
          if (!s.isOptional) {
            s.share = Number((s.share * (1 - preShare)).toFixed(4));
          }
        });
        baseSlots.push({
          key: "pre_treino",
          label: `Lanche Pré-Treino (Treino às ${trainTimeStr})`,
          category: "pre_treino",
          share: preShare,
          isOptional: false
        });
      }

      // Garante que a soma das frações das refeições principais seja exatamente 1.0000
      const mainSum = baseSlots.filter((s) => !s.isOptional).reduce((acc, s) => acc + s.share, 0);
      if (mainSum > 0 && Math.abs(mainSum - 1) > 0.001) {
        baseSlots.forEach((s) => {
          if (!s.isOptional) {
            s.share = Number((s.share / mainSum).toFixed(4));
          }
        });
      }
    }

    const mapped = baseSlots.map((slot) => {
      const customVal = customHours[slot.key];
      const hour = typeof customVal === "number" && !Number.isNaN(customVal)
        ? customVal
        : (hoursByKey[slot.key] ?? 12);
      const atWork = isAtWork(hour);
      const isRushed = slot.key === "cafe" && rushedMorning && typeof customVal !== "number";
      const locationLabel = atWork ? "No trabalho" : "Em casa";
      return {
        ...slot,
        hour,
        relHour: toRel(hour),
        timeStr: formatHour(hour),
        atWork,
        rushedMorning: isRushed,
        locationLabel
      };
    });

    const mainSlots = mapped.filter((s) => !s.isOptional).sort((a, b) => a.relHour - b.relHour);
    const optionalSlots = mapped.filter((s) => s.isOptional);
    return [...mainSlots, ...optionalSlots];
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

    const heightM = altura / 100;
    const bmi = heightM > 0 ? peso / (heightM * heightM) : 22;
    const renalStage = getRenalStage(profile);
    const hasRenal = renalStage !== "nenhuma";

    let pesoRef = peso;
    if (bmi >= 30) {
      const idealWeight = 25 * (heightM * heightM);
      pesoRef = idealWeight + 0.25 * (peso - idealWeight);
    } else if (bmi >= 25 && hasRenal) {
      const idealWeight = 23 * (heightM * heightM);
      pesoRef = idealWeight + 0.25 * (peso - idealWeight);
    }

    const minSafeKcal = isMale ? 1400 : 1200;
    kcalTarget = Math.round(Math.max(minSafeKcal, kcalTarget) / 10) * 10;

    let proteinPerKg =
      profile.objetivo === "hipertrofia" || profile.objetivo === "recomposicao"
        ? 1.9
        : profile.objetivo === "emagrecimento"
        ? 1.8
        : 1.5;

    // Diretrizes Oficiais Doença Renal Crônica por estágio (KDOQI 2020 / KDIGO 2024 / SBN / BRASPEN):
    // - Estágios 1 e 2 (drc_leve): 0,8 a 1,0 g/kg/dia (evita hiperfiltração sem restrição severa)
    // - Estágios 3a e 3b Conservador (drc_conservador): 0,6 a 0,8 g/kg/dia (0,72 g/kg; 0,8 g/kg se diabetes)
    // - Estágios 4 e 5 Pré-Diálise (drc_avancada): 0,55 a 0,65 g/kg/dia (0,60 g/kg; 0,65 g/kg se diabetes)
    // - Estágio 5 em Diálise / Hemodiálise (drc_dialise): 1,0 a 1,2 g/kg/dia (1,20 g/kg para repor perdas no dialisato)
    if (renalStage === "drc_leve") {
      proteinPerKg = 0.90;
    } else if (renalStage === "drc_conservador") {
      proteinPerKg = doencas.includes("diabetes") ? 0.80 : 0.72;
    } else if (renalStage === "drc_avancada") {
      proteinPerKg = doencas.includes("diabetes") ? 0.65 : 0.60;
    } else if (renalStage === "drc_dialise") {
      proteinPerKg = 1.20;
    }

    const proteinG = Math.round(pesoRef * proteinPerKg);
    const isLowProtRenal = renalStage === "drc_conservador" || renalStage === "drc_avancada";
    const fatShare = doencas.includes("colesterol") ? 0.22 : isLowProtRenal ? 0.30 : 0.25;
    const fatG = Math.round(Math.max(pesoRef * 0.70, (kcalTarget * fatShare) / 9));
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
      fiber: fiberG,
      pesoRef: Math.round(pesoRef * 10) / 10,
      renalStage
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

  function adaptAndFilterRecipe(recipe, restrictions, dislikes, doencas, habilidade, renalStage = "nenhuma", maxBasicMins = 15) {
    const tags = recipe.tags || [];
    const prepMins = parsePrepMinutes(recipe.prepTime);
    const hasRenal = renalStage !== "nenhuma" || doencas.includes("renal_alerta");
    const effectiveRenal = renalStage !== "nenhuma" ? renalStage : (hasRenal ? "drc_conservador" : "nenhuma");
    const restrictPhosphorus =
      effectiveRenal === "drc_conservador" ||
      effectiveRenal === "drc_avancada" ||
      effectiveRenal === "drc_dialise";
    const restrictPotassium =
      effectiveRenal === "drc_avancada" ||
      effectiveRenal === "drc_dialise";

    if (habilidade === "basica" && prepMins > maxBasicMins) {
      return null;
    }

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

    // Diretriz SBR Gota / Ácido Úrico Alto: restringe carnes vermelhas e peixes ricos em purinas
    if (doencas.includes("acido_urico") && (tags.includes("carne_vermelha") || tags.includes("peixe"))) {
      return null;
    }

    // Diretriz SBN / KDOQI Doença Renal Crônica por estágio:
    if (effectiveRenal !== "nenhuma") {
      // Nos estágios pré-diálise (1 a 5 conservador), exclui suplementos de Whey Protein
      if (effectiveRenal !== "drc_dialise" && tags.includes("whey")) {
        return null;
      }
      // A partir do estágio 3 (fósforo/potássio controlados), exclui pratos baseados em leguminosas puras, chia ou abacate com cacau
      if (
        restrictPhosphorus &&
        (recipe.id === "alm-grao-bico-arroz" ||
          recipe.id === "ceia-abacate-cacau" ||
          recipe.id === "ceia-pudim-chia-whey")
      ) {
        return null;
      }
    }

    // Diretriz FBG Gastrite / DRGE (Refluxo):
    // Exclui cacau/chocolate e ceia gordurosa de abacate
    if (doencas.includes("gastrite_refluxo")) {
      const hasCocoa = recipe.ingredients.some((i) => /cacau/i.test(i.name));
      if (hasCocoa || recipe.id === "ceia-abacate-cacau") {
        return null;
      }
    }

    const adaptedIngredients = [];
    let adaptedName = recipe.name;
    let adaptedNotes = recipe.notes;

    for (const rawIng of recipe.ingredients) {
      let ing = { ...rawIng };

      // 1. Diretriz SBD Diabetes / Pré-diabetes, SBC Dislipidemia e SBN Doença Renal (pão sem sal oculto)
      if (
        doencas.includes("diabetes") ||
        doencas.includes("colesterol") ||
        doencas.includes("hipertensao") ||
        effectiveRenal !== "nenhuma"
      ) {
        if (ing.name === "Pão francês") {
          const isLowSodium = doencas.includes("hipertensao") || effectiveRenal !== "nenhuma";
          ing = {
            ...ing,
            name: isLowSodium
              ? "Pão de forma com baixo teor de sódio"
              : "Pão de forma integral (baixo IG)",
            kcal100: 253,
            p100: 9.4,
            c100: 49.9,
            g100: 3.7,
            fib100: 6.9
          };
          adaptedName = adaptedName.replace(
            /Pão francês/gi,
            isLowSodium ? "Pão baixo sódio" : "Pão integral"
          );
        }
      }

      // Celíacos / Sem glúten: especifica aveia certificada sem glúten (evita contaminação cruzada)
      if (restrictions.includes("sem_gluten") && /^Aveia em flocos/i.test(ing.name)) {
        ing = {
          ...ing,
          name: "Aveia certificada sem glúten"
        };
      }

      // Na DRC avançada ou diálise (restrição de fósforo/potássio), mantém arroz branco para evitar excesso de fósforo do arroz integral
      if ((doencas.includes("diabetes") || doencas.includes("colesterol")) && !restrictPotassium) {
        if (ing.name === "Arroz branco cozido") {
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

      if (doencas.includes("diabetes")) {
        if (ing.name === "Batata inglesa cozida (para purê)") {
          ing = {
            ...ing,
            name: "Batata-doce ou abóbora cabotiá cozida (baixo IG)",
            kcal100: 68,
            p100: 1.0,
            c100: 15.0,
            g100: 0.3,
            fib100: 2.3
          };
          adaptedName = adaptedName.replace(/purê de batata/gi, "purê de cabotiá/batata-doce");
        }
      }

      // 2. Diretriz SBC Hipertensão (DASH) e SBN Doença Renal em todos os estágios (controle estrito de sódio < 2000 mg/dia)
      if (doencas.includes("hipertensao") || effectiveRenal !== "nenhuma") {
        if (ing.name === "Queijo minas frescal") {
          ing = {
            ...ing,
            name: "Ricota fresca sem sal (ou queijo minas sem sal)",
            kcal100: 140,
            p100: 12.6,
            c100: 3.8,
            g100: 8.1
          };
        } else if (ing.name === "Requeijão cremoso light") {
          ing = {
            ...ing,
            name: "Ricota cremosa caseira sem sal",
            kcal100: 140,
            p100: 11.5,
            c100: 4.0,
            g100: 9.0
          };
        }
      }

      // 3. Diretriz SBC Dislipidemia (Colesterol LDL < 7% gordura saturada) e SBR Gota (efeito uricosúrico de laticínios desnatados)
      if (doencas.includes("colesterol") || doencas.includes("acido_urico") || doencas.includes("hipertensao")) {
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

      if (doencas.includes("colesterol")) {
        if (ing.name === "Queijo minas frescal") {
          ing = {
            ...ing,
            name: "Ricota fresca magra (baixa gordura saturada)",
            kcal100: 140,
            p100: 12.6,
            c100: 3.8,
            g100: 8.1
          };
        } else if (ing.name === "Ovo de galinha inteiro" && ing.grams >= 100) {
          // Reduz gordura saturada e colesterol dietético mantendo 1 ovo inteiro + claras
          ing = {
            ...ing,
            name: "1 ovo inteiro + claras de ovo (baixa gordura saturada)",
            kcal100: 78,
            p100: 11.5,
            c100: 1.0,
            g100: 3.0,
            unitHint: "1 inteiro + 2 claras"
          };
        }
      }

      // 4. Diretriz FBG Gastrite e Refluxo (DRGE): evita molho de tomate ácido e tomate cru ácido à noite
      if (doencas.includes("gastrite_refluxo")) {
        adaptedName = adaptedName
          .replace(/ao molho caseiro|ao molho de tomate/gi, "com ervas suaves")
          .replace(/Strogonoff leve de frango/gi, "Frango em cubos cremoso com ervas suaves");
        if (ing.name === "Tomate e alface (salada)") {
          ing = {
            ...ing,
            name: "Alface, cenoura ralada e chuchu cozido (sem tomate ácido)",
            kcal100: 22,
            p100: 1.0,
            c100: 4.5,
            g100: 0.2,
            fib100: 1.8
          };
        }
      }

      // 5. Diretriz SBN / KDOQI Doença Renal Crônica por estágio:
      // 5a. Estágios 3a/3b, 4/5 Pré-Diálise e Diálise: controle de Fósforo (retira sementes, amendoim e castanhas ricos em fósforo)
      if (restrictPhosphorus) {
        if (/Pasta de amendoim|Amendoim torrado|Semente de chia|castanha-do-pará/i.test(ing.name)) {
          const alreadyHasJam = adaptedIngredients.some((a) => /Geleia de fruta/i.test(a.name));
          if (effectiveRenal === "drc_dialise") {
            ing = {
              ...ing,
              name: alreadyHasJam
                ? "Maçã ou pera picada com canela (baixo fósforo e potássio)"
                : "Clara de ovo cozida ou ricota sem sal (alta proteína e mínimo fósforo)",
              grams: alreadyHasJam ? 90 : 60,
              kcal100: 52,
              p100: alreadyHasJam ? 0.3 : 11.0,
              c100: alreadyHasJam ? 14.0 : 0.7,
              g100: 0.2,
              fib100: alreadyHasJam ? 2.0 : 0,
              scalable: true
            };
          } else if (alreadyHasJam) {
            ing = {
              ...ing,
              name: "Maçã ou pera picada com canela (baixo fósforo e baixo potássio)",
              grams: 100,
              kcal100: 52,
              p100: 0.3,
              c100: 14.0,
              g100: 0.2,
              fib100: 2.0,
              scalable: true
            };
          } else {
            ing = {
              ...ing,
              name: "Geleia de fruta sem açúcar ou mel (baixo fósforo/potássio e zero proteína)",
              grams: 20,
              kcal100: 280,
              p100: 0.2,
              c100: 70.0,
              g100: 0,
              fib100: 0.5,
              scalable: true
            };
          }
          adaptedName = adaptedName
            .replace(/com chia e castanhas/gi, "com fruta e geleia sem açúcar (baixo fósforo)")
            .replace(/com pasta de amendoim/gi, "com geleia sem açúcar")
            .replace(/com mix de castanha-do-pará e amendoim/gi, "com acompanhamento leve (baixo fósforo)");
        } else if (/Feijão|Lentilha/i.test(ing.name)) {
          ing = {
            ...ing,
            name:
              ing.name +
              (restrictPotassium
                ? " (demolhado 12h e cozido em 2 águas descartando o caldo para retirar potássio e fósforo)"
                : " (apenas grãos cozidos em 2 águas para reduzir potássio e fósforo)"),
            grams: restrictPotassium ? 35 : 45,
            scalable: false
          };
        } else if (/Azeite de oliva/i.test(ing.name) && effectiveRenal !== "drc_dialise") {
          ing = {
            ...ing,
            grams: 10,
            scalable: true
          };
        }
      }

      // 5b. Estágios 4/5 Pré-Diálise e Estágio 5 em Diálise: restrição rigorosa de Potássio (K+)
      // Substitui frutas de alto potássio (banana, mamão, abacate) por frutas de baixo potássio (maçã, pera, abacaxi)
      // e aplica técnica de cozimento em água abundante com descarte da água (lixiviação) em tubérculos e legumes
      if (restrictPotassium) {
        if (/Banana/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Maçã sem casca ou pera (fruta de baixo potássio)",
            grams: Math.round(ing.grams * 1.4),
            kcal100: 52,
            p100: 0.3,
            c100: 14.0,
            g100: 0.2,
            fib100: 2.0,
            unitHint: "1 unidade grande"
          };
          adaptedName = adaptedName.replace(/banana/gi, "maçã/pera (baixo potássio)");
        } else if (/Mamão/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Abacaxi ou maçã picada (fruta de baixo potássio)",
            kcal100: 50,
            p100: 0.4,
            c100: 13.0,
            g100: 0.1,
            fib100: 1.4,
            unitHint: "1 fatia média / 1 unidade"
          };
          adaptedName = adaptedName.replace(/mamão/gi, "abacaxi/maçã");
        } else if (/Abacate/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Pera ou maçã cozida com canela (fruta de baixo potássio)",
            kcal100: 54,
            p100: 0.4,
            c100: 14.5,
            g100: 0.1,
            fib100: 2.2
          };
          adaptedName = adaptedName.replace(/abacate/gi, "pera/maçã");
        } else if (/Batata|Abóbora|Mandioca/i.test(ing.name)) {
          ing = {
            ...ing,
            name: ing.name + " (descascada, picada e cozida em água abundante descartando a água para reduzir 50% do potássio)"
          };
        } else if (/Tomate e alface/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Alface, pepino e cenoura ralada (salada de baixo potássio, sem tomate)",
            kcal100: 20,
            p100: 0.9,
            c100: 4.0,
            g100: 0.2,
            fib100: 1.6
          };
        } else if (/Brócolis|Abobrinha/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Chuchu, abobrinha e cenoura cozidos em água abundante (descartando a água para reduzir potássio)"
          };
        }
      }

      // 6. Diretriz SBEM Hipotireoidismo: evita soja próxima ao horário da levotiroxina (intervalo mínimo 4h)
      if (doencas.includes("hipotireoidismo")) {
        if (/Bebida de soja/i.test(ing.name)) {
          ing = {
            ...ing,
            name: "Leite desnatado ou bebida vegetal de amêndoas/aveia (sem soja)"
          };
        } else if (/Tofu/i.test(ing.name)) {
          ing = {
            ...ing,
            name: ing.name + " (consumir com pelo menos 4h de intervalo da levotiroxina)"
          };
        }
      }

      if (!matchesDislike(ing.name, dislikes)) {
        adaptedIngredients.push(ing);
        continue;
      }

      const alreadyInRecipe = (candidateName) =>
        recipe.ingredients.some((i) => i.name === candidateName) ||
        adaptedIngredients.some((i) => i.name === candidateName);

      if (ing.role === "fruit") {
        const fruitPool = restrictPotassium ? FALLBACK_FRUITS_LOW_K : FALLBACK_FRUITS;
        const replacement = fruitPool.find(
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
    if (effectiveRenal !== "nenhuma" && !/SBN/i.test(adaptedNotes)) {
      if (effectiveRenal === "drc_dialise") {
        adaptedNotes += " Diretriz Renal em Diálise (SBN/KDOQI): aporte proteico de alto valor biológico com restrição de potássio, fósforo e sódio.";
      } else if (effectiveRenal === "drc_avancada") {
        adaptedNotes += " Diretriz Renal Estágio 4/5 Pré-Diálise (SBN/KDOQI): porção proteica estritamente reduzida (0,6 g/kg) e controle rigoroso de potássio, fósforo e sódio.";
      } else if (effectiveRenal === "drc_leve") {
        adaptedNotes += " Diretriz Renal Estágios 1–2 (SBN/KDOQI): proteína controlada sem excessos (0,8–1,0 g/kg) e baixo sódio.";
      } else {
        adaptedNotes += " Diretriz Renal Conservadora Estágios 3a/3b (SBN/KDOQI): porção proteica reduzida (0,6–0,8 g/kg) para proteger a filtração glomerular e baixo fósforo/sódio.";
      }
    }

    if (adaptedName.length > 0) {
      adaptedName = adaptedName.charAt(0).toUpperCase() + adaptedName.slice(1);
    }

    let adaptedSteps = recipe.steps || [];
    if (restrictPotassium) {
      const replaceLowKText = (txt) =>
        String(txt)
          .replace(/banana/gi, "maçã ou pera (baixo potássio)")
          .replace(/mamão/gi, "abacaxi ou maçã")
          .replace(/abacate/gi, "pera ou maçã");
      adaptedSteps = adaptedSteps.map(replaceLowKText);
      adaptedNotes = replaceLowKText(adaptedNotes);
    }

    return {
      ...recipe,
      name: adaptedName,
      steps: adaptedSteps,
      notes: adaptedNotes,
      prepMinutes: prepMins,
      portableRoomTemp: ROOM_TEMP_PORTABLE_IDS.has(recipe.id),
      noReheatNeeded: NO_REHEAT_MAIN_IDS.has(recipe.id),
      badForWorkMarmita: tags.includes("peixe") || recipe.id === "alm-sopa-carne-batata",
      ingredients: adaptedIngredients
    };
  }

  function buildAppliedGuidelines(profile, targets, clinicalWarnings = []) {
    const list = [...clinicalWarnings];
    const doencas = profile.doencas || [];
    const restrictions = profile.restricoes || [];
    const renalStage = getRenalStage(profile);
    const wakeStr = formatHour(profile.hora_acorda ?? 6);
    const sleepStr = formatHour(profile.hora_dorme ?? 22.5);
    const wStartStr = formatHour(profile.trabalho_inicio ?? 7);
    const wEndStr = formatHour(profile.trabalho_fim ?? 17);

    if (profile.rotina_trabalho === "fora_dia_todo") {
      list.push(
        `Horários ajustados ao seu turno fora o dia todo (${wStartStr} às ${wEndStr}, acordando às ${wakeStr} e dormindo às ${sleepStr}): as refeições de segunda a sexta que caem dentro do expediente foram marcadas como "No trabalho" e adaptadas ao seu armazenamento.`
      );
    } else if (profile.rotina_trabalho === "fora_meio_periodo") {
      list.push(
        `Horários ajustados ao trabalho fora em meio período (${wStartStr} às ${wEndStr}, acordando às ${wakeStr} e dormindo às ${sleepStr}): apenas as refeições de segunda a sexta dentro desse turno foram marcadas como "No trabalho".`
      );
    } else if (profile.rotina_trabalho === "nao_trabalha") {
      list.push(
        `Rotina sem trabalho externo (acordando às ${wakeStr} e dormindo às ${sleepStr}): todas as refeições da semana foram planejadas como "Em casa", permitindo preparos frescos na hora sem necessidade de transporte em marmita.`
      );
    } else {
      list.push(
        `Rotina em casa / não trabalha fora (acordando às ${wakeStr} e dormindo às ${sleepStr}): todas as refeições são feitas "Em casa", com horários distribuídos ao longo do dia sem sobreposição.`
      );
    }

    if (profile.atividade && profile.atividade !== "sedentario") {
      const trainHour = Number(profile.hora_treino ?? 18);
      const trainStr = formatHour(trainHour);
      const workdaySlots = computeDailySchedule(profile, true);
      const preSlot = workdaySlots.find((s) => s.key === "pre_treino");
      const preStr = preSlot ? preSlot.timeStr : formatHour(((trainHour - 0.75) % 24 + 24) % 24);
      list.push(
        `Lanche Pré-Treino específico (${preStr} para treino às ${trainStr}): refeição programada 45 a 60 minutos antes do treino priorizando carboidratos de fácil digestão + proteína magra e baixo teor de gordura/fibras pesadas para fornecer energia sem desconforto gástrico.`
      );
    }

    if (profile.habilidade === "basica") {
      list.push(
        "Cozinha Básica: priorizamos preparos rápidos (até 15 min) com ovos, sanduíches, shakes, tapiocas e grelhados simples, sem receitas longas de pressão ou forno."
      );
    }

    if (restrictions.includes("sem_gluten")) {
      list.push(
        "Restrição Sem Glúten / Celíacos: receitas com trigo foram excluídas e qualquer receita com aveia exige obrigatoriamente Aveia Certificada Sem Glúten (para evitar contaminação cruzada)."
      );
    }

    if (
      profile.rotina_trabalho === "fora_dia_todo" ||
      profile.rotina_trabalho === "fora_meio_periodo"
    ) {
      if (profile.armazenamento_trabalho === "mochila_sem_geladeira") {
        list.push(
          "Trabalho fora (Sem geladeira): de segunda a sexta, os lanches priorizam alimentos estáveis em temperatura ambiente (frutas inteiras, castanhas, aveia e Whey em pó na coqueteleira para pôr água na hora), evitando laticínios perecíveis na mochila."
        );
      } else if (profile.armazenamento_trabalho === "so_geladeira") {
        list.push(
          "Trabalho fora (Sem micro-ondas): de segunda a sexta, o almoço prioriza opções que podem ser consumidas sem aquecer (sanduíches proteicos, bowls frios e shakes completos), reservando pratos quentes para o jantar em casa."
        );
      } else {
        list.push(
          "Trabalho fora (Com geladeira e micro-ondas): de segunda a sexta, o almoço prioriza marmitas práticas e evita peixe ou caldos líquidos no escritório."
        );
      }
    }

    if (doencas.includes("diabetes")) {
      list.push(
        "Diretriz Diabetes / Pré-diabetes (SBD): pão francês, arroz branco e batata inglesa foram trocados por versões integrais/baixo índice glicêmico e a meta de fibras foi elevada (mínimo 14g/1000 kcal). Inicie almoço e jantar pelas fibras/salada e proteína antes do carboidrato."
      );
    }
    if (doencas.includes("hipertensao")) {
      list.push(
        "Diretriz Hipertensão Arterial (Dieta DASH / SBC): pão francês (alto sódio oculto) e queijos salgados foram substituídos por versões integrais e ricota/queijo sem sal. Limite o sal de adição a no máximo 5g por dia (< 2.000 mg de sódio) e zero temperos em cubo."
      );
    }
    if (doencas.includes("colesterol")) {
      list.push(
        "Diretriz Dislipidemia / Colesterol e Triglicérides (SBC): laticínios ajustados para 0% gordura, ovos ajustados para 1 inteiro + claras (reduzindo gordura saturada < 7% kcal), carboidratos refinados trocados por integrais (controle de triglicérides) e estímulo a fibras solúveis (aveia e leguminosas)."
      );
    }
    if (doencas.includes("gastrite_refluxo")) {
      list.push(
        "Diretriz Gastrite e Refluxo (FBG): removidos cacau/chocolate, molhos de tomate ácidos, tomate cru e ceias gordurosas (que reduzem a pressão do esfíncter esofágico). Evite café em jejum, líquidos volumosos nas refeições e aguarde 2 a 3 horas após comer antes de se deitar."
      );
    }
    if (doencas.includes("acido_urico")) {
      list.push(
        "Diretriz Hiperuricemia / Gota (SBR): removidas carnes vermelhas e peixes ricos em purinas, priorizando laticínios desnatados (efeito uricosúrico comprovado), ovos e proteínas vegetais. Meta sérica de ácido úrico < 6,0 mg/dL; evite álcool/cerveja e bebidas com frutose e beba > 2,5 L de água/dia."
      );
    }
    if (doencas.includes("hipotireoidismo")) {
      list.push(
        "Diretriz Hipotireoidismo (SBEM): bebidas de soja matinais foram substituídas e derivados de soja (como tofu) exigem intervalo mínimo de 4 horas após a levotiroxina. Tome o hormônio da tireoide em jejum com água pura e aguarde 30 a 60 minutos antes do café da manhã (mantenha 4h de distância de suplementos de ferro ou cálcio)."
      );
    }
    if (renalStage === "drc_leve") {
      list.push(
        `Diretriz Doença Renal Crônica Estágios 1 e 2 — Leve (SBN / KDIGO 2024 / KDOQI): proteína controlada sem excessos em 0,8 a 1,0 g/kg/dia (meta de ${targets.protein} g/dia, sem suplementos de Whey Protein) para evitar hiperfiltração glomerular, associada à redução de sódio (< 2.000 mg/dia) e corte de ultraprocessados com aditivos de fósforo. Atenção: NUNCA consuma carambola (neurotóxica na DRC).`
      );
    } else if (renalStage === "drc_conservador") {
      list.push(
        `Diretriz Doença Renal Crônica Estágios 3a e 3b — Tratamento Conservador (SBN / KDIGO 2024 / KDOQI): ingestão proteica controlada em 0,6 a 0,8 g/kg/dia (meta de ${targets.protein} g/dia), mantendo o aporte calórico (25-35 kcal/kg) via carboidratos e azeite para evitar catabolismo. Retirados Whey, queijos salgados e aditivos/sementes ricas em fósforo; feijão cozido em 2 águas. Nota KDIGO 2024: idosos frágeis ou com sarcopenia não devem restringir proteína sem avaliação médica, e cortes de potássio/fósforo devem seguir seus exames de sangue. NUNCA consuma carambola.`
      );
    } else if (renalStage === "drc_avancada") {
      list.push(
        `Diretriz Doença Renal Crônica Estágios 4 e 5 Pré-Diálise — Avançada (SBN / KDIGO 2024 / KDOQI): dieta hipoproteica estrita de 0,6 g/kg/dia (meta de ${targets.protein} g/dia) com restrição rigorosa de Potássio, Fósforo e Sódio. Banana, mamão e abacate foram substituídos por frutas de baixo potássio (maçã, pera, abacaxi) e tubérculos/legumes orientados ao cozimento em água abundante com descarte da água (reduz ~50% do potássio). Nota KDIGO 2024: individualize potássio e fósforo pelos exames séricos, evite ultraprocessados com aditivos de fósforo (absorção ~100%) e não restrinja proteína em caso de fragilidade/sarcopenia. NUNCA consuma carambola.`
      );
    } else if (renalStage === "drc_dialise") {
      list.push(
        `Diretriz Doença Renal Crônica Estágio 5 em Diálise / Hemodiálise (SBN / KDIGO 2024 / KDOQI): dieta hiperproteica de reposição de 1,2 g/kg/dia (meta de ${targets.protein} g/dia, priorizando clara de ovo, frango e carnes magras para repor os aminoácidos perdidos na diálise), combinada com controle rigoroso de Potássio (maçã, pera e abacaxi no lugar de banana/mamão/abacate + cozimento de tubérculos com descarte da água), Fósforo (zero aditivos/ultraprocessados, sementes, amendoim ou queijos amarelos), Sódio e líquidos conforme sua diurese residual. NUNCA consuma carambola.`
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

  function computeDynamicUnitHint(ingName, newGrams, origGrams, origHint) {
    if (/^Ovo de galinha inteiro/i.test(ingName)) {
      const units = Math.max(1, Math.round(newGrams / 50));
      return units === 1 ? "1 unidade" : `aprox. ${units} unidades`;
    }
    if (/^Clara de ovo/i.test(ingName)) {
      const units = Math.max(1, Math.round(newGrams / 30));
      return units === 1 ? "1 clara" : `${units} claras`;
    }
    if (/^Pão de forma/i.test(ingName)) {
      const slices = Math.max(1, Math.round(newGrams / 25));
      return slices === 1 ? "1 fatia" : `${slices} fatias`;
    }
    if (/^Banana/i.test(ingName)) {
      const units = Math.max(1, Math.round(newGrams / 90));
      return units === 1 ? "1 unidade média" : `${units} unidades`;
    }
    if (/^Maçã|^Pera/i.test(ingName)) {
      const units = Math.max(1, Math.round(newGrams / 130));
      return units === 1 ? "1 unidade média" : `${units} unidades`;
    }
    if (/^Iogurte natural/i.test(ingName)) {
      if (Math.abs(newGrams - 170) <= 25) return "1 pote padrão";
      if (newGrams <= 95) return "aprox. 1/2 pote";
      if (newGrams <= 145) return "aprox. 3/4 de pote";
      return undefined;
    }
    if (!origHint) return undefined;
    if (origGrams > 0 && Math.abs(newGrams - origGrams) / origGrams > 0.25) {
      return undefined;
    }
    return origHint;
  }

  // Escalonamento em 2 eixos + fechamento calórico final (Proteína + Energia separadamente):
  // Garante que a proteína total da refeição bata a meta (crucial na DRC 0,6-0,8 g/kg/dia e Diálise 1,2 g/kg/dia),
  // enquanto carboidratos e gorduras saudáveis fecham a meta calórica (sem déficit involuntário na DRC ou Hipertrofia).
  function scaleRecipeForSlot(recipe, targetSlotKcal, targetSlotProtein, isRenal) {
    const isProteinDominant = (ing) =>
      (ing.p100 >= 11 && ing.p100 * 4 >= ing.c100 * 1.4) ||
      /Iogurte|Ricota|Queijo/i.test(ing.name);

    let baseProtFromProtIngs = 0;
    let baseKcalFromProtIngs = 0;
    let baseProtFromEnergyIngs = 0;
    let baseKcalFromEnergyIngs = 0;
    let baseProtFromFixed = 0;
    let baseKcalFromFixed = 0;

    recipe.ingredients.forEach((ing) => {
      const f = ing.grams / 100;
      if (isProteinDominant(ing)) {
        baseProtFromProtIngs += ing.p100 * f;
        baseKcalFromProtIngs += ing.kcal100 * f;
      } else if (ing.scalable) {
        baseProtFromEnergyIngs += ing.p100 * f;
        baseKcalFromEnergyIngs += ing.kcal100 * f;
      } else {
        baseProtFromFixed += ing.p100 * f;
        baseKcalFromFixed += ing.kcal100 * f;
      }
    });

    let protFactor = isRenal ? 0.45 : 1.0;
    let energyFactor = 1.0;

    // 3 iterações para convergir simultaneamente Proteína Total e Calorias Totais do prato
    for (let iter = 0; iter < 3; iter++) {
      const currentOtherProt = baseProtFromFixed + baseProtFromEnergyIngs * energyFactor;
      if (baseProtFromProtIngs > 0 && targetSlotProtein > 0) {
        const desiredFromProt = Math.max(
          isRenal ? 0.8 : 4,
          targetSlotProtein - currentOtherProt
        );
        const rawProt = desiredFromProt / baseProtFromProtIngs;
        protFactor = isRenal
          ? Math.min(0.90, Math.max(0.10, rawProt))
          : Math.min(1.85, Math.max(0.30, rawProt));
      }

      const currentProtAndFixedKcal = baseKcalFromFixed + baseKcalFromProtIngs * protFactor;
      if (baseKcalFromEnergyIngs > 0) {
        const neededEnergyKcal = Math.max(80, targetSlotKcal - currentProtAndFixedKcal);
        const rawEnergy = neededEnergyKcal / baseKcalFromEnergyIngs;
        energyFactor = Math.min(isRenal ? 3.5 : 2.8, Math.max(0.55, rawEnergy));
      }
    }

    const scaledIngredients = recipe.ingredients.map((rawIng) => {
      let ing = { ...rawIng };
      let newGrams = ing.grams;
      if (isProteinDominant(ing)) {
        newGrams = roundTo5(ing.grams * protFactor);
        // Evita frações impraticáveis de ovo inteiro (ex.: 20g = 0,4 ovo): usa clara de ovo (30g = 1 clara) ou 1 ovo inteiro (50g)
        if (/^Ovo de galinha inteiro$/i.test(ing.name) && newGrams < 45) {
          if (newGrams <= 35) {
            ing = {
              ...ing,
              name: "Clara de ovo cozida ou mexida",
              kcal100: 52,
              p100: 11.0,
              c100: 0.7,
              g100: 0.2,
              fib100: 0
            };
            newGrams = 30;
          } else {
            newGrams = 50;
          }
        }
      } else if (ing.scalable) {
        let effEnergyFactor = energyFactor;
        if (ing.g100 >= 80) {
          effEnergyFactor = Math.min(1.5, energyFactor);
        } else if (isRenal && ing.p100 >= 8.5) {
          effEnergyFactor = Math.min(1.35, energyFactor);
        }
        newGrams = roundTo5(ing.grams * effEnergyFactor);
      }

      const factor = newGrams / 100;
      return {
        ...ing,
        grams: newGrams,
        unitHint: computeDynamicUnitHint(ing.name, newGrams, rawIng.grams, rawIng.unitHint),
        kcal: Math.round(ing.kcal100 * factor),
        protein: Math.round(ing.p100 * factor),
        carbs: Math.round(ing.c100 * factor),
        fat: Math.round(ing.g100 * factor)
      };
    });

    // Passagem final de fechamento calórico (evita déficit involuntário na DRC ou na Hipertrofia)
    let macros = computeRecipeMacros(scaledIngredients);
    let kcalGap = targetSlotKcal - macros.kcal;

    if (kcalGap > 45) {
      // 1) Se houver azeite de oliva no prato, ajusta até 15g (1,5 colher de sopa) para ajudar energia e gorduras boas
      const oilIng = scaledIngredients.find((i) => /^Azeite de oliva/i.test(i.name));
      if (oilIng && oilIng.grams < 15) {
        const addOil = Math.min(15 - oilIng.grams, roundTo5(kcalGap / 8.84));
        if (addOil >= 5) {
          oilIng.grams += addOil;
          const f = oilIng.grams / 100;
          oilIng.kcal = Math.round(oilIng.kcal100 * f);
          oilIng.fat = Math.round(oilIng.g100 * f);
          macros = computeRecipeMacros(scaledIngredients);
          kcalGap = targetSlotKcal - macros.kcal;
        }
      }

      // 2) Se ainda faltar energia, completa com carboidrato limpo de baixíssima proteína presente no prato (arroz, tapioca, batata, cuscuz, fruta)
      if (kcalGap > 45) {
        const cleanCarbs = scaledIngredients.filter(
          (i) => i.scalable && !isProteinDominant(i) && i.p100 < 4.0 && i.g100 < 30 && i.kcal100 >= 45
        );
        if (cleanCarbs.length > 0) {
          const perCarbGap = kcalGap / cleanCarbs.length;
          cleanCarbs.forEach((cIng) => {
            const extraGrams = Math.min(140, Math.max(0, Math.round((perCarbGap / (cIng.kcal100 / 100)) / 5) * 5));
            if (extraGrams > 0) {
              cIng.grams += extraGrams;
              const f = cIng.grams / 100;
              cIng.kcal = Math.round(cIng.kcal100 * f);
              cIng.protein = Math.round(cIng.p100 * f);
              cIng.carbs = Math.round(cIng.c100 * f);
              cIng.fat = Math.round(cIng.g100 * f);
              cIng.unitHint = computeDynamicUnitHint(cIng.name, cIng.grams, cIng.grams, cIng.unitHint);
            }
          });
          macros = computeRecipeMacros(scaledIngredients);
        }
      }
    }

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

  function getShoppingName(rawName) {
    const clean = String(rawName || "").trim();
    if (/^Azeite de oliva/i.test(clean)) return "Azeite de oliva extravirgem";
    if (/^Aveia certificada sem glúten/i.test(clean)) return "Aveia certificada sem glúten";
    if (/^Aveia em flocos/i.test(clean)) return "Aveia em flocos";
    if (/Peito de frango|Frango desfiado/i.test(clean)) return "Peito de frango (para grelhar / desfiar)";
    if (/Patinho/i.test(clean)) return "Patinho bovino magro";
    if (/Filé de tilápia/i.test(clean)) return "Filé de tilápia";
    if (/Arroz branco/i.test(clean)) return "Arroz branco";
    if (/Arroz integral/i.test(clean)) return "Arroz integral";
    if (/Feijão carioca/i.test(clean)) return "Feijão carioca";
    if (/Feijão preto/i.test(clean)) return "Feijão preto";
    if (/Batata inglesa/i.test(clean)) return "Batata inglesa";
    if (/Batata-doce/i.test(clean)) return "Batata-doce";
    if (/Abóbora cabotiá/i.test(clean)) return "Abóbora cabotiá";
    if (/Iogurte natural/i.test(clean)) {
      return /desnatado|0%/i.test(clean) ? "Iogurte natural desnatado" : "Iogurte natural";
    }
    if (/Maçã/i.test(clean)) return "Maçã";
    if (/Banana/i.test(clean)) return "Banana prata";
    if (/Mamão/i.test(clean)) return "Mamão formosa";
    if (/Morango/i.test(clean)) return "Morango fresco";
    if (/Geleia de fruta/i.test(clean)) return "Geleia de fruta sem açúcar";
    if (/Ricota/i.test(clean)) return "Ricota fresca sem sal";
    if (/Cuscuz de milho/i.test(clean)) return "Flocão de milho (para cuscuz)";
    if (/Ovo de galinha|ovo inteiro \+ claras|Clara de ovo/i.test(clean)) return "Ovos de galinha";
    return clean.replace(/\s*\([^)]*\)/g, "").trim() || clean;
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
          uniqueRecipesMap.set(r.id, {
            recipe: r,
            count: 0,
            minKcal: r.macros.kcal,
            maxKcal: r.macros.kcal
          });
        }
        const entry = uniqueRecipesMap.get(r.id);
        entry.count += 1;
        if (r.macros.kcal < entry.minKcal) entry.minKcal = r.macros.kcal;
        if (r.macros.kcal > entry.maxKcal) entry.maxKcal = r.macros.kcal;

        r.ingredients.forEach((ing) => {
          const rawFactor = ing.rawFactor || 1;
          const purchaseGrams = ing.grams * rawFactor;
          const targetMap = ing.isBatch ? batchItemsMap : freshItemsMap;
          const shopName = getShoppingName(ing.name);
          const itemKey = `${ing.sector}::${normalizeText(shopName)}`;

          if (!targetMap.has(itemKey)) {
            targetMap.set(itemKey, {
              id: normalizeText(itemKey).replace(/[^a-z0-9]+/g, "-"),
              name: shopName,
              sector: ing.sector,
              totalGrams: 0,
              hasRawAdjustment: rawFactor !== 1
            });
          } else if (rawFactor !== 1) {
            targetMap.get(itemKey).hasRawAdjustment = true;
          }
          targetMap.get(itemKey).totalGrams += purchaseGrams;
        });
      });
    });

    // Unifica qualquer item que tenha aparecido tanto em Lote quanto em Frescos (zero duplicidade entre as 2 listas)
    for (const [key, freshItem] of freshItemsMap.entries()) {
      if (batchItemsMap.has(key)) {
        const batchItem = batchItemsMap.get(key);
        batchItem.totalGrams += freshItem.totalGrams;
        if (freshItem.hasRawAdjustment) batchItem.hasRawAdjustment = true;
        freshItemsMap.delete(key);
      }
    }

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
    const renalStage = getRenalStage(profile);
    const isLowProtRenal =
      renalStage === "drc_leve" ||
      renalStage === "drc_conservador" ||
      renalStage === "drc_avancada";
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
    const clinicalWarnings = [];
    const buildNeutralSafeFallback = (cat) => {
      const isLowK = renalStage === "drc_avancada" || renalStage === "drc_dialise";
      return {
        id: `safe-fallback-${cat}`,
        name: "Prato neutro seguro (arroz, legumes cozidos e fruta leve)",
        category: cat,
        tags: ["vegetariano"],
        freezable: false,
        prepTime: "15 min",
        prepMinutes: 15,
        portableRoomTemp: true,
        noReheatNeeded: true,
        badForWorkMarmita: false,
        thawNote: "Preparo simples na hora.",
        ingredients: [
          { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 140, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
          { name: isLowK ? "Maçã sem casca (baixo potássio)" : "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 52, p100: 0.3, c100: 14.0, g100: 0.2, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" },
          { name: "Azeite de oliva extravirgem", sector: "Temperos / Conferir em Casa", grams: 8, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: true, estimated: true, isBatch: false }
        ],
        steps: [
          "Sirva o arroz cozido temperado com ervas e azeite acompanhado da fruta higienizada."
        ],
        notes: "Opção neutra gerada automaticamente para nunca violar suas alergias ou restrições clínicas."
      };
    };

    const filterByCat = (cat) => {
      const adapted = bank
        .filter((r) => r.category === cat)
        .map((r) => adaptAndFilterRecipe(r, restrictions, dislikes, doencas, habilidade, renalStage, 15))
        .filter(Boolean);

      if (adapted.length >= 2) return adapted;

      // Se habilidade básica (15 min) restringiu demais, relaxa apenas o tempo de preparo para 25 min mantendo TODAS as restrições e aversões
      const relaxedTime = bank
        .filter((r) => r.category === cat)
        .map((r) => adaptAndFilterRecipe(r, restrictions, dislikes, doencas, habilidade, renalStage, 25))
        .filter(Boolean);

      if (relaxedTime.length >= 2) return relaxedTime;

      // Relaxa aversões/habilidade, mas NUNCA relaxa alergias, vegetarianismo ou doenças clínicas
      const clinicalSafe = bank
        .filter((r) => r.category === cat)
        .map((r) => adaptAndFilterRecipe(r, restrictions, [], doencas, "avancada", renalStage, 90))
        .filter(Boolean);

      if (clinicalSafe.length > 0) {
        if (adapted.length === 0 && dislikes.length > 0) {
          clinicalWarnings.push(
            `Aviso de combinação restrita (${cat}): mantivemos todas as suas restrições médicas e alergias 100% intactas, mas flexibilizamos algumas preferências/aversões para não faltar opção segura.`
          );
        }
        return clinicalSafe;
      }

      clinicalWarnings.push(
        `Aviso importante (${cat}): a combinação de múltiplas restrições simultâneas esgotou o banco padrão desta refeição. Inserimos uma base neutra segura sem violar suas alergias ou diretrizes clínicas — recomendamos acompanhamento individualizado com nutricionista.`
      );
      return [buildNeutralSafeFallback(cat)];
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
    const poolPreTreino = capPool(filterByCat("pre_treino"), 2, 1);
    const poolCeia = capPool(filterByCat("ceia"), 2, 1);

    const poolsByCategory = {
      cafe: poolCafe,
      principal: poolPrincipal,
      lanche: poolLanche,
      pre_treino: poolPreTreino.length > 0 ? poolPreTreino : poolLanche,
      ceia: poolCeia
    };

    function scaleForTarget(recipe, targetSlotKcal, targetSlotProtein) {
      return scaleRecipeForSlot(recipe, targetSlotKcal, targetSlotProtein, isLowProtRenal);
    }

    function getWorkdayPoolForSlot(basePool, scheduledSlot) {
      if (scheduledSlot.rushedMorning) {
        const fastBreakfast = basePool.filter((r) => r.prepMinutes <= 8);
        return {
          pool: fastBreakfast.length > 0 ? fastBreakfast : basePool,
          routineBadge: "Rápido antes do turno (até 8 min)"
        };
      }

      if (!scheduledSlot.atWork) {
        return {
          pool: basePool,
          routineBadge:
            scheduledSlot.category === "pre_treino"
              ? "Energia rápida (45–60 min antes do treino)"
              : ""
        };
      }

      if (scheduledSlot.category === "principal") {
        if (armazenamentoTrabalho === "mochila_sem_geladeira") {
          const roomTemp = basePool.filter((r) => r.portableRoomTemp || !r.badForWorkMarmita);
          const sorted = [
            ...roomTemp.filter((r) => r.portableRoomTemp),
            ...roomTemp.filter((r) => !r.portableRoomTemp)
          ];
          return {
            pool: sorted.length > 0 ? sorted : basePool,
            routineBadge: "No trabalho: sem geladeira"
          };
        }
        if (armazenamentoTrabalho === "so_geladeira") {
          const noReheat = basePool.filter((r) => r.noReheatNeeded);
          const others = basePool.filter((r) => !r.noReheatNeeded && !r.badForWorkMarmita);
          const combined = [...noReheat, ...others];
          return {
            pool: combined.length > 0 ? combined : basePool,
            routineBadge: "No trabalho: sem micro-ondas"
          };
        }
        const marmitaGood = basePool.filter((r) => !r.badForWorkMarmita);
        return {
          pool: marmitaGood.length > 0 ? marmitaGood : basePool,
          routineBadge: "No trabalho: marmita prática"
        };
      }

      if (
        scheduledSlot.category === "lanche" ||
        scheduledSlot.category === "cafe" ||
        scheduledSlot.category === "pre_treino"
      ) {
        if (armazenamentoTrabalho === "mochila_sem_geladeira") {
          const portable = basePool.filter((r) => r.portableRoomTemp);
          return {
            pool: portable.length > 0 ? portable : basePool,
            routineBadge:
              scheduledSlot.category === "pre_treino"
                ? "Pré-treino portátil (sem geladeira)"
                : "No trabalho: leva na mochila"
          };
        }
        return {
          pool: basePool,
          routineBadge:
            scheduledSlot.category === "pre_treino"
              ? "No trabalho: pré-treino prático"
              : "No trabalho: lanche prático"
        };
      }

      return { pool: basePool, routineBadge: "" };
    }

    function buildSlotOptions(pool, solidCursor, wheyCursor, targetSlotKcal, targetSlotProtein, preferFirstFromPool) {
      const solidList = pool.filter((r) => !(r.tags || []).includes("whey"));
      const wheyList = pool.filter((r) => (r.tags || []).includes("whey"));
      const chosen = [];

      const addUnique = (candidate) => {
        if (candidate && !chosen.some((c) => c.id === candidate.id)) {
          chosen.push(scaleForTarget(candidate, targetSlotKcal, targetSlotProtein));
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
    let preTreinoCursor = 0;
    let ceiaCursor = 0;

    const days = DAYS_OF_WEEK.map((dayName, dayIndex) => {
      const isWorkday = dayIndex < 5;
      const daySlots = computeDailySchedule(profile, isWorkday);
      const solidPrincipals = poolPrincipal.filter((r) => !(r.tags || []).includes("whey"));
      const mainCount = Math.max(1, solidPrincipals.length);
      const almocoIdx = (dayIndex * 2) % mainCount;
      let jantarIdx = (dayIndex * 2 + 1) % mainCount;
      if (jantarIdx === almocoIdx && mainCount > 1) {
        jantarIdx = (almocoIdx + 1) % mainCount;
      }

      const meals = daySlots.map((slot) => {
        const basePool = poolsByCategory[slot.category] || [];
        const { pool, routineBadge } = getWorkdayPoolForSlot(basePool, slot);

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
        } else if (slot.category === "pre_treino") {
          pickIndex = preTreinoCursor;
          wheyIdx = preTreinoCursor;
          preTreinoCursor += 1;
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
          ? Math.min(220, Math.max(160, targets.kcal * slot.share))
          : targets.kcal * slot.share;

        const slotTargetProtein = slot.isOptional
          ? Math.round(targets.protein * 0.12)
          : Math.round(targets.protein * slot.share);

        const preferPoolOrder =
          (slot.category === "ceia" && dayIndex % 2 === 0) ||
          slot.rushedMorning ||
          (slot.atWork &&
            slot.category === "principal" &&
            armazenamentoTrabalho !== "geladeira_micro");

        const options = buildSlotOptions(
          pool,
          pickIndex,
          wheyIdx,
          slotTargetKcal,
          slotTargetProtein,
          preferPoolOrder
        );

        return {
          slotKey: slot.key,
          slotLabel: `${slot.timeStr} | ${slot.label} (${slot.locationLabel})`,
          timeStr: slot.timeStr,
          locationLabel: slot.locationLabel,
          atWork: slot.atWork,
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
      appliedGuidelines: buildAppliedGuidelines(profile, targets, clinicalWarnings),
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
    const basePool = plan.poolsByCategory[meal.category] || [];
    if (basePool.length <= 1) return plan;

    const arm = (plan.profile && plan.profile.armazenamento_trabalho) || "geladeira_micro";
    let pool = basePool;
    if (meal.atWork) {
      if (meal.category === "principal") {
        if (arm === "mochila_sem_geladeira") {
          const filtered = basePool.filter((r) => r.portableRoomTemp || !r.badForWorkMarmita);
          if (filtered.length > 0) pool = filtered;
        } else if (arm === "so_geladeira") {
          const filtered = basePool.filter((r) => r.noReheatNeeded || !r.badForWorkMarmita);
          if (filtered.length > 0) pool = filtered;
        } else {
          const filtered = basePool.filter((r) => !r.badForWorkMarmita);
          if (filtered.length > 0) pool = filtered;
        }
      } else if (
        (meal.category === "lanche" || meal.category === "cafe" || meal.category === "pre_treino") &&
        arm === "mochila_sem_geladeira"
      ) {
        const portable = basePool.filter((r) => r.portableRoomTemp);
        if (portable.length > 0) pool = portable;
      }
    }
    if (pool.length <= 1) return plan;

    const renalStage = getRenalStage(plan.profile);
    const isLowProtRenal =
      renalStage === "drc_leve" ||
      renalStage === "drc_conservador" ||
      renalStage === "drc_avancada";
    const nextPoolIndex = (meal.poolIndex || 0) + 1;
    const slotTargetKcal = meal.isOptional
      ? Math.min(220, Math.max(160, plan.targets.kcal * (meal.share || 0.12)))
      : plan.targets.kcal * (meal.share || 0.20);
    const slotTargetProtein = meal.isOptional
      ? Math.round(plan.targets.protein * 0.12)
      : Math.round(plan.targets.protein * (meal.share || 0.20));

    const solidList = pool.filter((r) => !(r.tags || []).includes("whey"));
    const wheyList = pool.filter((r) => (r.tags || []).includes("whey"));
    const options = [];

    const addScaled = (candidate) => {
      if (candidate && !options.some((o) => o.id === candidate.id)) {
        options.push(scaleRecipeForSlot(candidate, slotTargetKcal, slotTargetProtein, isLowProtRenal));
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
    swapMealInPlan,
    computeDailySchedule,
    formatHour,
    parseTimeStr
  };
})();
