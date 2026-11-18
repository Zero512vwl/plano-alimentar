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

  // Distribui os horários sem permitir sobreposição entre refeições, em qualquer turno (diurno ou noturno)
  function computeDailySchedule(profile, isWorkday) {
    const wake = Number(profile.hora_acorda ?? 6);
    const rawSleep = Number(profile.hora_dorme ?? 22.5);
    let sleep = rawSleep <= wake + 4 ? rawSleep + 24 : rawSleep;
    if (sleep - wake > 20) sleep = wake + 16.5;

    const awakeSpan = Math.max(10, sleep - wake);
    const wStart = Number(profile.trabalho_inicio ?? 7);
    const wEnd = Number(profile.trabalho_fim ?? 17);
    const worksOutside = Boolean(isWorkday && profile.rotina_trabalho === "fora_dia_todo");

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
    const baseSlots = getSlotTemplate(Number(profile.refeicoes) || 4);
    return baseSlots.map((slot) => {
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
        timeStr: formatHour(hour),
        atWork,
        rushedMorning: isRushed,
        locationLabel
      };
    });
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

    // Na DRC conservadora (KDOQI / SBN / BRASPEN), garantir aporte energético adequado (25-35 kcal/kg de peso ajustado) para evitar catabolismo
    const heightM = altura / 100;
    const bmi = heightM > 0 ? peso / (heightM * heightM) : 22;
    let pesoRef = peso;
    if (bmi >= 30) {
      const idealWeight = 25 * (heightM * heightM);
      pesoRef = idealWeight + 0.25 * (peso - idealWeight);
    } else if (bmi >= 25 && doencas.includes("renal_alerta")) {
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

    // Diretriz Oficial Doença Renal Crônica em tratamento conservador (KDOQI / SBN / BRASPEN):
    // 0,6 a 0,8 g/kg/dia (usamos 0,75 g/kg/dia sobre peso de referência; 0,8 g/kg se também houver diabetes)
    if (doencas.includes("renal_alerta")) {
      proteinPerKg = doencas.includes("diabetes") ? 0.8 : 0.72;
    }

    const proteinG = Math.round(pesoRef * proteinPerKg);
    const fatShare = doencas.includes("colesterol") ? 0.22 : doencas.includes("renal_alerta") ? 0.30 : 0.25;
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
      pesoRef: Math.round(pesoRef * 10) / 10
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

    if (habilidade === "basica" && prepMins >= 30) {
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

    // Diretriz SBN / KDOQI Doença Renal Crônica:
    // Exclui suplementos de Whey Protein e receitas centradas em leguminosas puras de alto potássio/fósforo sem carne de alto valor biológico
    if (doencas.includes("renal_alerta")) {
      if (tags.includes("whey") || recipe.id === "alm-grao-bico-arroz" || recipe.id === "ceia-abacate-cacau") {
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

      // 1. Diretriz SBD Diabetes / Pré-diabetes e SBC Dislipidemia (controle de IG e triglicérides)
      if (doencas.includes("diabetes") || doencas.includes("colesterol") || doencas.includes("hipertensao")) {
        if (ing.name === "Pão francês") {
          ing = {
            ...ing,
            name: doencas.includes("hipertensao")
              ? "Pão integral com baixo teor de sódio (baixo IG)"
              : "Pão de forma integral (baixo IG)",
            kcal100: 253,
            p100: 9.4,
            c100: 49.9,
            g100: 3.7,
            fib100: 6.9
          };
          adaptedName = adaptedName.replace(/Pão francês/gi, "Pão integral");
        }
      }

      if (doencas.includes("diabetes") || doencas.includes("colesterol")) {
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

      // 2. Diretriz SBC Hipertensão (DASH) e SBN Doença Renal (controle estrito de sódio < 2000 mg/dia)
      if (doencas.includes("hipertensao") || doencas.includes("renal_alerta")) {
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

      // 5. Diretriz SBN Doença Renal Crônica: reduz fósforo/potássio de oleaginosas e sementes concentradas e ajusta feijão/azeite
      if (doencas.includes("renal_alerta")) {
        if (/Pasta de amendoim|Amendoim torrado|Semente de chia/i.test(ing.name)) {
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
        } else if (/Feijão/i.test(ing.name)) {
          ing = {
            ...ing,
            name: ing.name + " (apenas grãos cozidos em 2 águas para reduzir potássio)",
            grams: 45,
            scalable: false
          };
        } else if (/Azeite de oliva/i.test(ing.name)) {
          ing = {
            ...ing,
            grams: 10,
            scalable: true
          };
        }
      }

      // 6. Diretriz SBEM Hipotireoidismo: evita soja próxima ao horário da levotiroxina
      if (doencas.includes("hipotireoidismo") && /Bebida de soja/i.test(ing.name)) {
        ing = {
          ...ing,
          name: "Leite desnatado ou bebida vegetal de amêndoas/aveia (sem soja)"
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
    if (doencas.includes("renal_alerta") && !/SBN/i.test(adaptedNotes)) {
      adaptedNotes += " Diretriz Renal (SBN/KDOQI): porção proteica reduzida para proteger a filtração glomerular e sem sal oculto.";
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

  function buildAppliedGuidelines(profile, targets) {
    const list = [];
    const doencas = profile.doencas || [];
    const wakeStr = formatHour(profile.hora_acorda ?? 6);
    const sleepStr = formatHour(profile.hora_dorme ?? 22.5);
    const wStartStr = formatHour(profile.trabalho_inicio ?? 7);
    const wEndStr = formatHour(profile.trabalho_fim ?? 17);

    if (profile.rotina_trabalho === "fora_dia_todo") {
      list.push(
        `Horários ajustados ao seu turno (${wStartStr} às ${wEndStr}, acordando às ${wakeStr} e dormindo às ${sleepStr}): as refeições de segunda a sexta que caem dentro do expediente foram marcadas como "No trabalho" e adaptadas ao seu armazenamento.`
      );
    } else {
      list.push(
        `Horários do dia ajustados (acordando às ${wakeStr} e dormindo às ${sleepStr}): horários sugeridos distribuídos ao longo do dia sem sobreposição.`
      );
    }

    if (profile.habilidade === "basica") {
      list.push(
        "Cozinha Básica: selecionamos apenas preparos rápidos (até 25 min), grelhados simples, airfryer, ovos, sanduíches e shakes, sem receitas longas de pressão ou forno."
      );
    }

    if (profile.rotina_trabalho === "fora_dia_todo") {
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
        "Diretriz Hiperuricemia / Gota (SBR): removidas carnes vermelhas e peixes ricos em purinas, priorizando laticínios desnatados (que possuem efeito uricosúrico comprovado), ovos e proteínas vegetais. Evite álcool/cerveja e bebidas com frutose/refrigerantes, e beba mais de 2,5 L de água/dia."
      );
    }
    if (doencas.includes("hipotireoidismo")) {
      list.push(
        "Diretriz Hipotireoidismo (SBEM): bebidas de soja foram substituídas para não reduzir a absorção da levotiroxina. Tome o hormônio da tireoide em jejum com água pura e aguarde 30 a 60 minutos antes do café da manhã (evite suplementos de ferro ou cálcio no mesmo horário)."
      );
    }
    if (doencas.includes("renal_alerta")) {
      list.push(
        `Diretriz Doença Renal Crônica em Tratamento Conservador (SBN / BRASPEN / KDOQI): a ingestão proteica foi estritamente controlada em 0,6 a 0,8 g/kg/dia (meta de ${targets.protein} g/dia) e as gramas de carnes/ovos de cada prato foram reduzidas automaticamente, mantendo o aporte calórico (25-35 kcal/kg) via carboidratos complexos e azeite para evitar catabolismo. Suplementos de Whey, queijos com sal e sementes ricas em fósforo foram retirados. Atenção: NUNCA consuma carambola (neurotóxica na DRC) e valide potássio/fósforo séricos com seu nefrologista.`
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

  // Escalonamento em 2 eixos e 2 passagens (Proteína + Energia separadamente):
  // Garante que a proteína total da refeição (somando carnes/ovos + proteína vegetal do arroz/aveia/pão)
  // bata exatamente a meta proteica da refeição (fundamental na DRC 0,6-0,8 g/kg/dia), enquanto os carboidratos/gorduras fecham as calorias!
  function scaleRecipeForSlot(recipe, targetSlotKcal, targetSlotProtein, isRenal) {
    const isProteinDominant = (ing) =>
      ing.p100 >= 11 && ing.p100 * 4 >= ing.c100 * 1.4;

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

    // 2 iterações para convergir simultaneamente Proteína Total e Calorias Totais do prato
    for (let iter = 0; iter < 3; iter++) {
      const currentOtherProt = baseProtFromFixed + baseProtFromEnergyIngs * energyFactor;
      if (baseProtFromProtIngs > 0 && targetSlotProtein > 0) {
        const desiredFromProt = Math.max(
          isRenal ? 2.5 : 8,
          targetSlotProtein - currentOtherProt
        );
        const rawProt = desiredFromProt / baseProtFromProtIngs;
        protFactor = isRenal
          ? Math.min(0.85, Math.max(0.18, rawProt))
          : Math.min(1.45, Math.max(0.50, rawProt));
      }

      const currentProtAndFixedKcal = baseKcalFromFixed + baseKcalFromProtIngs * protFactor;
      if (baseKcalFromEnergyIngs > 0) {
        const neededEnergyKcal = Math.max(80, targetSlotKcal - currentProtAndFixedKcal);
        const rawEnergy = neededEnergyKcal / baseKcalFromEnergyIngs;
        energyFactor = Math.min(isRenal ? 2.4 : 2.1, Math.max(0.55, rawEnergy));
      }
    }

    const scaledIngredients = recipe.ingredients.map((ing) => {
      let newGrams = ing.grams;
      if (isProteinDominant(ing)) {
        newGrams = roundTo5(ing.grams * protFactor);
      } else if (ing.scalable) {
        newGrams = roundTo5(ing.grams * energyFactor);
      }
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
    const isRenal = doencas.includes("renal_alerta");
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

    function scaleForTarget(recipe, targetSlotKcal, targetSlotProtein) {
      return scaleRecipeForSlot(recipe, targetSlotKcal, targetSlotProtein, isRenal);
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
        return { pool: basePool, routineBadge: "" };
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

      if (scheduledSlot.category === "lanche" || scheduledSlot.category === "cafe") {
        if (armazenamentoTrabalho === "mochila_sem_geladeira") {
          const portable = basePool.filter((r) => r.portableRoomTemp);
          return {
            pool: portable.length > 0 ? portable : basePool,
            routineBadge: "No trabalho: leva na mochila"
          };
        }
        return {
          pool: basePool,
          routineBadge: "No trabalho: lanche prático"
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
      appliedGuidelines: buildAppliedGuidelines(profile, targets),
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

    const isRenal = ((plan.profile && plan.profile.doencas) || []).includes("renal_alerta");
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
        options.push(scaleRecipeForSlot(candidate, slotTargetKcal, slotTargetProtein, isRenal));
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
