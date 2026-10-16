import camaraLogo from '../assets/brand/camara-castelo-branco.webp'

/* Site-wide content. Links point to sections that will be built incrementally. */
export const site = {
  name: 'Mercado Municipal',
  place: 'Castelo Branco',
  owner: {
    name: 'Câmara Municipal de Castelo Branco',
    logo: camaraLogo,
  },
  nav: [
    // In page order
    { label: 'Produtos', href: '#produtos' },
    { label: 'Produtores', href: '#produtores' },
    { label: 'Visitar', href: '#visitar' },
    { label: 'Vender', href: '#vender' },
  ],
}
