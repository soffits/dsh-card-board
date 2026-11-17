/**
 * Small pieces the card bodies share.
 */
import { createElement as h, useState } from 'react'

/** Text that shortens to fit; hover shows all of it, and a tap opens it up (or closes it again). */
export function Trunc({ text, as = 'div', className = '', lines = 1 }) {
  const [open, setOpen] = useState(false)
  return h(as, {
    className: `cb-trunc${lines > 1 ? ' cb-trunc2' : ''}${open ? ' cb-truncOpen' : ''} ${className}`.trim(),
    title: text,
    onClick: () => setOpen(value => !value),
  }, text)
}

