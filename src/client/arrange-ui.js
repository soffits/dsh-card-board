/**
 * What a card's head gets for arranging: the pin mark, and one button that is both the menu (Pin, Move up, Move down) and,
 * with a mouse, the grip to drag the card by.
 */
import { createElement as h, useState } from 'react'
import { IconChevronDownOutlineRegular, IconChevronUpOutlineRegular, IconDragHandleOutlineRegular, IconPinFillRegular, IconPinOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * @param {object} props
 * @param {(key: string, params?: object) => string} props.t
 * @param {{ pinned: boolean, canUp: boolean, canDown: boolean, onPin: () => void, onMove: (delta: number) => void, onGrip: (event: PointerEvent) => void }} props.arrange
 */
export function ArrangeControls({ t, arrange }) {
  const [open, setOpen] = useState(false)
  const items = [
    { id: 'pin', label: t(arrange.pinned ? 'arrange.unpin' : 'arrange.pin'), icon: h(IconPinOutlineRegular, { size: 14 }) },
    { id: 'up', label: t('arrange.up'), icon: h(IconChevronUpOutlineRegular, { size: 14 }), disabled: !arrange.canUp },
    { id: 'down', label: t('arrange.down'), icon: h(IconChevronDownOutlineRegular, { size: 14 }), disabled: !arrange.canDown },
  ]
  const choose = id => {
    setOpen(false)
    if (id === 'pin') arrange.onPin()
    else arrange.onMove(id === 'up' ? -1 : 1)
  }
  // With a keyboard on the menu button, Alt and an arrow key move the card without opening anything.
  const onKeyDown = event => {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
    event.preventDefault()
    const delta = event.key === 'ArrowUp' ? -1 : 1
    if (delta < 0 ? arrange.canUp : arrange.canDown) arrange.onMove(delta)
  }
  // A mouse can pull the card by this button; a press without a pull is the click that opens the menu.
  const onPointerDown = event => { if (event.pointerType === 'mouse') arrange.onGrip(event) }
  return [
    arrange.pinned && h('span', { key: 'pin', className: 'cb-pinMark', role: 'img', title: t('arrange.pinned'), 'aria-label': t('arrange.pinned') }, h(IconPinFillRegular, { size: 14 })),
    h(Menu, {
      key: 'menu',
      open,
      onClose: () => setOpen(false),
      onSelect: choose,
      items,
      align: 'end',
      portal: true,
      compact: true,
      className: 'cb-cardMenu',
      anchor: h('button', { type: 'button', className: `cb-cardLink cb-cardMore${open ? ' cb-open' : ''}`, title: t('arrange.menu'), 'aria-label': t('arrange.menu'), 'aria-haspopup': 'menu', 'aria-expanded': open, onPointerDown, onClick: () => setOpen(value => !value), onKeyDown }, h(IconDragHandleOutlineRegular, { size: 14 })),
    }),
  ]
}
