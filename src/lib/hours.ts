import { hours } from '../content/visit'

/*
 * Opening hours helpers, shared by the "Visitar" section and the footer.
 * `hours` (content/visit.ts) starts on Monday; times are 'HH:MM'.
 */

/** '07:00' → '7h', '13:30' → '13h30' */
export const formatTime = (time: string) => {
  const [h, m] = time.split(':')
  return `${Number(h)}h${m === '00' ? '' : m}`
}
const minutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
const span = (day: (typeof hours)[number]) =>
  day.open && day.close ? `${formatTime(day.open)} – ${formatTime(day.close)}` : 'Encerrado'

/** Open now? And if not, when it opens next. `hours` starts on Monday. */
export function openingStatus(now: Date) {
  const today = (now.getDay() + 6) % 7
  const current = now.getHours() * 60 + now.getMinutes()
  const day = hours[today]
  if (day.open && day.close && current >= minutes(day.open) && current < minutes(day.close)) {
    return { open: true, text: `Aberto agora · fecha às ${formatTime(day.close)}` }
  }
  for (let offset = 0; offset < 7; offset++) {
    const next = hours[(today + offset) % 7]
    if (!next.open) continue
    if (offset === 0 && current >= minutes(next.open)) continue
    const when = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : next.day.toLowerCase()
    return { open: false, text: `Fechado · abre ${when} às ${formatTime(next.open)}` }
  }
  return { open: false, text: 'Fechado' }
}

/** Consecutive days with the same hours, e.g. "Terça a sexta · 7h – 13h" (wrapping Sunday → Monday). */
export function groupHours() {
  const start = hours.findIndex((day, i) => span(day) !== span(hours[(i + 6) % 7]))
  const order = Array.from({ length: 7 }, (_, i) => (start + i) % 7)
  const groups: { days: number[]; time: string }[] = []
  for (const index of order) {
    const last = groups[groups.length - 1]
    if (last && last.time === span(hours[index])) last.days.push(index)
    else groups.push({ days: [index], time: span(hours[index]) })
  }
  return groups.map(({ days, time }) => {
    const first = hours[days[0]].day
    const end = hours[days[days.length - 1]].day.toLowerCase()
    const label = days.length === 1 ? first : days.length === 2 ? `${first} e ${end}` : `${first} a ${end}`
    return { days, label, time }
  })
}
