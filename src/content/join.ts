import { producers, STALLS } from './producers'

/*
 * "Vender no mercado": call for producers who want a stall.
 * Stall applications go through the Câmara's Balcão Único (cm-castelobranco.pt);
 * the process steps must still be confirmed with the market.
 */

export const join = {
  kicker: 'Para produtores e comerciantes',
  title: ['Venda', 'no', 'mercado.'],
  lead: 'Tem uma horta, um pomar, um forno ou uma queijaria? O mercado tem lugar para quem produz e vende na região. Diga-nos o que faz e encontramos a banca certa.',
  freeStalls: STALLS - producers.length,
  steps: [
    { title: 'Candidatura', text: 'Preencha o formulário ou envie-nos um email com o que produz.' },
    { title: 'Conversa e visita', text: 'Combinamos uma visita ao mercado e escolhemos a banca.' },
    { title: 'Na sua banca', text: 'Instala-se e começa a vender, com o apoio da equipa do mercado.' },
  ],
  /** The Câmara's general address, which handles stall applications */
  email: 'camara@cm-castelobranco.pt',
  emailSubject: 'Quero vender no Mercado Municipal',
}
