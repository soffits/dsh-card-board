/**
 * The opened view of a card or a row: DSH's own Modal (its look, motion, focus trap, Escape and backdrop), wider
 * than a dialog. Kept small and stable: other row kinds open into it too.
 */
import { createElement as h } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('react').ReactNode} props.title
 * @param {string} [props.closeLabel]
 * @param {import('react').ReactNode} [props.children]
 */
export function Sheet({ open, onClose, title, closeLabel, children }) {
  return h(Modal, { open, onClose, title, closeLabel, className: 'cb-sheetModal', contentClassName: 'cb-sheet' }, children)
}
