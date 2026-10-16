import marketPanorama from '../assets/images/market-panorama.svg'
import azeite from '../assets/images/products/azeite.svg'
import cereja from '../assets/images/products/cereja.svg'
import enchidos from '../assets/images/products/enchidos.svg'
import mel from '../assets/images/products/mel.svg'
import pao from '../assets/images/products/pao.svg'
import queijos from '../assets/images/products/queijos.svg'

export type PhotoAsset = {
  src: string
  alt: string
  /** Focal point used as object-position, e.g. '50% 40%'. */
  focus?: string
}

export type NewsItem = {
  title: string
  /** One sentence, shown on hover */
  excerpt: string
  category: string
  /** ISO date, e.g. '2026-10-08' */
  date: string
  href: string
  image: PhotoAsset
}

export type Spot = {
  label: string
  title: string[]
  text: string
  /** Position on the panorama, in % of its width / height. */
  x: string
  y: string
  /** Which side of the point the card opens towards. */
  side: 'left' | 'right'
}

/* Product photography, shared by the Hero slider and the products showcase */
const photos = {
  queijos: { src: queijos, alt: 'Queijos curados sobre uma tábua de madeira' },
  azeite: { src: azeite, alt: 'Garrafa de azeite com azeitonas e um ramo de oliveira' },
  cereja: { src: cereja, alt: 'Taça de cerejas frescas' },
  enchidos: { src: enchidos, alt: 'Enchidos a curar pendurados' },
  mel: { src: mel, alt: 'Frasco de mel sobre favos' },
  pao: { src: pao, alt: 'Pães de forno sobre um pano de linho' },
} satisfies Record<string, PhotoAsset>

/*
 * Provisional copy and imagery for the Home entrance.
 * Swap the placeholders by dropping real photos in src/assets/images
 * and updating the imports above.
 */
export const welcome = {
  title: ['Mercado', 'Municipal'],
  place: 'Castelo Branco',
  region: 'Beira Baixa',
  cue: 'Deslize para entrar',
}

/*
 * Temporary real photography for the news slider (Unsplash, free licence),
 * loaded from Unsplash's CDN. Replace with the market's own photos.
 */
