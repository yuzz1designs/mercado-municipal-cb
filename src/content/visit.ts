/*
 * "Visitar" section.
 * Address, hours, phone and parking from the Câmara Municipal's page on the market
 * (cm-castelobranco.pt). The building illustration is interpretive.
 */

export const visit = {
  title: ['Onde', 'estamos.'],
  address: ['Mercado Municipal de Castelo Branco', 'Av. 1.º de Maio', '6000-086 Castelo Branco'],
  phone: '272 345 553',
  parking: {
    title: 'Parque próprio',
    text: 'Estacionamento do mercado junto ao edifício, perto do centro.',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mercado+Municipal+Av.+1+de+Maio+Castelo+Branco',
  sceneNote: 'O Mercado Municipal visto da rua',
  /** One line to help find it */
  near: 'No centro da cidade, perto dos Paços do Concelho e do Tribunal.',
  /** Shown under the opening hours */
  hoursNote: 'Lojas de artesanato (1.º piso) até às 18h. Segunda e sábado são os dias de mais movimento.',
}

/** Opening hours, Monday first. `null` = closed. Times as 'HH:MM'. */
export const hours: { day: string; open: string | null; close: string | null }[] = [
  { day: 'Segunda', open: '07:30', close: '15:00' },
  { day: 'Terça', open: '07:30', close: '15:00' },
  { day: 'Quarta', open: '07:30', close: '15:00' },
  { day: 'Quinta', open: '07:30', close: '15:00' },
  { day: 'Sexta', open: '07:30', close: '15:00' },
  { day: 'Sábado', open: '07:30', close: '15:00' },
  { day: 'Domingo', open: null, close: null },
]
