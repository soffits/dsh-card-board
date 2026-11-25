/**
 * What the page takes from other plugins, as small stores React can follow: the shared pieces
 * (`ctx.uiKit` from @soffits/dsh-plugin-sdk, which the page needs) and the shared buttons (`ctx.uiActions` from
 * @soffits/dsh-plugin-sdk, used when present).
 */
import { useSyncExternalStore } from 'react'

export const OWNER = '@soffits/dsh-card-board'

/** A route of this plugin as a URL against the page's base. */
export const api = path => new URL(`api/card-board/${path}`, document.baseURI).href

function createStore() {
  let value = null
  const listeners = new Set()
  return {
    get: () => value,
    set: next => { value = next; for (const listener of listeners) listener() },
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
  }
}

export const kitStore = createStore()
export const buttonsStore = createStore()

/** ctx.uiKit, or null until it is there. */
export const useKit = () => useSyncExternalStore(kitStore.subscribe, kitStore.get)
/** ctx.uiActions, or null when that plugin isn't there. */
export const useButtons = () => useSyncExternalStore(buttonsStore.subscribe, buttonsStore.get)
