/**
 * Browser half of dsh-card-board: the Boards entry in the sidebar and its page in the main column. Built into
 * client.js by scripts/build.mjs; React and DSH's own components come from the page's shared module table, the shared
 * pieces from @soffits/dsh-ui-kit (`ctx.uiKit`) and the buttons from @soffits/dsh-ui-actions (`ctx.uiActions`).
 */
import { createElement as h } from 'react'
import { CSS, STYLE_ID } from './look.js'
import { BoardsPage } from './page.js'
import { OWNER, buttonsStore, kitStore, useKit } from './services.js'
import { fetchMessages, setClientContext } from './words.js'

const NS = 'dsh-card-board'
const PANEL = 'dsh-card-board'

function SidebarIcon({ size }) {
  const stroke = { stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: 'false' },
    h('rect', { x: 1.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    h('rect', { x: 8.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    h('rect', { x: 1.75, y: 8.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    h('path', { d: 'M9 13.5l1.6-2 1.4 1 2-2.8', ...stroke }))
}

/** The page once the shared pieces are there (they load with DSH, before anyone opens the page). */
function Page() {
  return useKit() === null ? h('div', { className: 'cb-page' }) : h(BoardsPage)
}

export const inject = ['slots', 'locale']

export function apply(ctx) {
  setClientContext(ctx)
  // The sidebar entry's name comes from the same locale files: fetched for the active language, then handed to DSH's
  // own dictionary (which also makes the sidebar redraw).
  let forget = () => {}
  ctx.effect(() => {
    let live = true
    let loadedFor = null
    const load = () => {
      const active = ctx.locale.getSnapshot().active
      // Registering the words is itself a locale change notification, so only a new language starts a load.
      if (active === loadedFor) return
      loadedFor = active
      fetchMessages(active).then(messages => {
        if (!live) return
        forget()
        try {
          forget = ctx.locale.register(NS, active, { panel: messages.panel })
        } catch (error) {
          console.warn('card-board: sidebar name not registered:', error)
        }
      }, () => { if (live) { loadedFor = null; setTimeout(load, 3000) } })
    }
    load()
    const stop = ctx.locale.subscribe(load)
    return () => { live = false; stop(); forget() }
  }, 'card-board: sidebar words')
  const sidebarT = ctx.locale.bind(NS)

  ctx.inject(['uiKit'], scope => {
    scope.effect(() => {
      kitStore.set(scope.uiKit)
      return () => kitStore.set(null)
    }, 'card-board: shared pieces')
  })
  // The shared buttons; the board also names itself there, so a chat started from a card shows its icon and name.
  ctx.inject(['uiActions'], scope => {
    scope.effect(() => {
      buttonsStore.set(scope.uiActions)
      const unregister = scope.uiActions.registerSource({ id: OWNER, name: () => sidebarT('panel'), icon: SidebarIcon })
      return () => { unregister(); buttonsStore.set(null) }
    }, 'card-board: shared buttons')
  })

  ctx.effect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return () => {}
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.dataset.plugin = OWNER
    tag.textContent = CSS
    document.head.appendChild(tag)
    return () => tag.remove()
  }, 'card-board: styles')

  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL, locale: NS }, Page))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL,
    order: 13,
    locale: NS,
    label: () => {
      const text = sidebarT('panel')
      return text === 'panel' ? '' : text
    },
  }, SidebarIcon))
}
