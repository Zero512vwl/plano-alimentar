// Banco de receitas brasileiras práticas (valores aproximados TACO / TBCA / USDA por 100g)
window.RECIPE_BANK = [
  // ==================== CAFÉ DA MANHÃ ====================
  {
    id: "cafe-pao-ovo",
    name: "Pão francês com ovos mexidos e mamão",
    category: "cafe",
    tags: ["gluten", "ovo"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Pão francês", sector: "Mercearia & Grãos", grams: 50, kcal100: 300, p100: 8.0, c100: 58.6, g100: 3.1, fib100: 2.3, scalable: true, isBatch: false },
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "aprox. 2 unidades" },
      { name: "Mamão formosa", sector: "Hortifrúti", grams: 150, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false },
      { name: "Azeite de oliva (1 fio para untar)", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Aqueça uma frigideira antiaderente com um fio fino de azeite e mexa os ovos em fogo baixo com uma pitada de sal.",
      "Sirva os ovos dentro ou ao lado do pão francês e acompanhe com o mamão picado."
    ],
    notes: "Estimativa: 1 ovo médio considerado com 50g e 1 fio de azeite com 4g."
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
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 70, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false },
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 60, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35 },
      { name: "Queijo minas frescal", sector: "Laticínios & Ovos", grams: 30, kcal100: 264, p100: 17.4, c100: 3.2, g100: 20.2, fib100: 0, scalable: true, isBatch: false },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, unitHint: "1 unidade média" }
    ],
    steps: [
      "Espalhe a goma de tapioca na frigideira quente até formar o disco.",
      "Recheie com o frango desfiado aquecido e o queijo minas, dobre ao meio e sirva com a banana."
    ],
    notes: "Reaproveita a mesma base de frango desfiado do almoço/jantar (fator cru/cozido 1,35x na compra)."
  },
  {
    id: "cafe-tapioca-ovo",
    name: "Tapioca com ovos mexidos e mamão",
    category: "cafe",
    tags: ["ovo"],
    freezable: false,
    prepTime: "10 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Goma de tapioca hidratada", sector: "Mercearia & Grãos", grams: 70, kcal100: 240, p100: 0.2, c100: 59.6, g100: 0, fib100: 0.5, scalable: true, isBatch: false },
      { name: "Ovo de galinha inteiro", sector: "Laticínios & Ovos", grams: 100, kcal100: 143, p100: 13.0, c100: 1.6, g100: 8.9, fib100: 0, scalable: true, isBatch: false, unitHint: "aprox. 2 unidades" },
      { name: "Mamão formosa", sector: "Hortifrúti", grams: 150, kcal100: 45, p100: 0.8, c100: 11.6, g100: 0.1, fib100: 1.8, scalable: true, isBatch: false }
    ],
    steps: [
      "Prepare os ovos mexidos em frigideira antiaderente.",
      "Grelhe a tapioca até firmar, recheie com os ovos e sirva com o mamão."
    ],
    notes: "Opção naturalmente sem glúten e sem lactose."
  },
  {
    id: "cafe-iogurte-aveia",
    name: "Iogurte natural com aveia, chia e banana",
    category: "cafe",
    tags: ["lactose"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Montagem rápida na hora.",
    ingredients: [
      { name: "Iogurte natural integral ou desnatado", sector: "Laticínios & Ovos", grams: 170, kcal100: 60, p100: 4.1, c100: 5.5, g100: 2.2, fib100: 0, scalable: true, isBatch: false, unitHint: "1 pote padrão" },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 30, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false },
      { name: "Semente de chia", sector: "Mercearia & Grãos", grams: 10, kcal100: 486, p100: 16.5, c100: 42.1, g100: 30.7, fib100: 34.4, scalable: false, estimated: true },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false }
    ],
    steps: [
      "Misture o iogurte com a aveia e a chia em uma tigela.",
      "Finalize com a banana picada e canela em pó a gosto."
    ],
    notes: "Estimativa: 1 colher de sopa rasa de chia considerada com 10g."
  },
  {
    id: "cafe-aveia-vegetal",
    name: "Vitamina de aveia, banana, pasta de amendoim e leite vegetal",
    category: "cafe",
    tags: [],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Bater na hora.",
    ingredients: [
      { name: "Bebida de soja sem açúcar (ou leite vegetal)", sector: "Mercearia & Grãos", grams: 250, kcal100: 40, p100: 3.3, c100: 2.0, g100: 2.0, fib100: 0.4, scalable: true, isBatch: false },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 40, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false },
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false },
      { name: "Pasta de amendoim integral", sector: "Mercearia & Grãos", grams: 20, kcal100: 588, p100: 25.0, c100: 20.0, g100: 50.0, fib100: 6.0, scalable: true, isBatch: false }
    ],
    steps: [
      "Bata todos os ingredientes no liquidificador com gelo opcional até ficar cremoso."
    ],
    notes: "Opção sem lactose, sem ovo e sem glúten (use aveia certificada se houver doença celíaca)."
  },

  // ==================== ALMOÇO & JANTAR ====================
  {
    id: "alm-frango-arroz-feijao",
    name: "Frango grelhado com arroz, feijão carioca e legumes",
    category: "principal",
    tags: ["frango"],
    freezable: true,
    prepTime: "30 min (rende lote)",
    thawNote: "Descongelar na geladeira na noite anterior e aquecer no micro-ondas ou frigideira.",
    ingredients: [
      { name: "Peito de frango grelhado (peso pronto)", sector: "Açougue & Peixaria", grams: 130, kcal100: 159, p100: 32.0, c100: 0, g100: 2.5, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.30 },
      { name: "Arroz branco cozido", sector: "Mercearia & Grãos", grams: 130, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40 },
      { name: "Feijão carioca cozido (grão + caldo)", sector: "Mercearia & Grãos", grams: 100, kcal100: 76, p100: 4.8, c100: 13.6, g100: 0.5, fib100: 8.5, scalable: true, isBatch: true, rawFactor: 0.35 },
      { name: "Cenoura e vagem refogadas", sector: "Hortifrúti", grams: 100, kcal100: 38, p100: 1.4, c100: 8.2, g100: 0.2, fib100: 2.8, scalable: false, isBatch: false },
      { name: "Azeite de oliva (preparo)", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Tempere o peito de frango em filés com alho, limão, páprica e sal; grelhe em lote na frigideira ou airfryer.",
      "Cozinhe o feijão em lote e congele em potes individuais; prepare os legumes no vapor ou salteados.",
      "Monte as marmitas com arroz, feijão, frango e legumes."
    ],
    notes: "Compra em peso cru usa fator de rendimento (frango 1,30x; arroz 0,40x; feijão 0,35x). Azeite estimado em 5g."
  },
  {
    id: "alm-patinho-pure",
    name: "Patinho moído refogado com purê de batata e salada",
    category: "principal",
    tags: ["carne_vermelha"],
    freezable: true,
    prepTime: "30 min (rende lote)",
    thawNote: "Congelar apenas a carne moída em porções; o purê e a salada ficam melhores frescos.",
    ingredients: [
      { name: "Patinho moído refogado (peso pronto)", sector: "Açougue & Peixaria", grams: 120, kcal100: 219, p100: 35.9, c100: 0, g100: 7.3, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35 },
      { name: "Batata inglesa cozida (para purê)", sector: "Hortifrúti", grams: 200, kcal100: 52, p100: 1.2, c100: 11.9, g100: 0.1, fib100: 1.3, scalable: true, isBatch: false },
      { name: "Tomate e alface (salada)", sector: "Hortifrúti", grams: 120, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false },
      { name: "Azeite de oliva (salada e refogado)", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Refogue o patinho moído com cebola, alho, tomate picado e cheiro-verde até secar bem o excesso de líquido.",
      "Cozinhe a batata descascada e amasse com um pouco da própria água do cozimento e uma pitada de sal (sem precisar de manteiga).",
      "Sirva com salada fresca temperada com limão e fio de azeite."
    ],
    notes: "Patinho possui fator de cocção 1,35x na compra crua. Azeite estimado em 5g."
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
      { name: "Frango desfiado ao molho de tomate (pronto)", sector: "Açougue & Peixaria", grams: 140, kcal100: 155, p100: 27.0, c100: 3.0, g100: 3.4, fib100: 0.5, scalable: true, isBatch: true, rawFactor: 1.35 },
      { name: "Batata-doce cozida ou assada", sector: "Hortifrúti", grams: 160, kcal100: 77, p100: 0.6, c100: 18.4, g100: 0.1, fib100: 2.2, scalable: true, isBatch: true },
      { name: "Brócolis cozido", sector: "Hortifrúti", grams: 100, kcal100: 25, p100: 2.1, c100: 4.4, g100: 0.5, fib100: 3.4, scalable: false, isBatch: false },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 4, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Cozinhe o peito de frango na pressão, desfie e refogue com tomate pelado ou extrato de tomate natural, cebola e orégano.",
      "Asse a batata-doce em rodelas na airfryer ou forno e cozinhe o brócolis rapidamente no vapor."
    ],
    notes: "A mesma base de frango desfiado pode ser usada no café da manhã ou lanche."
  },
  {
    id: "alm-tilapia-arroz",
    name: "Filé de tilápia assada com arroz, feijão preto e abobrinha",
    category: "principal",
    tags: ["peixe"],
    freezable: false,
    prepTime: "20 min",
    thawNote: "Peixe fica melhor preparado na hora (leva 12 min na airfryer).",
    ingredients: [
      { name: "Filé de tilápia assado", sector: "Açougue & Peixaria", grams: 150, kcal100: 128, p100: 26.0, c100: 0, g100: 2.7, fib100: 0, scalable: true, isBatch: false, rawFactor: 1.25 },
      { name: "Arroz branco ou integral cozido", sector: "Mercearia & Grãos", grams: 120, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40 },
      { name: "Feijão preto cozido", sector: "Mercearia & Grãos", grams: 90, kcal100: 77, p100: 4.5, c100: 14.0, g100: 0.5, fib100: 8.4, scalable: true, isBatch: true, rawFactor: 0.35 },
      { name: "Abobrinha grelhada", sector: "Hortifrúti", grams: 110, kcal100: 19, p100: 1.1, c100: 3.5, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 5, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
    ],
    steps: [
      "Tempere os filés de tilápia com limão, alho, sal e ervas; asse por 12 minutos na airfryer ou forno a 200 °C.",
      "Grelhe rodelas de abobrinha na frigideira e sirva com arroz e feijão aquecidos."
    ],
    notes: "Fator de cocção do peixe considerado em 1,25x na compra."
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
      { name: "Grão-de-bico cozido refogado", sector: "Mercearia & Grãos", grams: 160, kcal100: 164, p100: 8.9, c100: 27.4, g100: 2.6, fib100: 7.6, scalable: true, isBatch: true, rawFactor: 0.45 },
      { name: "Arroz integral ou branco cozido", sector: "Mercearia & Grãos", grams: 120, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40 },
      { name: "Abóbora cabotiá cozida", sector: "Hortifrúti", grams: 120, kcal100: 48, p100: 1.4, c100: 10.8, g100: 0.7, fib100: 2.5, scalable: true, isBatch: false },
      { name: "Salada de folhas verdes e tomate", sector: "Hortifrúti", grams: 100, kcal100: 16, p100: 1.0, c100: 3.1, g100: 0.2, fib100: 1.4, scalable: false, isBatch: false },
      { name: "Azeite de oliva", sector: "Temperos / Conferir em Casa", grams: 7, kcal100: 884, p100: 0, c100: 0, g100: 100, fib100: 0, scalable: false, estimated: true, isBatch: false }
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
    thawNote: "Arroz e lentilha podem ser feitos em lote; ovos cozidos na hora ou para 2 dias.",
    ingredients: [
      { name: "Lentilha cozida", sector: "Mercearia & Grãos", grams: 140, kcal100: 93, p100: 6.3, c100: 16.3, g100: 0.5, fib100: 7.9, scalable: true, isBatch: true, rawFactor: 0.40 },
      { name: "Arroz cozido", sector: "Mercearia & Grãos", grams: 110, kcal100: 128, p100: 2.5, c100: 28.1, g100: 0.2, fib100: 1.6, scalable: true, isBatch: true, rawFactor: 0.40 },
      { name: "Ovo de galinha cozido", sector: "Laticínios & Ovos", grams: 100, kcal100: 146, p100: 13.3, c100: 0.6, g100: 9.5, fib100: 0, scalable: true, isBatch: false, unitHint: "aprox. 2 unidades" },
      { name: "Cenoura e chuchu refogados", sector: "Hortifrúti", grams: 110, kcal100: 28, p100: 0.9, c100: 6.1, g100: 0.1, fib100: 2.0, scalable: false, isBatch: false }
    ],
    steps: [
      "Cozinhe a lentilha com louro e alho por cerca de 15 minutos e misture ao arroz.",
      "Sirva com os ovos cozidos (8 min após fervura) e legumes refogados."
    ],
    notes: "Estimativa: 2 ovos médios equivalem a 100g."
  },

  // ==================== LANCHES ====================
  {
    id: "lan-fruta-castanha",
    name: "Maçã com mix de castanha-do-pará e amendoim",
    category: "lanche",
    tags: [],
    freezable: false,
    prepTime: "2 min",
    thawNote: "Pronto para consumo.",
    ingredients: [
      { name: "Maçã fuji", sector: "Hortifrúti", grams: 130, kcal100: 56, p100: 0.3, c100: 15.2, g100: 0, fib100: 1.3, scalable: true, isBatch: false, unitHint: "1 unidade média" },
      { name: "Amendoim torrado sem sal / Castanha-do-pará", sector: "Mercearia & Grãos", grams: 20, kcal100: 606, p100: 22.0, c100: 15.0, g100: 53.0, fib100: 7.5, scalable: true, isBatch: false }
    ],
    steps: [
      "Lave a maçã e consuma acompanhada da porção medida de castanhas/amendoim."
    ],
    notes: "Sem glúten, sem lactose e prático para levar fora de casa."
  },
  {
    id: "lan-pao-pate-frango",
    name: "Sanduíche rápido de frango desfiado com requeijão light",
    category: "lanche",
    tags: ["gluten", "lactose", "frango"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Usa a base de frango desfiado já cozida.",
    ingredients: [
      { name: "Pão de forma integral", sector: "Mercearia & Grãos", grams: 50, kcal100: 253, p100: 9.4, c100: 49.9, g100: 3.7, fib100: 6.9, scalable: true, isBatch: false, unitHint: "2 fatias" },
      { name: "Frango desfiado cozido (base lote)", sector: "Açougue & Peixaria", grams: 60, kcal100: 163, p100: 31.0, c100: 0, g100: 3.6, fib100: 0, scalable: true, isBatch: true, rawFactor: 1.35 },
      { name: "Requeijão cremoso light", sector: "Laticínios & Ovos", grams: 20, kcal100: 185, p100: 11.0, c100: 4.5, g100: 13.5, fib100: 0, scalable: false, estimated: true }
    ],
    steps: [
      "Misture o frango desfiado com o requeijão light, salsinha e uma pitada de sal.",
      "Recheie as duas fatias de pão integral."
    ],
    notes: "Estimativa: 1 colher de sopa rasa de requeijão light (20g)."
  },
  {
    id: "lan-banana-aveia",
    name: "Banana amassada com aveia e canela",
    category: "lanche",
    tags: [],
    freezable: false,
    prepTime: "3 min",
    thawNote: "Preparo na hora.",
    ingredients: [
      { name: "Banana prata", sector: "Hortifrúti", grams: 90, kcal100: 98, p100: 1.3, c100: 26.0, g100: 0.1, fib100: 2.0, scalable: true, isBatch: false, unitHint: "1 unidade" },
      { name: "Aveia em flocos", sector: "Mercearia & Grãos", grams: 25, kcal100: 394, p100: 13.9, c100: 66.6, g100: 8.5, fib100: 9.1, scalable: true, isBatch: false }
    ],
    steps: [
      "Amasse a banana em um prato fundo, misture a aveia e polvilhe canela."
    ],
    notes: "Opção prática, econômica e sem lactose."
  },
  {
    id: "lan-iogurte-morango",
    name: "Iogurte natural com morangos e chia",
    category: "lanche",
    tags: ["lactose"],
    freezable: false,
    prepTime: "5 min",
    thawNote: "Montagem na hora.",
    ingredients: [
      { name: "Iogurte natural", sector: "Laticínios & Ovos", grams: 170, kcal100: 60, p100: 4.1, c100: 5.5, g100: 2.2, fib100: 0, scalable: true, isBatch: false, unitHint: "1 pote" },
      { name: "Morango fresco", sector: "Hortifrúti", grams: 100, kcal100: 30, p100: 0.9, c100: 6.8, g100: 0.3, fib100: 1.7, scalable: true, isBatch: false },
      { name: "Semente de chia", sector: "Mercearia & Grãos", grams: 10, kcal100: 486, p100: 16.5, c100: 42.1, g100: 30.7, fib100: 34.4, scalable: false, estimated: true }
    ],
    steps: [
      "Pique os morangos higienizados e misture com o iogurte e a chia."
    ],
    notes: "Estimativa: 1 colher de sopa rasa de chia (10g)."
  }
];
