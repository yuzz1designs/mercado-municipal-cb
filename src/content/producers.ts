import { unsplash, type PhotoAsset } from './home'

/*
 * Businesses selling at the market.
 * PLACEHOLDER content: names, people and descriptions are fictional and must be
 * replaced by the market's real list. Places are real localities of the region.
 */

export const categories = [
  { id: 'frescos', label: 'Frutas e legumes' },
  { id: 'queijos', label: 'Queijos' },
  { id: 'fumeiro', label: 'Fumeiro' },
  { id: 'talho', label: 'Talho' },
  { id: 'peixe', label: 'Peixe' },
  { id: 'pao', label: 'Pão e doçaria' },
  { id: 'mel', label: 'Mel' },
  { id: 'azeite', label: 'Azeite' },
  { id: 'flores', label: 'Flores e ervas' },
] as const

export type CategoryId = (typeof categories)[number]['id']

export type ProducerProduct = {
  name: string
  /** Sales unit shown with the quantity, e.g. 'kg', 'un.', 'frasco 500 g' */
  unit: string
  /** Quantity step when ordering (default 1) */
  step?: number
}

export type Producer = {
  id: string
  name: string
  owner: string
  /** Sells what they make or grow, or resells */
  kind: 'produtor' | 'comerciante'
  category: CategoryId
  /** Stall number on the market floor (1–24) */
  stall: number
  origin: string
  since: number
  days: string
  description: string
  products: ProducerProduct[]
  image: PhotoAsset
}

/** Producers featured in the carousel between the intro and the directory (by id). */
export const featured = {
  label: 'Produtor em destaque',
  ids: [
    'horta-da-lardosa',
    'queijaria-da-gardunha',
    'fumeiro-das-sarzedas',
    'forno-velho',
    'mel-da-charneca',
    'lagar-do-ocreza',
  ],
}

/** Number of stalls on the market floor, shown in the stall plan. */
export const STALLS = 24

