// Controlador da interface, persistência em localStorage e exportação para PDF
(function () {
  const STORAGE_PROFILE_KEY = "plano_alimentar_profile_v1";
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

  function renderDayDetail(day) {
    const mealsHtml = day.meals
      .map((m) => {
        const r = m.recipe;
        const ingList = r.ingredients
          .map((ing) => {
            const estBadge = ing.estimated ? '<span class="badge-estimate">estimativa</span>' : "";
            const hint = ing.unitHint ? ` (${escapeHtml(ing.unitHint)})` : "";
            return `<li><strong>${ing.grams} g</strong> de ${escapeHtml(ing.name)}${hint}${estBadge}</li>`;
          })
          .join("");

        const freezeTag = r.freezable
          ? '<span class="badge-freeze">Congelável em lote</span>'
          : "";

        return `
          <article class="meal-card">
            <span class="meal-slot-label">${escapeHtml(m.slotLabel)}</span>
            <h3>${escapeHtml(r.name)}</h3>
            ${freezeTag}
            <p class="meal-macros">${r.macros.kcal} kcal | P ${r.macros.protein}g | C ${r.macros.carbs}g | G ${r.macros.fat}g | Fibras ${r.macros.fiber}g</p>
            <ul class="meal-ingredients">${ingList}</ul>
          </article>
        `;
      })
      .join("");

    return `
      <div class="day-header-bar">
        <h2>${escapeHtml(day.dayName)}</h2>
        <span class="day-macros-line">Total do dia: ${day.totals.kcal} kcal | Proteína ${day.totals.protein}g | Carbo ${day.totals.carbs}g | Gordura ${day.totals.fat}g | Fibras ${day.totals.fiber}g</span>
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

    document.getElementById("day-detail-container").innerHTML = renderDayDetail(
      plan.days[activeDayIndex]
    );

    // Preenche a visão completa para impressão / PDF
    document.getElementById("print-all-days").innerHTML = plan.days
      .map((d) => `<div class="print-day-block">${renderDayDetail(d)}</div>`)
      .join("");
  }

  function renderRecipes(plan) {
    const container = document.getElementById("recipes-container");
    container.innerHTML = plan.uniqueRecipes
      .map(({ recipe, count }) => {
        const ingList = recipe.ingredients
          .map((ing) => {
            const estBadge = ing.estimated ? '<span class="badge-estimate">estimativa</span>' : "";
            return `<li><strong>${ing.grams} g</strong> de ${escapeHtml(ing.name)}${estBadge}</li>`;
          })
          .join("");

        const stepsList = recipe.steps
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("");

        return `
          <article class="recipe-card">
            <div>
              <h3>${escapeHtml(recipe.name)}</h3>
              <p class="meal-macros">Porção padrão: ${recipe.macros.kcal} kcal | P ${recipe.macros.protein}g | C ${recipe.macros.carbs}g | G ${recipe.macros.fat}g | Aparece ${count}x na semana</p>
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
    const summaryText = `Objetivo: ${plan.profile.objetivoLabel} | ${plan.profile.refeicoes} refeições por dia | Peso: ${plan.profile.peso} kg`;
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

  function applyTheme(mode) {
    const validMode = mode === "light" ? "light" : "dark";
    document.documentElement.dataset.mode = validMode;
    if (btnThemeToggle) {
      btnThemeToggle.textContent = validMode === "dark" ? "Tema claro" : "Tema escuro";
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", validMode === "dark" ? "#111614" : "#f3f3ef");
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, validMode);
    } catch {
      // Ignora erro se localStorage estiver bloqueado
    }
  }

  if (btnThemeToggle) {
    applyTheme(document.documentElement.dataset.mode || "dark");
    btnThemeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.mode === "light" ? "light" : "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  setupTabs();
  renderDislikesPicker();

  const savedProfile = loadProfile();
  if (savedProfile) {
    fillFormFromProfile(savedProfile);
    const plan = window.DietEngine.generatePlan(savedProfile);
    showPlan(plan);
  }
})();
