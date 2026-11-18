// Banco expandido de receitas brasileiras de dieta (valores aproximados TACO / TBCA / USDA por 100g)
window.RECIPE_BANK = [
  // ==================== CAFÉ DA MANHÃ (12 OPÇÕES) ====================
  {
    id: "cafe-pao-ovo",
    name: "Pão francês na chapa com ovos mexidos e mamão",
    category: "cafe",
    tags: ["gluten", "ovo"],
    freezable: false,
    prepTime: "8 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Pão francês", sector: "Mercearia & Grãos", grams: 50, kcal100: 300, p100: 8.0, c100: 58.6, g100: 3.1, fib100: 2.3, scalable: true, isBatch: false, role: "core" },
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "aprox. 2 unidades", role: "core" },
      { name: "Mamão formosa", sector: "Hortifrúti", grams: 140, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false, role: "fruit" },
      { name: "Azeite de oliva (1 fio para untar)", sector: "Temperos / Conferir em Casa", grams: 3, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Aqueça uma frigideira antiaderente com um fio fino de azeite e mexa os ovos em fogo baixo com uma pitada de sal e orégano.",
      "Doure levemente o pão francês na frigideira, recheie com os ovos e sirva com a fruta picada."
    ],
    notes: "Estimativa: 1 ovo médio considerado com 50g e 1 fio de azeite com 3g."
  },
  {
    id: "cafe-crepioca-queijo",
    name: "Crepioca dourada recheada com queijo minas e fruta",
    category: "cafe",
    tags: ["lactose", "ovo"],
    freezable: false,
    prepTime: "8 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "2 unidades", role: "core" },
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 40, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false, role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 35, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" },
      { name: "Maçã fuji", sector: "Hortifrúti", grams: 120, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Bata os ovos com a goma de tapioca e uma pitada de sal até ficar homogêneo.",
      "Despeje na frigideira antiaderente quente, doure dos dois lados, recheie com o queijo minas e dobre ao meio."
    ],
    notes: "Clássico brasileiro rico em proteínas e naturalmente sem glúten."
  },
  {
    id: "cafe-tapioca-frango",
    name: "Tapioca de frango desfiado com queijo minas e banana",
    category: "cafe",
    tags: ["lactose", "frango"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Use o frango já desfiado do lote semanal.",
    ingredients: [
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 65, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false, role: "core" },
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 60, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 30, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, unitHint: "1 unidade média", role: "fruit" }
    ],
    steps: [
      "Espalhe a goma de tapioca na frigideira quente até formar o disco.",
      "Recheie com o frango desfiado aquecido e o queijo minas, dobre ao meio e sirva com a fruta."
    ],
    notes: "Reaproveita a base de frango desfiado (fator cru/cozido 1,35x na compra)."
  },
  {
    id: "cafe-cuscuz-ovo",
    name: "Cuscuz de milho nordestino com ovos mexidos",
    category: "cafe",
    tags: ["ovo"],
    freezable: false,
    prepTime: "12 min",
    thawNote: "Preparo rápido na cuscuzeira.",
    ingredients: [
      { name: "Cuscuz de milho cozido (flocão)", sector: "Mercearia & Grãos", grams: 130, kcal100: 113, p100: 2.2, c100: 25.3, g100: 0.7, fib100: 2.1, scalable: true, isBatch: false, rawFactor: 0.50, role: "core" },
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "2 unidades", role: "core" },
      { name: "Azeite de oliva (1 fio)", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Hidrate o flocão de milho com água e uma pitada de sal por 5 minutos e cozinhe no vapor na cuscuzeira.",
      "Sirva quente acompanhado dos ovos mexidos feitos com um fio de azeite."
    ],
    notes: "Sem glúten e sem lactose. Fator seco/hidratado do flocão considerado em 0,50x."
  },
  {
    id: "cafe-iogurte-aveia",
    name: "Tigela de iogurte natural com aveia, chia e banana",
    category: "cafe",
    tags: ["lactose"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Montagem rápida na hora.",
    ingredients: [
      { name: "Iogurte natural integral ou desnatado", sector: "Laticínios & Ovos", grams: 170, kcal100: 60, p100: 4.1, c100: 5.5, g100: 2.2, fib100: 0, scalable: true, isBatch: false, unitHint: "1 pote padrão", role: "core" },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 30, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false, role: "core" },
      { name: "Semente de chia", sector: "Mercearia & Grãos", grams: 10, kcal100: 486, p100: 16.5, c100: 42.1, g100: 30.7, fib100: 34.4, scalable: false, estimated: true },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Misture o iogurte com a aveia e a chia em uma tigela.",
      "Finalize com a fruta picada e canela em pó a gosto."
    ],
    notes: "Estimativa: 1 colher de sopa rasa de chia considerada com 10g."
  },
  {
    id: "cafe-panqueca-banana",
    name: "Panqueca dourada de banana, aveia e ovo com canela",
    category: "cafe",
    tags: ["ovo"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "2 unidades", role: "core" },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, unitHint: "1 unidade", role: "core" },
      { name: "Aveia em flocos finos", sector: "Mercearia & Grãos", grams: 30, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false, role: "core" }
    ],
    steps: [
      "Amasse bem a banana com um garfo e misture os ovos e a aveia com uma pitada de canela.",
      "Doure em frigideira antiaderente em fogo baixo por 3 minutos de cada lado."
    ],
    notes: "Sem lactose e muito saciante."
  },
  {
    id: "cafe-sanduiche-frango",
    name: "Torrada integral com pasta de frango, requeijão light e fruta",
    category: "cafe",
    tags: ["gluten", "lactose", "frango"],
    freezable: false,
    prepTime: "6 min",
    thawNote: "Usa a base de frango desfiado do lote.",
    ingredients: [
      { name: "Pão de forma integral", sector: "Mercearia & Grãos", grams: 50, kcal100: 253, p100: 9.4, c100: 49.9, g100: 3.7, fib100: 6.9, scalable: true, isBatch: false, unitHint: "2 fatias", role: "core" },
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 65, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Requeijão cremoso light", sector: "Laticínios & Ovos", grams: 25, kcal100: 185, p100: 11.0, c100: 4.5, g100: 13.5, fib100: 0, scalable: false, estimated: true, role: "core" },
      { name: "Morango fresco", sector: "Hortifrúti", grams: 100, kcal100: 30, p100: 0.9, c100: 6.8, g100: 0.3, fib100: 1.7, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Toste levemente as fatias de pão integral.",
      "Misture o frango desfiado com o requeijão light e espalhe sobre as torradas; acompanhe com a fruta."
    ],
    notes: "Estimativa: 1 colher de sopa de requeijão light considerada com 25g."
  },
  {
    id: "cafe-mingau-aveia",
    name: "Mingau cremoso de aveia com pasta de amendoim e banana",
    category: "cafe",
    tags: [],
    freezable: false,
    prepTime: "7 min",
    thawNote: "Preparo rápido no fogão ou micro-ondas.",
    ingredients: [
      { name: "Bebida de soja sem açúcar (ou leite vegetal)", sector: "Mercearia & Grãos", grams: 220, kcal100: 40, p100: 3.3, c100: 2.0, g100: 2.0, fib100: 0.4, scalable: true, isBatch: false, role: "core" },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 40, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false, role: "core" },
      { name: "Pasta de amendoim integral", sector: "Mercearia & Grãos", grams: 15, kcal100: 588, p100: 25.0, c100: 20.0, g100: 50.0, fib100: 6.0, scalable: true, isBatch: false, role: "core" },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Leve a bebida vegetal com a aveia ao fogo baixo mexendo por 4 minutos até engrossar.",
      "Sirva com rodelas de fruta, canela e a pasta de amendoim por cima."
    ],
    notes: "Opção 100% vegetal, sem lactose e sem ovo."
  },
  {
    id: "cafe-tapioca-ovo",
    name: "Tapioca simples com ovos mexidos e fruta fresca",
    category: "cafe",
    tags: ["ovo"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 70, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false, role: "core" },
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "aprox. 2 unidades", role: "core" },
      { name: "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Prepare os ovos mexidos em frigideira antiaderente.",
      "Grelhe a tapioca até firmar, recheie com os ovos e acompanhe com a fruta."
    ],
    notes: "Opção naturalmente sem glúten e sem lactose."
  },
  {
    id: "cafe-pao-queijo-frigideira",
    name: "Pão de queijo de frigideira com fruta",
    category: "cafe",
    tags: ["lactose", "ovo"],
    freezable: false,
    prepTime: "8 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 50, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "1 unidade", role: "core" },
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 50, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false, role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 50, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" },
      { name: "Requeijão cremoso light", sector: "Laticínios & Ovos", grams: 20, kcal100: 185, p100: 11.0, c100: 4.5, g100: 13.5, fib100: 0, scalable: false, estimated: true, role: "core" },
      { name: "Mamão formosa", sector: "Hortifrúti", grams: 120, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Bata o ovo com a tapioca, o requeijão light e o queijo minas amassado.",
      "Doure dos dois lados em frigideira antiaderente tampada em fogo baixo e sirva com a fruta."
    ],
    notes: "Sem glúten e muito prático."
  },
  {
    id: "cafe-omelete-integral",
    name: "Omelete de ervas finas com pão integral e tomate",
    category: "cafe",
    tags: ["gluten", "ovo"],
    freezable: false,
    prepTime: "8 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "2 unidades", role: "core" },
      { name: "Pão de forma integral", sector: "Mercearia & Grãos", grams: 50, kcal100: 253, p100: 9.4, c100: 49.9, g100: 3.7, fib100: 6.9, scalable: true, isBatch: false, unitHint: "2 fatias", role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 80, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva (1 fio)", sector: "Temperos / Conferir em Casa", grams: 3, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Bata os ovos com salsinha, orégano e sal; faça a omelete na frigideira com um fio de azeite.",
      "Sirva com as fatias de pão integral tostadas e rodelas de tomate."
    ],
    notes: "Sem lactose e com ótimo teor de fibras."
  },
  {
    id: "cafe-vitamina-aveia",
    name: "Vitamina cremosa de aveia, banana, pasta de amendoim e leite vegetal",
    category: "cafe",
    tags: [],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Bater na hora.",
    ingredients: [
      { name: "Bebida de soja sem açúcar (ou leite vegetal)", sector: "Mercearia & Grãos", grams: 250, kcal100: 40, p100: 3.3, c100: 2.0, g100: 2.0, fib100: 0.4, scalable: true, isBatch: false, role: "core" },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 35, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false, role: "core" },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, role: "fruit" },
      { name: "Pasta de amendoim integral", sector: "Mercearia & Grãos", grams: 20, kcal100: 588, p100: 25.0, c100: 20.0, g100: 50.0, fib100: 6.0, scalable: true, isBatch: false, role: "core" }
    ],
    steps: [
      "Bata todos os ingredientes no liquidificador com pedras de gelo até ficar bem cremoso."
    ],
    notes: "Opção sem lactose, sem ovo e sem glúten."
  },

  // ==================== ALMOÇO & JANTAR (16 OPÇÕES) ====================
  {
    id: "alm-frango-arroz-feijao",
    name: "Filé de frango grelhado com arroz, feijão carioca e legumes",
    category: "principal",
    tags: ["frango"],
    freezable: true,
    prepTime: "25 min (rende lote)",
    thawNote: "Descongelar na geladeira na noite anterior e aquecer no micro-ondas ou frigideira.",
    ingredients: [
      { name: "Peito de frango grelhado (peso pronto)", sector: "Açougue & Peixaria", grams: 130, kcal100: 159, p100: 32.0, c100: 0, g100: 2.5, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.30, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 130, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Feijão carioca cozido", sector: "Mercearia & Grãos", grams: 100, kcal100: 76, p100: 4.8, c100: 13.6, g100: 0.5, fib100: 8.5, scalable: true, isBatch: true, rawFactor: 0.35, role: "core" },
      { name: "Cenoura e vagem refogadas", sector: "Hortifrúti", grams: 100, kcal100: 38, p100: 1.4, c100: 8.2, g100: 0.2, fib100: 2.8, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva (preparo)", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Tempere o peito de frango em filés com alho, limão, páprica e sal; grelhe na frigideira ou airfryer.",
      "Cozinhe o feijão em lote e monte o prato com arroz, feijão, frango e os legumes."
    ],
    notes: "Compra em peso cru usa fator de rendimento (frango 1,30x; arroz 0,40x; feijão 0,35x)."
  },
  {
    id: "alm-patinho-pure",
    name: "Patinho moído refogado com purê de batata e salada fresca",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "30 min (rende lote)",
    thawNote: "Congelar a carne moída em porções; o purê também aceita congelamento.",
    ingredients: [
      { name: "Patinho moído refogado (peso pronto)", sector: "Açougue & Peixaria", grams: 120, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Batata inglesa cozida (para purê)", sector: "Hortifrúti", grams: 200, kcal100: 52, p100: 1.2, c100: 11.9, g100: 0.1, fib100: 1.3, scalable: true, isBatch: false, role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 120, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva (salada e refogado)", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Refogue o patinho moído com cebola, alho, tomate picado e cheiro-verde até dourar.",
      "Cozinhe a batata descascada e amasse com um pouco da água do cozimento, alho e sal.",
      "Sirva com a salada temperada com limão e fio de azeite."
    ],
    notes: "Patinho possui fator de cocção 1,35x na compra crua."
  },
  {
    id: "alm-frango-desfiado-batata",
    name: "Frango desfiado ao molho caseiro com batata-doce e brócolis",
    category: "principal",
    tags: ["frango"],
    freezable: true,
    prepTime: "35 min (rende lote)",
    thawNote: "Pode congelar o frango desfiado e a batata-doce juntos em marmitas.",
    ingredients: [
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 135, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Batata-doce cozida ou assada", sector: "Hortifrúti", grams: 160, kcal100: 77, p100: 0.6, c100: 18.4, g100: 0.1, fib100: 2.2, scalable: true, isBatch: true, role: "core" },
      { name: "Brócolis cozido", sector: "Hortifrúti", grams: 100, kcal100: 25, p100: 2.1, c100: 4.4, g100: 0.5, fib100: 3.4, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Cozinhe o peito de frango na pressão, desfie e refogue com tomate picado, cebola, alho e orégano.",
      "Asse a batata-doce em rodelas na airfryer ou forno e cozinhe os vegetais no vapor."
    ],
    notes: "A mesma base de frango desfiado pode ser aproveitada em lanches e tapiocas."
  },
  {
    id: "alm-tilapia-arroz",
    name: "Filé de tilápia assada com arroz, feijão preto e abobrinha",
    category: "principal",
    tags: ["peixe"],
    freezable: false,
    prepTime: "20 min",
    thawNote: "Peixe fica melhor grelhado ou assado na hora (12 min na airfryer).",
    ingredients: [
      { name: "Filé de tilápia assado", sector: "Açougue & Peixaria", grams: 150, kcal100: 128, p100: 26.0, c100: 0, g100: 2.7, fib100: 0, scalable: true, isBatch: false, rawFactor: 1.25, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 120, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Feijão preto cozido", sector: "Mercearia & Grãos", grams: 90, kcal100: 77, p100: 4.5, c100: 14.0, g100: 0.5, fib100: 8.4, scalable: true, isBatch: true, rawFactor: 0.35, role: "core" },
      { name: "Abobrinha grelhada", sector: "Hortifrúti", grams: 110, kcal100: 19, p100: 1.1, c100: 3.5, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Tempere os filés de tilápia com limão, alho, sal e ervas; asse por 12 minutos na airfryer a 200 °C.",
      "Grelhe a abobrinha em rodelas e sirva com arroz e feijão."
    ],
    notes: "Fator de cocção do peixe considerado em 1,25x na compra."
  },
  {
    id: "alm-strogonoff-fit",
    name: "Strogonoff leve de frango com arroz e batata assada",
    category: "principal",
    tags: ["frango", "lactose"],
    freezable: true,
    prepTime: "25 min (rende lote)",
    thawNote: "Congela muito bem por até 30 dias em potes individuais.",
    ingredients: [
      { name: "Peito de frango grelhado (peso pronto)", sector: "Açougue & Peixaria", grams: 130, kcal100: 159, p100: 32.0, c100: 0, g100: 2.5, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.30, role: "core" },
      { name: "Iogurte natural integral ou desnatado", sector: "Laticínios & Ovos", grams: 40, kcal100: 60, p100: 4.1, c100: 5.5, g100: 2.2, fib100: 0, scalable: false, isBatch: false, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 110, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Batata inglesa cozida (para purê)", sector: "Hortifrúti", grams: 100, kcal100: 52, p100: 1.2, c100: 11.9, g100: 0.1, fib100: 1.3, scalable: true, isBatch: false, role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 100, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Doure o peito de frango em cubos com alho e cebola, junte molho de tomate natural e desligue o fogo.",
      "Misture o iogurte natural para dar cremosidade (no lugar do creme de leite) e sirva com arroz e batata em cubos na airfryer."
    ],
    notes: "Versão leve do strogonoff com metade das gorduras da receita tradicional."
  },
  {
    id: "alm-escondidinho-patinho",
    name: "Escondidinho de patinho moído com batata-doce e salada",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "35 min (rende lote)",
    thawNote: "Excelente para montar em potes próprios para freezer e micro-ondas.",
    ingredients: [
      { name: "Patinho moído refogado (peso pronto)", sector: "Açougue & Peixaria", grams: 125, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Batata-doce cozida ou assada", sector: "Hortifrúti", grams: 170, kcal100: 77, p100: 0.6, c100: 18.4, g100: 0.1, fib100: 2.2, scalable: true, isBatch: true, role: "core" },
      { name: "Cenoura e chuchu refogados", sector: "Hortifrúti", grams: 110, kcal100: 28, p100: 0.9, c100: 6.1, g100: 0.1, fib100: 2.0, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Amasse a batata-doce cozida formando um purê rústico.",
      "Monte uma camada de patinho refogado e cubra com o purê de batata-doce; sirva com os legumes."
    ],
    notes: "Sem glúten e sem lactose, ótimo para marmitas congeladas."
  },
  {
    id: "alm-carne-panela-abobora",
    name: "Carne magra de panela desfiada com arroz, feijão e abóbora",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "40 min (panela de pressão)",
    thawNote: "A carne no próprio caldo congela sem ressecar.",
    ingredients: [
      { name: "Patinho em cubos cozido na pressão", sector: "Açougue & Peixaria", grams: 120, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 110, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Feijão carioca cozido", sector: "Mercearia & Grãos", grams: 90, kcal100: 76, p100: 4.8, c100: 13.6, g100: 0.5, fib100: 8.5, scalable: true, isBatch: true, rawFactor: 0.35, role: "core" },
      { name: "Abóbora cabotiá cozida", sector: "Hortifrúti", grams: 110, kcal100: 48, p100: 1.4, c100: 10.8, g100: 0.7, fib100: 2.5, scalable: true, isBatch: false, role: "veg" }
    ],
    steps: [
      "Sele os cubos de patinho na panela de pressão com cebola, alho, louro e tomate; cozinhe por 25 minutos após pegar pressão.",
      "Sirva a carne bem macia acompanhada de arroz, feijão e abóbora cabotiá cozida."
    ],
    notes: "Prato caseiro reconfortante e rico em ferro e proteínas."
  },
  {
    id: "alm-hamburguer-caseiro-arroz",
    name: "Hambúrguer caseiro de patinho na airfryer com arroz, feijão e salada",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "20 min (rende lote)",
    thawNote: "Congele os discos de hambúrguer crus ou assados separados por plástico.",
    ingredients: [
      { name: "Patinho moído refogado (peso pronto)", sector: "Açougue & Peixaria", grams: 130, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 120, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Feijão preto cozido", sector: "Mercearia & Grãos", grams: 90, kcal100: 77, p100: 4.5, c100: 14.0, g100: 0.5, fib100: 8.4, scalable: true, isBatch: true, rawFactor: 0.35, role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 120, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Tempere o patinho moído com sal, alho em pó e cheiro-verde, modele em formato de hambúrguer e grelhe na airfryer por 10 min.",
      "Sirva com arroz, feijão e salada fresca."
    ],
    notes: "Os hambúrgueres podem ser congelados prontos para aquecer em 4 minutos."
  },
  {
    id: "alm-frango-pure-abobora",
    name: "Cubos de frango dourados com purê de abóbora cabotiá e arroz",
    category: "principal",
    tags: ["frango"],
    freezable: true,
    prepTime: "25 min (rende lote)",
    thawNote: "Purê de cabotiá e frango em cubos congelam perfeitamente juntos.",
    ingredients: [
      { name: "Peito de frango grelhado (peso pronto)", sector: "Açougue & Peixaria", grams: 135, kcal100: 159, p100: 32.0, c100: 0, g100: 2.5, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.30, role: "core" },
      { name: "Abóbora cabotiá cozida", sector: "Hortifrúti", grams: 160, kcal100: 48, p100: 1.4, c100: 10.8, g100: 0.7, fib100: 2.5, scalable: true, isBatch: true, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 110, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Brócolis cozido", sector: "Hortifrúti", grams: 90, kcal100: 25, p100: 2.1, c100: 4.4, g100: 0.5, fib100: 3.4, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Grelhe o peito de frango em cubos temperados com cúrcuma, alho e limão.",
      "Amasse a abóbora cabotiá cozida com uma pitada de sal e sirva com o arroz e os vegetais."
    ],
    notes: "Refeição leve, colorida e de baixa densidade calórica."
  },
  {
    id: "alm-peixe-batata-doce",
    name: "Filé de tilápia grelhado com batata-doce assada e legumes",
    category: "principal",
    tags: ["peixe"],
    freezable: false,
    prepTime: "20 min",
    thawNote: "Preparo rápido na hora.",
    ingredients: [
      { name: "Filé de tilápia assado", sector: "Açougue & Peixaria", grams: 155, kcal100: 128, p100: 26.0, c100: 0, g100: 2.7, fib100: 0, scalable: true, isBatch: false, rawFactor: 1.25, role: "core" },
      { name: "Batata-doce cozida ou assada", sector: "Hortifrúti", grams: 170, kcal100: 77, p100: 0.6, c100: 18.4, g100: 0.1, fib100: 2.2, scalable: true, isBatch: true, role: "core" },
      { name: "Cenoura e vagem refogadas", sector: "Hortifrúti", grams: 110, kcal100: 38, p100: 1.4, c100: 8.2, g100: 0.2, fib100: 2.8, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Grelhe a tilápia em frigideira antiaderente com azeite, alho e limão por 4 minutos de cada lado.",
      "Sirva com a batata-doce assada e os legumes no vapor."
    ],
    notes: "Sem glúten e sem lactose, excelente para o jantar."
  },
  {
    id: "alm-omelete-arroz-feijao",
    name: "Omelete recheada de queijo minas com arroz, feijão e salada",
    category: "principal",
    tags: ["ovo", "lactose"],
    freezable: false,
    prepTime: "12 min",
    thawNote: "Arroz e feijão do lote; omelete feita na hora.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 150, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "3 unidades", role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 35, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 110, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Feijão carioca cozido", sector: "Mercearia & Grãos", grams: 90, kcal100: 76, p100: 4.8, c100: 13.6, g100: 0.5, fib100: 8.5, scalable: true, isBatch: true, rawFactor: 0.35, role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 110, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Bata os ovos com cheiro-verde e sal, despeje na frigideira quente e recheie com o queijo minas em cubos.",
      "Sirva com o arroz e o feijão aquecidos e salada fresca."
    ],
    notes: "Opção rápida sem carnes para variar o jantar."
  },
  {
    id: "alm-sanduiche-prato-frango",
    name: "Sanduíche quente de frango desfiado, queijo minas e salada grande",
    category: "principal",
    tags: ["frango", "gluten", "lactose"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Ótimo para substituir o jantar em dias corridos usando o frango do lote.",
    ingredients: [
      { name: "Pão de forma integral", sector: "Mercearia & Grãos", grams: 75, kcal100: 253, p100: 9.4, c100: 49.9, g100: 3.7, fib100: 6.9, scalable: true, isBatch: false, unitHint: "3 fatias", role: "core" },
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 120, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 35, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 120, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Monte o sanduíche com o frango desfiado aquecido e o queijo minas e doure na sanduicheira ou frigideira.",
      "Acompanhe com uma tigela caprichada de salada de alface e tomate."
    ],
    notes: "Jantar prático com os mesmos macros de uma refeição tradicional."
  },
  {
    id: "alm-almondega-patinho",
    name: "Almôndegas de patinho assadas ao molho de tomate com arroz e legumes",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "30 min (rende lote)",
    thawNote: "Congelar as almôndegas já assadas com o molho.",
    ingredients: [
      { name: "Patinho moído refogado (peso pronto)", sector: "Açougue & Peixaria", grams: 125, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 125, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Feijão carioca cozido", sector: "Mercearia & Grãos", grams: 80, kcal100: 76, p100: 4.8, c100: 13.6, g100: 0.5, fib100: 8.5, scalable: true, isBatch: true, rawFactor: 0.35, role: "core" },
      { name: "Abobrinha grelhada", sector: "Hortifrúti", grams: 100, kcal100: 19, p100: 1.1, c100: 3.5, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Modele bolinhas de patinho temperado com alho, cebola e ervas e asse na airfryer por 12 minutos.",
      "Aqueça com molho de tomate caseiro e sirva com arroz, feijão e abobrinha."
    ],
    notes: "Excelente opção para variar a forma de consumir carne moída magra."
  },
  {
    id: "alm-sopa-carne-batata",
    name: "Caldo nutritivo de carne magra com batata e legumes",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "30 min (rende lote)",
    thawNote: "Congela muito bem em potes para o jantar.",
    ingredients: [
      { name: "Patinho em cubos cozido na pressão", sector: "Açougue & Peixaria", grams: 120, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Batata inglesa cozida (para purê)", sector: "Hortifrúti", grams: 190, kcal100: 52, p100: 1.2, c100: 11.9, g100: 0.1, fib100: 1.3, scalable: true, isBatch: true, role: "core" },
      { name: "Cenoura e chuchu refogados", sector: "Hortifrúti", grams: 130, kcal100: 28, p100: 0.9, c100: 6.1, g100: 0.1, fib100: 2.0, scalable: false, isBatch: true, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Cozinhe o patinho em cubos na pressão com alho, cebola, batata e legumes até ficar bem macio.",
      "Amasse metade das batatas no próprio caldo para engrossar e finalize com salsinha."
    ],
    notes: "Refeição quente, leve e de fácil digestão para a noite."
  },
  {
    id: "alm-grao-bico-arroz",
    name: "Ensopado de grão-de-bico com arroz, abóbora e salada",
    category: "principal",
    tags: ["vegetariano"],
    freezable: true,
    prepTime: "35 min (rende lote)",
    thawNote: "O ensopado de grão-de-bico congela muito bem em potes.",
    ingredients: [
      { name: "Grão-de-bico cozido refogado", sector: "Mercearia & Grãos", grams: 160, kcal100: 164, p100: 8.9, c100: 27.4, g100: 2.6, fib100: 7.6, scalable: true, isBatch: true, rawFactor: 0.45, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 120, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Abóbora cabotiá cozida", sector: "Hortifrúti", grams: 120, kcal100: 48, p100: 1.4, c100: 10.8, g100: 0.7, fib100: 2.5, scalable: true, isBatch: false, role: "veg" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 100, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 6, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Deixe o grão-de-bico de molho por 8h, cozinhe na pressão por 15 min e refogue com tomate, cebola, alho e cominho.",
      "Sirva com arroz, abóbora cozida e salada temperada com azeite e limão."
    ],
    notes: "Opção 100% vegetal, sem glúten e sem lactose."
  },
  {
    id: "alm-lentilha-ovo",
    name: "Arroz com lentilha, ovos cozidos e legumes salteados",
    category: "principal",
    tags: ["vegetariano", "ovo"],
    freezable: false,
    prepTime: "25 min",
    thawNote: "Arroz e lentilha podem ser feitos em lote; ovos cozidos na hora.",
    ingredients: [
      { name: "Lentilha cozida", sector: "Mercearia & Grãos", grams: 140, kcal100: 93, p100: 6.3, c100: 16.3, g100: 0.5, fib100: 7.9, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 110, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40, role: "core" },
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "aprox. 2 unidades", role: "core" },
      { name: "Cenoura e chuchu refogados", sector: "Hortifrúti", grams: 110, kcal100: 28, p100: 0.9, c100: 6.1, g100: 0.1, fib100: 2.0, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Cozinhe a lentilha com louro e alho por cerca de 15 minutos e misture ao arroz.",
      "Sirva com os ovos cozidos (8 min após fervura) e legumes refogados."
    ],
    notes: "Estimativa: 2 ovos médios equivalem a 100g."
  },

  // ==================== LANCHES (10 OPÇÕES) ====================
  {
    id: "lan-fruta-castanha",
    name: "Maçã com mix de castanha-do-pará e amendoim",
    category: "lanche",
    tags: [],
    freezable: false,
    prepTime: "2 min",
    thawNote: "Pronto para consumo.",
    ingredients: [
      { name: "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, unitHint: "1 unidade média", role: "fruit" },
      { name: "Amendoim torrado sem sal / Castanha-do-pará", sector: "Mercearia & Grãos", grams: 20, kcal100: 606, p100: 22.0, c100: 15.0, g100: 53.0, fib100: 7.5, scalable: true, isBatch: false, role: "core" }
    ],
    steps: [
      "Lave a fruta e consuma acompanhada da porção medida de castanhas/amendoim."
    ],
    notes: "Sem glúten, sem lactose e prático para levar fora de casa."
  },
  {
    id: "lan-pao-pate-frango",
    name: "Sanduíche natural de frango desfiado com requeijão light",
    category: "lanche",
    tags: ["gluten", "lactose", "frango"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Usa a base de frango desfiado já cozida.",
    ingredients: [
      { name: "Pão de forma integral", sector: "Mercearia & Grãos", grams: 50, kcal100: 253, p100: 9.4, c100: 49.9, g100: 3.7, fib100: 6.9, scalable: true, isBatch: false, unitHint: "2 fatias", role: "core" },
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 60, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35, role: "core" },
      { name: "Requeijão cremoso light", sector: "Laticínios & Ovos", grams: 20, kcal100: 185, p100: 11.0, c100: 4.5, g100: 13.5, fib100: 0, scalable: false, estimated: true, role: "core" }
    ],
    steps: [
      "Misture o frango desfiado com o requeijão light, salsinha e uma pitada de sal.",
      "Recheie as duas fatias de pão integral."
    ],
    notes: "Estimativa: 1 colher de sopa rasa de requeijão light (20g)."
  },
  {
    id: "lan-banana-aveia",
    name: "Banana amassada com aveia em flocos e canela",
    category: "lanche",
    tags: [],
    freezable: false,
    prepTime: "3 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, unitHint: "1 unidade", role: "fruit" },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 25, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false, role: "core" }
    ],
    steps: [
      "Amasse a banana em um prato fundo, misture a aveia e polvilhe canela."
    ],
    notes: "Opção prática, econômica e sem lactose."
  },
  {
    id: "lan-iogurte-morango",
    name: "Iogurte natural com morangos e semente de chia",
    category: "lanche",
    tags: ["lactose"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Montagem na hora.",
    ingredients: [
      { name: "Iogurte natural integral ou desnatado", sector: "Laticínios & Ovos", grams: 170, kcal100: 60, p100: 4.1, c100: 5.5, g100: 2.2, fib100: 0, scalable: true, isBatch: false, unitHint: "1 pote", role: "core" },
      { name: "Morango fresco", sector: "Hortifrúti", grams: 100, kcal100: 30, p100: 0.9, c100: 6.8, g100: 0.3, fib100: 1.7, scalable: true, isBatch: false, role: "fruit" },
      { name: "Semente de chia", sector: "Mercearia & Grãos", grams: 10, kcal100: 486, p100: 16.5, c100: 42.1, g100: 30.7, fib100: 34.4, scalable: false, estimated: true }
    ],
    steps: [
      "Pique os morangos higienizados e misture com o iogurte e a chia."
    ],
    notes: "Estimativa: 1 colher de sopa rasa de chia (10g)."
  },
  {
    id: "lan-misto-integral",
    name: "Sanduíche quente de queijo minas com tomate e orégano",
    category: "lanche",
    tags: ["gluten", "lactose"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Pão de forma integral", sector: "Mercearia & Grãos", grams: 50, kcal100: 253, p100: 9.4, c100: 49.9, g100: 3.7, fib100: 6.9, scalable: true, isBatch: false, unitHint: "2 fatias", role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 40, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 50, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false, role: "veg" }
    ],
    steps: [
      "Recheie o pão integral com o queijo minas, rodelas de tomate e orégano e aqueça na sanduicheira."
    ],
    notes: "Lanche salgado prático e rico em cálcio e fibras."
  },
  {
    id: "lan-fruta-pasta-amendoim",
    name: "Maçã ou banana fatiada com pasta de amendoim integral",
    category: "lanche",
    tags: [],
    freezable: false,
    prepTime: "3 min",
    thawNote: "Pronto na hora.",
    ingredients: [
      { name: "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, role: "fruit" },
      { name: "Pasta de amendoim integral", sector: "Mercearia & Grãos", grams: 20, kcal100: 588, p100: 25.0, c100: 20.0, g100: 50.0, fib100: 6.0, scalable: true, isBatch: false, role: "core" }
    ],
    steps: [
      "Corte a fruta em fatias e sirva com a pasta de amendoim por cima."
    ],
    notes: "Sem glúten, sem lactose e ótimo controle de saciedade."
  },
  {
    id: "lan-ovos-cozidos-fruta",
    name: "Ovos cozidos temperados com azeite e porção de fruta",
    category: "lanche",
    tags: ["ovo"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Pode deixar os ovos cozidos na geladeira por até 2 dias.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "2 unidades", role: "core" },
      { name: "Mamão formosa", sector: "Hortifrúti", grams: 140, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false, role: "fruit" }
    ],
    steps: [
      "Cozinhe os ovos por 8 minutos, tempere com uma pitada de sal e orégano e acompanhe com a fruta."
    ],
    notes: "Lanche proteico sem glúten e sem lactose."
  },
  {
    id: "lan-mini-crepioca",
    name: "Mini crepioca de queijo minas e orégano",
    category: "lanche",
    tags: ["ovo", "lactose"],
    freezable: false,
    prepTime: "6 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 50, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "1 unidade", role: "core" },
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 30, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false, role: "core" },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 25, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false, role: "core" }
    ],
    steps: [
      "Bata o ovo com a tapioca e o queijo picado e doure na frigideira antiaderente."
    ],
    notes: "Sem glúten e alta saciedade para a tarde."
  }
];
