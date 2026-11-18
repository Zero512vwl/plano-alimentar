// Controlador da interface, persistência em localStorage e exportação para PDF
(function () {
  const STORAGE_PROFILE_KEY = "plano_alimentar_profile_v1";
  const STORAGE_PLAN_KEY = "plano_alimentar_plan_v10";
  const STORAGE_CHECKS_KEY = "plano_alimentar_checks_v1";
  const STORAGE_THEME_KEY = "plano_alimentar_theme_v1";

  const intakeSection = document.getElementById("intake-section");
  const planSection = document.getElementById("plan-section");
  const headerActions = document.getElementById("header-actions");
  const form = document.getElementById("anamnese-form");
  const formError = document.getElementById("form-error");

  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const btnEditProfile = document.getElementById("btn-edit-profile");
  const btnExportPdf = document.getElementById("btn-export-pdf");
  const btnClearChecks = document.getElementById("btn-clear-checks");

  const COMMON_FOODS = [
    {
      group: "Proteínas e Ovos",
      items: [
        { label: "Frango", value: "frango" },
        { label: "Carne bovina / Patinho", value: "patinho" },
        { label: "Peixe / Tilápia", value: "tilapia" },
        { label: "Ovo", value: "ovo" },
        { label: "Whey Protein (suplemento)", value: "whey" },
        { label: "Grão-de-bico", value: "grao-de-bico" },
        { label: "Lentilha", value: "lentilha" }
      ]
    },
    {
      group: "Carboidratos e Grãos",
      items: [
        { label: "Arroz", value: "arroz" },
        { label: "Feijão carioca", value: "feijao carioca" },
        { label: "Feijão preto", value: "feijao preto" },
        { label: "Batata inglesa / Purê", value: "batata inglesa" },
        { label: "Batata-doce", value: "batata-doce" },
        { label: "Pão francês", value: "pao frances" },
        { label: "Pão integral", value: "pao de forma integral" },
        { label: "Tapioca", value: "tapioca" },
        { label: "Cuscuz / Flocão de milho", value: "cuscuz" },
        { label: "Aveia", value: "aveia" }
      ]
    },
    {
      group: "Frutas e Legumes",
      items: [
        { label: "Mamão", value: "mamao" },
        { label: "Banana", value: "banana" },
        { label: "Maçã", value: "maca" },
        { label: "Morango", value: "morango" },
        { label: "Abacate", value: "abacate" },
        { label: "Brócolis", value: "brocolis" },
        { label: "Abobrinha", value: "abobrinha" },
        { label: "Cenoura", value: "cenoura" },
        { label: "Vagem", value: "vagem" },
        { label: "Chuchu", value: "chuchu" },
        { label: "Abóbora", value: "abobora" },
        { label: "Tomate / Alface", value: "tomate" }
      ]
    },
    {
      group: "Laticínios, Sementes e Outros",
      items: [
        { label: "Iogurte natural", value: "iogurte" },
        { label: "Queijo minas", value: "queijo minas" },
        { label: "Requeijão", value: "requeijao" },
        { label: "Leite vegetal / Soja", value: "soja" },
        { label: "Pasta de amendoim", value: "pasta de amendoim" },
        { label: "Amendoim / Castanhas", value: "amendoim" },
        { label: "Chia", value: "chia" }
      ]
    }
  ];

  let currentPlan = null;
  let activeDayIndex = 0;
  let checkedItems = loadCheckedItems();
  let selectedDislikes = new Set();
  let foodSearchQuery = "";

  function normalizeSearch(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function loadCheckedItems() {
    try {
      const raw = localStorage.getItem(STORAGE_CHECKS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCheckedItems() {
    try {
      localStorage.setItem(STORAGE_CHECKS_KEY, JSON.stringify(checkedItems));
    } catch {
      // Ignora erro se localStorage estiver bloqueado
    }
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignora erro se localStorage estiver bloqueado
    }
  }

  function loadSavedPlan() {
    try {
      const raw = localStorage.getItem(STORAGE_PLAN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function savePlan(plan) {
    try {
      localStorage.setItem(STORAGE_PLAN_KEY, JSON.stringify(plan));
    } catch {
      // Ignora erro se localStorage estiver bloqueado
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fillFormFromProfile(profile) {
    if (!profile) return;
    form.nome.value = profile.nome || "";
    form.objetivo.value = profile.objetivo || "emagrecimento";
    form.sexo.value = profile.sexo || "F";
    form.idade.value = profile.idade || 45;
    form.peso.value = profile.peso || 72;
    form.altura.value = profile.altura || 168;
    form.atividade.value = profile.atividade || "leve";
    form.refeicoes.value = String(profile.refeicoes || 4);
    form.variacao.value = profile.variacao || "pratica";
    form.aversoes.value = profile.aversoes || "";

    const restSet = new Set(profile.restricoes || []);
    form.querySelectorAll('input[name="restricoes"]').forEach((cb) => {
      cb.checked = restSet.has(cb.value);
    });

    selectedDislikes = new Set(profile.aversoesSelecionadas || []);
    renderDislikesPicker();
  }

  function readProfileFromForm() {
    const restricoes = [];
    form.querySelectorAll('input[name="restricoes"]:checked').forEach((cb) => {
      restricoes.push(cb.value);
    });

    return {
      nome: form.nome.value.trim(),
      objetivo: form.objetivo.value,
      sexo: form.sexo.value,
      idade: Number(form.idade.value),
      peso: Number(form.peso.value),
      altura: Number(form.altura.value),
      atividade: form.atividade.value,
      refeicoes: Number(form.refeicoes.value),
      variacao: form.variacao.value,
      restricoes,
      aversoesSelecionadas: Array.from(selectedDislikes),
      aversoes: form.aversoes.value.trim()
    };
  }

  function validateProfile(p) {
    if (!p.nome) return "Por favor, informe o seu nome.";
    if (!p.idade || p.idade < 16 || p.idade > 100) return "Informe uma idade válida entre 16 e 100 anos.";
    if (!p.peso || p.peso < 35 || p.peso > 250) return "Informe um peso válido em kg (entre 35 e 250).";
    if (!p.altura || p.altura < 130 || p.altura > 220) return "Informe uma altura válida em cm (entre 130 e 220).";
    return null;
  }

  function renderMetrics(plan) {
    const { targets, weeklyAvg } = plan;
    const clampRatio = (val, target) =>
      target > 0 ? Math.min(1, Math.max(0.08, Number((val / target).toFixed(2)))) : 1;

    const items = [
      {
        label: "Calorias por dia",
        value: `${weeklyAvg.kcal} kcal`,
        sub: `Meta calculada: ${targets.kcal} kcal (GET ${targets.get} kcal)`,
        ratio: clampRatio(weeklyAvg.kcal, targets.kcal)
      },
      {
        label: "Proteínas",
        value: `${weeklyAvg.protein} g`,
        sub: `Meta diária: ${targets.protein} g`,
        ratio: clampRatio(weeklyAvg.protein, targets.protein)
      },
      {
        label: "Carboidratos",
        value: `${weeklyAvg.carbs} g`,
        sub: `Meta diária: ${targets.carbs} g`,
        ratio: clampRatio(weeklyAvg.carbs, targets.carbs)
      },
      {
        label: "Gorduras",
        value: `${weeklyAvg.fat} g`,
        sub: `Meta diária: ${targets.fat} g`,
        ratio: clampRatio(weeklyAvg.fat, targets.fat)
      },
      {
        label: "Fibras",
        value: `${weeklyAvg.fiber} g`,
        sub: `Meta mínima: ${targets.fiber} g`,
        ratio: clampRatio(weeklyAvg.fiber, targets.fiber)
      }
    ];

    document.getElementById("metrics-grid").innerHTML = items
      .map(
        (m) => `
      <div class="metric-box">
        <span class="metric-label">${escapeHtml(m.label)}</span>
        <span class="metric-value">${escapeHtml(m.value)}</span>
        <div class="progress-track" aria-hidden="true">
          <div class="progress-fill" style="--progress: ${m.ratio};"></div>
        </div>
        <span class="metric-sub">${escapeHtml(m.sub)}</span>
      </div>
    `
      )
      .join("");

    document.getElementById("transparency-note").textContent =
      "Base nutricional TACO/TBCA e USDA. Medidas caseiras convertidas (como fio de azeite, colher de chia e unidades de ovos/frutas) aparecem sinalizadas como estimativa.";
  }

  function renderDayDetail(day, dayIdx, isPrint) {
    const mealsHtml = day.meals
      .map((m, mealIdx) => {
        const r = m.recipe;
        const options = m.options || [r];
        const activeOptIdx = m.activeOptionIndex || 0;

        const ingList = r.ingredients
          .map((ing) => {
            const estBadge = ing.estimated ? '<span class="badge-estimate">estimativa</span>' : "";
            const hint = ing.unitHint ? ` (${escapeHtml(ing.unitHint)})` : "";
            const kcalText = typeof ing.kcal === "number" ? ` <span class="ing-kcal">(${ing.kcal} kcal)</span>` : "";
            return `<li><strong>${ing.grams} g</strong> de ${escapeHtml(ing.name)}${hint}${kcalText}${estBadge}</li>`;
          })
          .join("");

        const freezeTag = r.freezable
          ? '<span class="badge-freeze">Congelável em lote</span>'
          : "";

        const optionalTag = m.isOptional
          ? '<span class="badge-optional">Opcional: fora da meta principal</span>'
          : "";

        const swapBtn = !isPrint
          ? `<button type="button" class="btn btn-secondary btn-small btn-swap no-print" data-day-idx="${dayIdx}" data-meal-idx="${mealIdx}">Girar opções</button>`
          : "";

        const optionTabsHtml =
          !isPrint && options.length > 1
            ? `<div class="meal-option-pills no-print" role="group" aria-label="Opções da refeição">
                ${options
                  .map((opt, optIdx) => {
                    const hasWhey = (opt.tags || []).includes("whey");
                    const labelPrefix = hasWhey
                      ? `Opção ${optIdx + 1} com Whey`
                      : `Opção ${optIdx + 1}`;
                    return `
                  <button type="button" class="opt-pill ${optIdx === activeOptIdx ? "is-active" : ""}" data-day-idx="${dayIdx}" data-meal-idx="${mealIdx}" data-opt-idx="${optIdx}">
                    ${labelPrefix} (${opt.macros.kcal} kcal)
                  </button>
                `;
                  })
                  .join("")}
              </div>`
            : "";

        const otherOptions = options
          .map((opt, idx) => ({ opt, idx }))
          .filter((entry) => entry.idx !== activeOptIdx);

        const alternativesHtml =
          otherOptions.length > 0
            ? isPrint
              ? `<p class="print-alt-line"><strong>Substituições equivalentes:</strong> ${otherOptions
                  .map(({ opt, idx }) => `Opção ${idx + 1}: ${escapeHtml(opt.name)} (${opt.macros.kcal} kcal)`)
                  .join(" | ")}</p>`
              : `<details class="meal-alternatives no-print">
                  <summary class="alt-heading">Ver outras opções equivalentes (${otherOptions.length})</summary>
                  <ul class="alt-list">
                    ${otherOptions
                      .map(({ opt, idx }) => {
                        const hasWhey = (opt.tags || []).includes("whey");
                        const wheyTag = hasWhey ? " [Com Whey]" : "";
                        const shortIngs = opt.ingredients
                          .map((i) => `${i.grams}g ${escapeHtml(i.name)} (${i.kcal || 0} kcal)`)
                          .join(", ");
                        return `<li><strong>Opção ${idx + 1}${wheyTag}: ${escapeHtml(opt.name)}</strong> (${opt.macros.kcal} kcal | P ${opt.macros.protein}g | C ${opt.macros.carbs}g | G ${opt.macros.fat}g) <span class="alt-ings">${shortIngs}</span></li>`;
                      })
                      .join("")}
                  </ul>
                </details>`
            : "";

        return `
          <article class="meal-card ${m.isOptional ? "meal-card-optional" : ""}">
            <div class="meal-card-top">
              <span class="meal-slot-label">${escapeHtml(m.slotLabel)}</span>
              ${swapBtn}
            </div>
            ${optionTabsHtml}
            <h3>${escapeHtml(r.name)}</h3>
            <div class="meal-badges">${freezeTag}${optionalTag}</div>
            <p class="meal-macros"><strong>${r.macros.kcal} kcal</strong> | P ${r.macros.protein}g | C ${r.macros.carbs}g | G ${r.macros.fat}g | Fibras ${r.macros.fiber}g</p>
            <ul class="meal-ingredients">${ingList}</ul>
            ${alternativesHtml}
          </article>
        `;
      })
      .join("");

    const ceiaNote = day.optionalCeiaKcal
      ? ` | Ceia opcional: +${day.optionalCeiaKcal} kcal`
      : "";

    return `
      <div class="day-header-bar">
        <h2>${escapeHtml(day.dayName)}</h2>
        <span class="day-macros-line">Total das refeições principais: ${day.totals.kcal} kcal | Proteína ${day.totals.protein}g | Carbo ${day.totals.carbs}g | Gordura ${day.totals.fat}g | Fibras ${day.totals.fiber}g${ceiaNote}</span>
      </div>
      <div class="meals-list">${mealsHtml}</div>
    `;
  }

  function renderDays(plan) {
    const selector = document.getElementById("day-selector");
    selector.innerHTML = plan.days
      .map(
        (d, idx) => `
      <button type="button" class="day-pill ${idx === activeDayIndex ? "is-active" : ""}" data-day-index="${idx}" role="tab" aria-selected="${idx === activeDayIndex}">
        ${escapeHtml(d.dayName.split("-")[0])}
      </button>
    `
      )
      .join("");

    selector.querySelectorAll(".day-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDayIndex = Number(btn.dataset.dayIndex);
        renderDays(plan);
      });
    });

    const detailContainer = document.getElementById("day-detail-container");
    detailContainer.innerHTML = renderDayDetail(
      plan.days[activeDayIndex],
      activeDayIndex,
      false
    );

    detailContainer.querySelectorAll(".opt-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dIdx = Number(btn.dataset.dayIdx);
        const mIdx = Number(btn.dataset.mealIdx);
        const oIdx = Number(btn.dataset.optIdx);
        window.DietEngine.selectMealOption(plan, dIdx, mIdx, oIdx);
        savePlan(plan);
        renderMetrics(plan);
        renderDays(plan);
        renderRecipes(plan);
        renderFreezer(plan);
        renderShopping(plan);
      });
    });

    detailContainer.querySelectorAll(".btn-swap").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dIdx = Number(btn.dataset.dayIdx);
        const mIdx = Number(btn.dataset.mealIdx);
        window.DietEngine.swapMealInPlan(plan, dIdx, mIdx);
        savePlan(plan);
        renderMetrics(plan);
        renderDays(plan);
        renderRecipes(plan);
        renderFreezer(plan);
        renderShopping(plan);
      });
    });

    // Preenche a visão completa para impressão / PDF
    document.getElementById("print-all-days").innerHTML = plan.days
      .map((d, idx) => `<div class="print-day-block">${renderDayDetail(d, idx, true)}</div>`)
      .join("");
  }

  function renderRecipes(plan) {
    const container = document.getElementById("recipes-container");
    container.innerHTML = plan.uniqueRecipes
      .map(({ recipe, count }) => {
        const ingList = recipe.ingredients
          .map((ing) => {
            const estBadge = ing.estimated ? '<span class="badge-estimate">estimativa</span>' : "";
            const kcalText = typeof ing.kcal === "number" ? ` <span class="ing-kcal">(${ing.kcal} kcal)</span>` : "";
            return `<li><strong>${ing.grams} g</strong> de ${escapeHtml(ing.name)}${kcalText}${estBadge}</li>`;
          })
          .join("");

        const stepsList = recipe.steps
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("");

        return `
          <article class="recipe-card">
            <div>
              <h3>${escapeHtml(recipe.name)}</h3>
              <p class="meal-macros">Porção calculada: <strong>${recipe.macros.kcal} kcal</strong> | P ${recipe.macros.protein}g | C ${recipe.macros.carbs}g | G ${recipe.macros.fat}g | Aparece ${count}x na semana</p>
            </div>
            <div>
              <strong>Ingredientes por porção:</strong>
              <ul class="meal-ingredients">${ingList}</ul>
            </div>
            <div>
              <strong>Modo de preparo (${escapeHtml(recipe.prepTime)}):</strong>
              <ol class="recipe-steps">${stepsList}</ol>
            </div>
            <p class="recipe-notes">${escapeHtml(recipe.notes)}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderFreezer(plan) {
    const container = document.getElementById("freezer-container");
    if (plan.freezerBatches.length === 0) {
      container.innerHTML =
        '<p class="section-sub">Os preparos selecionados para esta semana são de preparo fresco na hora.</p>';
      return;
    }

    container.innerHTML = plan.freezerBatches
      .map(
        ({ recipe, count }) => `
      <article class="freezer-card">
        <h3>${escapeHtml(recipe.name)}</h3>
        <p><strong>Porções na semana:</strong> ${count} porções</p>
        <p><strong>Como armazenar e descongelar:</strong> ${escapeHtml(recipe.thawNote)}</p>
      </article>
    `
      )
      .join("");
  }

  function updateShoppingProgress() {
    const allCheckboxes = document.querySelectorAll('#shopping-container input[type="checkbox"]');
    const total = allCheckboxes.length;
    const checkedCount = Array.from(allCheckboxes).filter((c) => c.checked).length;
    document.getElementById("shopping-progress").textContent = `${checkedCount} de ${total} marcados`;
    const bar = document.getElementById("shopping-progress-bar");
    if (bar) {
      const ratio = total > 0 ? Number((checkedCount / total).toFixed(3)) : 0;
      bar.style.setProperty("--progress", String(ratio));
    }
  }

  function renderShoppingGroup(title, subtitle, sectors) {
    if (!sectors || sectors.length === 0) {
      return `
        <section class="shopping-group">
          <h3>${escapeHtml(title)}</h3>
          <p class="section-sub">${escapeHtml(subtitle)}</p>
          <p class="section-sub">Nenhum item nesta categoria.</p>
        </section>
      `;
    }

    const sectorsHtml = sectors
      .map((sec) => {
        const itemsHtml = sec.items
          .map((item) => {
            const checkKey = `${title}::${item.id}`;
            const isChecked = Boolean(checkedItems[checkKey]);
            const rawTag = item.hasRawAdjustment ? " (peso cru)" : "";
            return `
              <li class="shopping-item ${isChecked ? "is-checked" : ""}">
                <label>
                  <input type="checkbox" data-check-key="${escapeHtml(checkKey)}" ${isChecked ? "checked" : ""}>
                  <span>${escapeHtml(item.name)}${rawTag}</span>
                  <strong class="shopping-qty">${escapeHtml(item.displayQty)}</strong>
                </label>
              </li>
            `;
          })
          .join("");

        return `
          <div class="shopping-sector">
            <h4>${escapeHtml(sec.sector)}</h4>
            <ul class="shopping-items">${itemsHtml}</ul>
          </div>
        `;
      })
      .join("");

    return `
      <section class="shopping-group">
        <h3>${escapeHtml(title)}</h3>
        <p class="section-sub">${escapeHtml(subtitle)}</p>
        ${sectorsHtml}
      </section>
    `;
  }

  function renderShopping(plan) {
    const container = document.getElementById("shopping-container");
    container.innerHTML =
      renderShoppingGroup(
        "1. Compra de Lote e Congelamento",
        "Carnes, grãos e bases para cozinhar em lote e porcionar.",
        plan.shopping.lote
      ) +
      renderShoppingGroup(
        "2. Compra Fresca da Semana",
        "Frutas, legumes, folhas, ovos, laticínios e itens do dia a dia.",
        plan.shopping.frescos
      );

    container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const key = cb.dataset.checkKey;
        if (cb.checked) {
          checkedItems[key] = true;
          cb.closest(".shopping-item").classList.add("is-checked");
        } else {
          delete checkedItems[key];
          cb.closest(".shopping-item").classList.remove("is-checked");
        }
        saveCheckedItems();
        updateShoppingProgress();
      });
    });

    updateShoppingProgress();
  }

  function showPlan(plan) {
    currentPlan = plan;
    activeDayIndex = 0;

    document.getElementById("plan-heading").textContent = `Plano semanal de ${plan.profile.nome}`;
    const variacaoText = plan.profile.variacao === "pratica" ? "Modo prático (lotes)" : "Modo variado";
    const summaryText = `Objetivo: ${plan.profile.objetivoLabel} | ${plan.profile.refeicoes} refeições principais + Ceia opcional | ${variacaoText} | Peso: ${plan.profile.peso} kg`;
    document.getElementById("plan-profile-summary").textContent = summaryText;
    document.getElementById("print-subtitle").textContent = `${plan.profile.nome} — ${summaryText}`;

    renderMetrics(plan);
    renderDays(plan);
    renderRecipes(plan);
    renderFreezer(plan);
    renderShopping(plan);

    intakeSection.hidden = true;
    planSection.hidden = false;
    headerActions.hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function updateDislikesBadge() {
    const count = selectedDislikes.size;
    const badge = document.getElementById("dislikes-badge");
    const summary = document.getElementById("food-selected-summary");
    badge.textContent = String(count);
    badge.hidden = count === 0;
    summary.textContent = count === 1 ? "1 selecionado" : `${count} selecionados`;
  }

  function renderDislikesPicker() {
    const container = document.getElementById("dislikes-picker");
    const query = normalizeSearch(foodSearchQuery);
    let totalMatches = 0;

    const groupsHtml = COMMON_FOODS.map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (!query) return true;
        return (
          normalizeSearch(item.label).includes(query) ||
          normalizeSearch(item.value).includes(query)
        );
      });

      if (filteredItems.length === 0) return "";
      totalMatches += filteredItems.length;

      const pillsHtml = filteredItems
        .map((item) => {
          const isChecked = selectedDislikes.has(item.value);
          return `
            <label class="check-pill">
              <input type="checkbox" class="dislike-checkbox" value="${escapeHtml(item.value)}" ${isChecked ? "checked" : ""}>
              <span>${escapeHtml(item.label)}</span>
            </label>
          `;
        })
        .join("");

      return `
        <div class="dislike-group">
          <h3 class="dislike-group-title">${escapeHtml(group.group)}</h3>
          <div class="checkbox-grid">${pillsHtml}</div>
        </div>
      `;
    }).join("");

    container.innerHTML =
      totalMatches > 0
        ? groupsHtml
        : '<p class="dislike-empty">Nenhum alimento encontrado para essa busca. Você pode digitar no campo abaixo.</p>';

    container.querySelectorAll(".dislike-checkbox").forEach((cb) => {
      cb.addEventListener("change", () => {
        if (cb.checked) {
          selectedDislikes.add(cb.value);
        } else {
          selectedDislikes.delete(cb.value);
        }
        updateDislikesBadge();
      });
    });

    updateDislikesBadge();
  }

  function switchIntakeTab(targetId) {
    const btns = document.querySelectorAll("[data-intake-tab]");
    const panels = document.querySelectorAll(".intake-panel");

    btns.forEach((b) => {
      const active = b.dataset.intakeTab === targetId;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });

    panels.forEach((panel) => {
      const active = panel.id === targetId;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  function setupTabs() {
    const tabBtns = document.querySelectorAll("[data-tab]");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        tabBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });
        tabPanels.forEach((panel) => {
          const active = panel.id === targetId;
          panel.classList.toggle("is-active", active);
          panel.hidden = !active;
        });
      });
    });

    document.querySelectorAll("[data-intake-tab]").forEach((btn) => {
      btn.addEventListener("click", () => switchIntakeTab(btn.dataset.intakeTab));
    });

    document.getElementById("btn-go-step-2").addEventListener("click", () => {
      switchIntakeTab("intake-step-2");
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    document.getElementById("btn-back-step-1").addEventListener("click", () => {
      switchIntakeTab("intake-step-1");
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    document.getElementById("food-search").addEventListener("input", (e) => {
      foodSearchQuery = e.target.value;
      renderDislikesPicker();
    });

    document.getElementById("btn-clear-dislikes").addEventListener("click", () => {
      selectedDislikes.clear();
      renderDislikesPicker();
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = readProfileFromForm();
    const errorMsg = validateProfile(profile);
    if (errorMsg) {
      switchIntakeTab("intake-step-1");
      formError.textContent = errorMsg;
      formError.hidden = false;
      formError.focus();
      return;
    }
    formError.hidden = true;
    saveProfile(profile);
    const plan = window.DietEngine.generatePlan(profile);
    savePlan(plan);
    showPlan(plan);
  });

  btnEditProfile.addEventListener("click", () => {
    planSection.hidden = true;
    intakeSection.hidden = false;
    headerActions.hidden = true;
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  btnExportPdf.addEventListener("click", () => {
    window.print();
  });

  btnClearChecks.addEventListener("click", () => {
    if (!window.confirm("Deseja desmarcar todos os itens da lista de compras?")) return;
    checkedItems = {};
    saveCheckedItems();
    if (currentPlan) renderShopping(currentPlan);
  });

  function getEffectiveTheme() {
    const attr = document.documentElement.dataset.mode;
    if (attr === "light" || attr === "dark") return attr;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function updateThemeButtonLabel() {
    const effective = getEffectiveTheme();
    if (btnThemeToggle) {
      btnThemeToggle.textContent = effective === "dark" ? "Tema claro" : "Tema escuro";
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", effective === "dark" ? "#0f1520" : "#f2f5f9");
    }
  }

  function applyTheme(mode) {
    const validMode = mode === "light" ? "light" : "dark";
    document.documentElement.dataset.mode = validMode;
    updateThemeButtonLabel();
    try {
      localStorage.setItem(STORAGE_THEME_KEY, validMode);
    } catch {
      // Ignora erro se localStorage estiver bloqueado
    }
  }

  if (btnThemeToggle) {
    updateThemeButtonLabel();
    btnThemeToggle.addEventListener("click", () => {
      const current = getEffectiveTheme();
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  setupTabs();
  renderDislikesPicker();

  const savedProfile = loadProfile();
  if (savedProfile) {
    fillFormFromProfile(savedProfile);
    const savedPlan = loadSavedPlan();
    if (savedPlan && savedPlan.days && savedPlan.days.length === 7) {
      showPlan(savedPlan);
    } else {
      const plan = window.DietEngine.generatePlan(savedProfile);
      savePlan(plan);
      showPlan(plan);
    }
  }
})();
