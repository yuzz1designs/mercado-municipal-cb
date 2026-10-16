import { formatQuantity } from '../../bag/order'
import './QuantityStepper.css'

type QuantityStepperProps = {
  value: number
  unit: string
  step?: number
  /** Accessible name of what is being counted, e.g. the product */
  label: string
  onChange: (value: number) => void
}

/** − quantity + control. Shows "Adicionar" while empty. */
export function QuantityStepper({ value, unit, step = 1, label, onChange }: QuantityStepperProps) {
  const change = (delta: number) => onChange(Math.max(0, Math.round((value + delta) * 10) / 10))

  if (value === 0) {
    return (
      <button type="button" className="stepper stepper--add" onClick={() => change(step)} aria-label={`Adicionar ${label}`}>
        Adicionar
        <span aria-hidden="true">+</span>
      </button>
    )
  }

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => change(-step)} aria-label={`Menos ${label}`}>
        −
      </button>
      <output aria-live="polite">{formatQuantity(value, unit)}</output>
      <button type="button" onClick={() => change(step)} aria-label={`Mais ${label}`}>
        +
      </button>
    </div>
  )
}
