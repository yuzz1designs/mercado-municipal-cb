import { producers, type Producer, type ProducerProduct } from '../content/producers'

/*
 * Order model and the SMS each stall owner will receive.
 * Frontend only for now: buildOrderMessages() is what a backend will send.
 */

/** Quantities per producer id, then per product name. */
export type BagItems = Record<string, Record<string, number>>
/** Free-text note per producer id. */
export type BagNotes = Record<string, string>

export type Customer = {
  name: string
  phone: string
  /** Pickup day and time slot, as shown to the customer */
  pickup: string
}

export type BagGroup = {
  producer: Producer
  lines: { product: ProducerProduct; quantity: number }[]
  note: string
}

const numberFormat = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 })
export const formatQuantity = (quantity: number, unit: string) => `${numberFormat.format(quantity)} ${unit}`

/** Bag contents grouped by stall, in stall order. */
export function groupBag(items: BagItems, notes: BagNotes): BagGroup[] {
  return producers
    .filter((producer) => items[producer.id])
    .sort((a, b) => a.stall - b.stall)
    .map((producer) => ({
      producer,
      note: notes[producer.id] ?? '',
      lines: producer.products
        .filter((product) => (items[producer.id][product.name] ?? 0) > 0)
        .map((product) => ({ product, quantity: items[producer.id][product.name] })),
    }))
    .filter((group) => group.lines.length > 0)
}

/** One SMS per stall with that stall's part of the order. */
export function buildOrderMessages(groups: BagGroup[], customer: Customer) {
  return groups.map(({ producer, lines, note }) => ({
    producer,
    text: [
      `Mercado Municipal CB — novo pedido para a banca ${producer.stall} (${producer.name}).`,
      lines.map(({ product, quantity }) => `${formatQuantity(quantity, product.unit)} ${product.name}`).join('; ') + '.',
      `Cliente: ${customer.name}, ${customer.phone}.`,
      `Levantamento: ${customer.pickup}.`,
      note ? `Nota: ${note}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  }))
}

/** Portuguese mobile numbers: 9 digits starting with 9 (optional +351). */
export const isValidPhone = (phone: string) => /^(\+?351)?9\d{8}$/.test(phone.replace(/\s/g, ''))

export type OrderMessage = ReturnType<typeof buildOrderMessages>[number]

/**
 * Sends each stall its SMS. Frontend only for now: this is where the backend call goes.
 */
export async function sendOrder(messages: OrderMessage[]) {
  if (import.meta.env.DEV) console.info('[pedido] SMS a enviar:', messages.map((message) => message.text))
}