export const unsplash = (id: string, alt: string, width = 900): PhotoAsset => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`,
  alt,
})

const newsPhotos = {
  banca: unsplash('photo-1591586116988-62fe65164f8d', 'Legumes frescos numa banca de mercado'),
  queijos: unsplash('photo-1634925353703-451b16b6d1a8', 'Queijos curados numa prateleira'),
  azeite: unsplash('photo-1474979266404-7eaacbcd87c5', 'Azeite numa garrafa de vidro'),
  pao: unsplash('photo-1549413468-cd78edb7e75c', 'Pão de forno sobre um pano de juta'),
  mel: unsplash('photo-1587049352851-8d4e89133924', 'Frasco de mel'),
  enchidos: unsplash('photo-1688895061981-4f7b10d4e4da', 'Enchidos a curar pendurados'),
  peixe: unsplash('photo-1611214774777-3d997a9d0e35', 'Peixe fresco sobre gelo'),
  flores: unsplash('photo-1600104197373-c07cc35e4f61', 'Flores num cesto de verga'),
  compras: unsplash('photo-1572402123736-c79526db405a', 'Pessoa a escolher legumes numa banca'),
  laranjas: unsplash('photo-1652037255133-84dd4ed0f9a3', 'Caixa de laranjas'),
  favos: unsplash('photo-1623018697148-8350cf18e64e', 'Favo de mel'),
  cerejas: unsplash('photo-1528821154947-1aa3d1b74941', 'Cerejas vermelhas'),
}

/*
 * Latest news, newest first, shown in the Hero triptych. Items are dealt across
 * the three frames in turn (1→left, 2→middle, 3→right, 4→left…), so avoid similar
 * photos three positions apart — they would sit side by side.
 * PLACEHOLDER content — to be replaced by the real news feed.
 */
export const news = {
  label: 'Últimas notícias',
  all: 'Ver todas',
  href: '#noticias',
  items: [
    {
      title: 'Feira de produtores locais este sábado',
      excerpt: 'Mais de vinte produtores da região trazem a colheita da semana ao mercado, das 8h às 13h.',
      category: 'Agenda',
      date: '2026-10-08',
      href: '#noticias',
      image: newsPhotos.banca,
    },
    {
      title: 'Peixe fresco às terças e sextas',
      excerpt: 'Os dias de lota passam a ter peixe a chegar logo pela manhã às bancas do mercado.',
      category: 'Produtos',
      date: '2026-10-05',
      href: '#noticias',
      image: newsPhotos.peixe,
    },
    {
      title: 'Prova de queijos da Beira Baixa no mercado',
      excerpt: 'Uma manhã para provar e comparar os queijos de ovelha e cabra feitos na região.',
      category: 'Eventos',
      date: '2026-10-02',
      href: '#noticias',
      image: newsPhotos.queijos,
    },
    {
      title: 'Flores e plantas da época à entrada do mercado',
      excerpt: 'Ramos, flores de corte e plantas de horta passam a receber quem chega ao mercado.',
      category: 'Produtos',
      date: '2026-09-30',
      href: '#noticias',
      image: newsPhotos.flores,
    },
    {
      title: 'Azeite novo já chegou às bancas',
      excerpt: 'Os lagares da região começaram a moer e o primeiro azeite da campanha já está à venda.',
      category: 'Produtos',
      date: '2026-09-27',
      href: '#noticias',
      image: newsPhotos.azeite,
    },
    {
      title: 'Um sábado de compras com os produtores',
      excerpt: 'Acompanhámos uma manhã de sábado entre as bancas, de quem vende a quem compra.',
      category: 'Comunidade',
      date: '2026-09-24',
      href: '#noticias',
      image: newsPhotos.compras,
    },
    {
      title: 'Conheça quem faz o pão do mercado',
      excerpt: 'De madrugada, antes de o mercado abrir, os fornos a lenha já estão acesos.',
      category: 'Produtores',
      date: '2026-09-20',
      href: '#noticias',
      image: newsPhotos.pao,
    },
    {
      title: 'Laranjas e citrinos da região',
      excerpt: 'Começa a época dos citrinos: laranja, tangerina e limão de pomares aqui perto.',
      category: 'Produtos',
      date: '2026-09-16',
      href: '#noticias',
      image: newsPhotos.laranjas,
    },
    {
      title: 'Mostra de mel de rosmaninho',
      excerpt: 'Apicultores da região mostram e dão a provar o mel da última cresta.',
      category: 'Eventos',
      date: '2026-09-12',
      href: '#noticias',
      image: newsPhotos.mel,
    },
    {
      title: 'Workshop: o mundo das abelhas',
      excerpt: 'Uma conversa para miúdos e graúdos sobre colmeias, flores e o trabalho das abelhas.',
      category: 'Eventos',
      date: '2026-09-08',
      href: '#noticias',
      image: newsPhotos.favos,
    },
    {
      title: 'Fumeiro tradicional: a época está a começar',
      excerpt: 'Com o frio chegam os primeiros chouriços, farinheiras e morcelas da época.',
      category: 'Produtos',
      date: '2026-09-05',
      href: '#noticias',
      image: newsPhotos.enchidos,
    },
    {
      title: 'Memórias da época da cereja',
      excerpt: 'Um olhar sobre a última campanha da cereja, contada por quem a colheu.',
      category: 'Produtores',
      date: '2026-08-30',
      href: '#noticias',
      image: newsPhotos.cerejas,
    },
  ] satisfies NewsItem[],
}

export const hero = {
  title: ['Mercado Municipal', 'de Castelo Branco'],
  subtitle: 'Um novo espaço para a cidade.',
  image: {
    /* Wide panorama: the Hero walks through it laterally on scroll */
    src: marketPanorama,
    alt: 'Interior do Mercado Municipal de Castelo Branco',
  } satisfies PhotoAsset,
  /* Width / height of the panorama, so the pinned points stay in place */
  imageRatio: 4.8,

  /*
   * Points of interest pinned to the panorama (x/y in % of the image).
   * Their cards reveal as they pass the centre of the screen.
   */
  /* Facts from the Câmara Municipal and the Arquitectura Aqui record of the building */
  spots: [
    {
      label: 'Desde 1961',
      title: ['Um mercado', 'com história.'],
      text: 'Abriu em novembro de 1961, desenhado pelo arquiteto Miguel Jacobetty Rosa, para substituir o antigo mercado onde hoje está o Tribunal.',
      x: '38.5%',
      y: '69%',
      side: 'right',
    },
    {
      label: 'Curiosidade',
      title: ['Bancas', 'de mármore.'],
      text: 'As primeiras bancas eram de mármore e numeradas. A antiga praça do peixe, ligada por um passadiço, é hoje um ginásio: “A Praça”.',
      x: '57.3%',
      y: '69%',
      side: 'right',
    },
    {
      label: 'Hoje',
      title: ['Segunda', 'e sábado.'],
      text: 'São os dias fortes. À segunda, os pequenos agricultores trazem o que a época dá. Renovado em 2005, ocupa 1400 m² em três pisos.',
      x: '76%',
      y: '69%',
      side: 'left',
    },
  ] satisfies Spot[],
  walkHint: 'Deslize para percorrer o mercado',
}

export type Product = {
  name: string
  /** Short origin / certification tag, e.g. DOP. */
  tag: string
  text: string
  image: PhotoAsset
  /** 'green' turns the showcase background green while this product is shown. */
  tone?: 'green'
}

export const products = {
  title: ['O sabor', 'da Beira Baixa.'],
  intro:
    'Queijos, azeite, fruta, fumeiro, mel e pão — produzidos perto e vendidos por quem os faz. O que se encontra no mercado muda com as estações.',
  items: [
    {
      name: 'Queijos',
      tag: 'DOP',
      text: 'Queijo de Castelo Branco, Amarelo e Picante da Beira Baixa: três queijos com Denominação de Origem Protegida.',
      image: photos.queijos,
    },
    {
      name: 'Azeite',
      tag: 'DOP',
      text: 'Azeite da Beira Interior, de olivais antigos da região — frutado, equilibrado, para o pão e para a mesa.',
      image: photos.azeite,
    },
    {
      name: 'Fruta da época',
      tag: 'IGP',
      text: 'Cereja e pêssego da Cova da Beira, e o que cada estação traz às bancas dos produtores.',
      image: photos.cereja,
    },
    {
      name: 'Enchidos',
      tone: 'green',
      tag: 'Fumeiro',
      text: 'Chouriços, farinheiras e paios de fumeiro tradicional, curados com tempo.',
      image: photos.enchidos,
    },
    {
      name: 'Mel',
      tone: 'green',
      tag: 'Serra',
      text: 'Mel de rosmaninho e de urze, das serras e charnecas à volta da cidade.',
      image: photos.mel,
    },
    {
      name: 'Pão',
      tone: 'green',
      tag: 'Todos os dias',
      text: 'Pão de forno, cozido de madrugada e vendido ainda morno.',
      image: photos.pao,
    },
  ] satisfies Product[],
}