export const producers: Producer[] = [
  {
    id: 'horta-da-lardosa',
    name: 'Horta da Lardosa',
    owner: 'Maria do Céu Antunes',
    kind: 'produtor',
    category: 'frescos',
    stall: 3,
    origin: 'Lardosa',
    since: 1994,
    days: 'Terça a sábado',
    description:
      'Legumes da época colhidos na véspera, numa horta familiar que passou de mãe para filha. Sem estufas: o que há na banca é o que a terra dá naquela semana.',
    products: [
      { name: 'Alface', unit: 'un.' },
      { name: 'Tomate', unit: 'kg', step: 0.5 },
      { name: 'Couve', unit: 'un.' },
      { name: 'Abóbora', unit: 'kg', step: 0.5 },
      { name: 'Feijão-verde', unit: 'kg', step: 0.5 },
    ],
    image: unsplash('photo-1591586116988-62fe65164f8d', 'Legumes frescos numa banca'),
  },
  {
    id: 'quinta-do-ribeiro-seco',
    name: 'Quinta do Ribeiro Seco',
    owner: 'João e Ana Pires',
    kind: 'produtor',
    category: 'frescos',
    stall: 4,
    origin: 'Escalos de Baixo',
    since: 2009,
    days: 'Quarta a sábado',
    description:
      'Fruta de pomares de sequeiro: cereja no fim da primavera, pêssego e figo no verão, marmelo e romã no outono.',
    products: [
      { name: 'Cereja', unit: 'kg', step: 0.5 },
      { name: 'Pêssego', unit: 'kg', step: 0.5 },
      { name: 'Figo', unit: 'kg', step: 0.5 },
      { name: 'Marmelo', unit: 'kg', step: 0.5 },
      { name: 'Romã', unit: 'un.' },
    ],
    image: unsplash('photo-1635341814161-d696d538542c', 'Figos frescos sobre uma mesa'),
  },
  {
    id: 'pomar-de-alcains',
    name: 'Pomar de Alcains',
    owner: 'Rui Matos',
    kind: 'produtor',
    category: 'frescos',
    stall: 5,
    origin: 'Alcains',
    since: 2016,
    days: 'Terça, quinta e sábado',
    description: 'Citrinos e fruta de inverno de um pomar recuperado pela terceira geração da família.',
    products: [
      { name: 'Laranja', unit: 'kg', step: 0.5 },
      { name: 'Tangerina', unit: 'kg', step: 0.5 },
      { name: 'Limão', unit: 'kg', step: 0.5 },
      { name: 'Kiwi', unit: 'kg', step: 0.5 },
    ],
    image: unsplash('photo-1652037255133-84dd4ed0f9a3', 'Caixa de laranjas'),
  },
  {
    id: 'frutas-rosa',
    name: 'Frutas Rosa & Filhos',
    owner: 'Fernanda Rosa',
    kind: 'comerciante',
    category: 'frescos',
    stall: 7,
    origin: 'Castelo Branco',
    since: 1987,
    days: 'Terça a sábado',
    description:
      'A banca mais antiga do mercado. Fruta e legumes de produtores da região e, quando não há cá, do melhor que se encontra.',
    products: [
      { name: 'Fruta da época', unit: 'kg', step: 0.5 },
      { name: 'Legumes', unit: 'kg', step: 0.5 },
      { name: 'Frutos secos', unit: 'saco 250 g' },
      { name: 'Abóboras', unit: 'kg', step: 0.5 },
    ],
    image: unsplash('photo-1633529141777-3428e2a736a7', 'Abóboras numa caixa de madeira'),
  },
  {
    id: 'queijaria-da-gardunha',
    name: 'Queijaria da Gardunha',
    owner: 'Manuel Teixeira',
    kind: 'produtor',
    category: 'queijos',
    stall: 10,
    origin: 'São Vicente da Beira',
    since: 1998,
    days: 'Terça a sábado',
    description:
      'Queijo de ovelha e de cabra feito com leite do próprio rebanho, curado em adega de pedra na encosta da serra.',
    products: [
      { name: 'Queijo de ovelha', unit: 'un.' },
      { name: 'Queijo de cabra', unit: 'un.' },
      { name: 'Requeijão', unit: 'un.' },
      { name: 'Queijo amarelo', unit: 'un.' },
    ],
    image: unsplash('photo-1634925353703-451b16b6d1a8', 'Queijos curados numa prateleira'),
  },
  {
    id: 'queijos-do-ponsul',
    name: 'Queijos do Ponsul',
    owner: 'Helena Caldeira',
    kind: 'produtor',
    category: 'queijos',
    stall: 11,
    origin: 'Malpica do Tejo',
    since: 2012,
    days: 'Quinta a sábado',
    description: 'Pequena queijaria junto ao rio Ponsul. Queijo picante e amanteigado, feito à mão, em pequenas fornadas.',
    products: [
      { name: 'Queijo picante', unit: 'un.' },
      { name: 'Queijo amanteigado', unit: 'un.' },
      { name: 'Travia', unit: 'un.' },
    ],
    image: unsplash('photo-1752401984776-edc407a13e1e', 'Queijos numa banca de mercado'),
  },
  {
    id: 'fumeiro-das-sarzedas',
    name: 'Fumeiro das Sarzedas',
    owner: 'António Lourenço',
    kind: 'produtor',
    category: 'fumeiro',
    stall: 13,
    origin: 'Sarzedas',
    since: 2003,
    days: 'Terça a sábado',
    description:
      'Enchidos de porco criado ao ar livre, fumados lentamente com lenha de azinho. A época forte começa com o frio.',
    products: [
      { name: 'Chouriço', unit: 'un.' },
      { name: 'Farinheira', unit: 'un.' },
      { name: 'Morcela', unit: 'un.' },
      { name: 'Paio', unit: 'un.' },
      { name: 'Presunto', unit: 'kg', step: 0.5 },
    ],
    image: unsplash('photo-1688895061981-4f7b10d4e4da', 'Enchidos a curar pendurados'),
  },
  {
    id: 'talho-central',
    name: 'Talho Central',
    owner: 'Paulo e Sérgio Nunes',
    kind: 'comerciante',
    category: 'talho',
    stall: 15,
    origin: 'Castelo Branco',
    since: 1979,
    days: 'Terça a sábado',
    description: 'Carne de produtores da Beira Baixa, cortada ao balcão e à medida. Borrego e cabrito da região por encomenda.',
    products: [
      { name: 'Borrego', unit: 'kg', step: 0.5 },
      { name: 'Cabrito', unit: 'kg', step: 0.5 },
      { name: 'Vitela', unit: 'kg', step: 0.5 },
      { name: 'Porco', unit: 'kg', step: 0.5 },
      { name: 'Aves', unit: 'kg', step: 0.5 },
    ],
    image: unsplash('photo-1625643269470-5d3e7b69fa34', 'Carne no balcão de um talho'),
  },
  {
    id: 'peixaria-do-tejo',
    name: 'Peixaria do Tejo',
    owner: 'Cláudia Martins',
    kind: 'comerciante',
    category: 'peixe',
    stall: 18,
    origin: 'Vila Velha de Ródão',
    since: 2001,
    days: 'Terça e sexta',
    description: 'Peixe fresco que chega de madrugada nos dias de lota, e peixe do rio na época.',
    products: [
      { name: 'Sardinha', unit: 'kg', step: 0.5 },
      { name: 'Dourada', unit: 'un.' },
      { name: 'Bacalhau', unit: 'kg', step: 0.5 },
      { name: 'Peixe do rio', unit: 'kg', step: 0.5 },
    ],
    image: unsplash('photo-1611214774777-3d997a9d0e35', 'Peixe fresco sobre gelo'),
  },
  {
    id: 'forno-velho',
    name: 'Padaria Forno Velho',
    owner: 'Luísa e Carlos Simões',
    kind: 'produtor',
    category: 'pao',
    stall: 20,
    origin: 'Alcains',
    since: 1991,
    days: 'Terça a domingo',
    description: 'Pão de forno a lenha, cozido de madrugada: centeio, trigo e broa. Ao sábado há bolo de azeite.',
    products: [
      { name: 'Pão de centeio', unit: 'un.' },
      { name: 'Broa', unit: 'un.' },
      { name: 'Pão de trigo', unit: 'un.' },
      { name: 'Bolo de azeite', unit: 'un.' },
    ],
    image: unsplash('photo-1549413468-cd78edb7e75c', 'Pão de forno sobre um pano de juta'),
  },
  {
    id: 'docaria-da-avo-lurdes',
    name: 'Doçaria da Avó Lurdes',
    owner: 'Lurdes Gaspar',
    kind: 'produtor',
    category: 'pao',
    stall: 21,
    origin: 'Castelo Branco',
    since: 2018,
    days: 'Quinta a domingo',
    description: 'Doces conventuais e tradicionais da Beira Baixa, feitos em pequenas quantidades e vendidos no próprio dia.',
    products: [
      { name: 'Tigeladas', unit: 'caixa 6 un.' },
      { name: 'Broas de mel', unit: 'dúzia' },
      { name: 'Biscoitos', unit: 'saco 250 g' },
      { name: 'Bolo de mel', unit: 'un.' },
    ],
    image: unsplash('photo-1711672284661-bd70e38f31b2', 'Montra de doçaria'),
  },
  {
    id: 'mel-da-charneca',
    name: 'Mel da Charneca',
    owner: 'Tiago Moreira',
    kind: 'produtor',
    category: 'mel',
    stall: 22,
    origin: 'Idanha-a-Nova',
    since: 2010,
    days: 'Sexta e sábado',
    description: 'Colmeias espalhadas pela charneca de rosmaninho e esteva. Mel cru, extraído a frio.',
    products: [
      { name: 'Mel de rosmaninho', unit: 'frasco 500 g' },
      { name: 'Mel multifloral', unit: 'frasco 500 g' },
      { name: 'Pólen', unit: 'frasco 250 g' },
      { name: 'Própolis', unit: 'frasco 30 ml' },
    ],
    image: unsplash('photo-1587049352851-8d4e89133924', 'Frasco de mel'),
  },
  {
    id: 'apicultura-de-penamacor',
    name: 'Apicultura de Penamacor',
    owner: 'Inês Barata',
    kind: 'produtor',
    category: 'mel',
    stall: 23,
    origin: 'Penamacor',
    since: 2015,
    days: 'Sábado',
    description: 'Mel de urze e castanheiro da serra, favos inteiros e velas de cera de abelha.',
    products: [
      { name: 'Mel de urze', unit: 'frasco 500 g' },
      { name: 'Mel de castanheiro', unit: 'frasco 500 g' },
      { name: 'Favos', unit: 'un.' },
      { name: 'Velas de cera', unit: 'un.' },
    ],
    image: unsplash('photo-1623018697148-8350cf18e64e', 'Favo de mel'),
  },
  {
    id: 'lagar-do-ocreza',
    name: 'Lagar do Ocreza',
    owner: 'Francisco Dias',
    kind: 'produtor',
    category: 'azeite',
    stall: 24,
    origin: 'Proença-a-Nova',
    since: 1996,
    days: 'Terça a sábado',
    description: 'Azeite de olivais antigos junto à ribeira, prensado no lagar da família. Azeite novo a partir de novembro.',
    products: [
      { name: 'Azeite virgem extra', unit: 'garrafa 75 cl' },
      { name: 'Azeitonas', unit: 'frasco 500 g' },
      { name: 'Azeite novo', unit: 'garrafa 75 cl' },
    ],
    image: unsplash('photo-1474979266404-7eaacbcd87c5', 'Azeite numa garrafa de vidro'),
  },
  {
    id: 'flores-da-ribeira',
    name: 'Flores da Ribeira',
    owner: 'Sara Cardoso',
    kind: 'produtor',
    category: 'flores',
    stall: 1,
    origin: 'Castelo Branco',
    since: 2020,
    days: 'Quinta a sábado',
    description: 'Flores de corte cultivadas sem químicos, ramos da época e plantas para varanda e horta.',
    products: [
      { name: 'Flores de corte', unit: 'molho' },
      { name: 'Ramos', unit: 'un.' },
      { name: 'Plantas aromáticas', unit: 'vaso' },
      { name: 'Plantas de horta', unit: 'tabuleiro' },
    ],
    image: unsplash('photo-1600104197373-c07cc35e4f61', 'Flores num cesto de verga'),
  },
  {
    id: 'ervas-da-beira',
    name: 'Ervas & Chás da Beira',
    owner: 'Rosa Ventura',
    kind: 'produtor',
    category: 'flores',
    stall: 2,
    origin: 'Monforte da Beira',
    since: 2014,
    days: 'Terça a sábado',
    description: 'Ervas aromáticas frescas e secas, chás e infusões de plantas colhidas na serra.',
    products: [
      { name: 'Poejo', unit: 'molho' },
      { name: 'Hortelã', unit: 'molho' },
      { name: 'Tomilho', unit: 'molho' },
      { name: 'Chás de ervas', unit: 'saco 50 g' },
      { name: 'Rosmaninho', unit: 'molho' },
    ],
    image: unsplash('photo-1551772413-6c1b7dc18548', 'Ervas e legumes de folha'),
  },
]
