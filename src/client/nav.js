/**
 * The page's place in the URL, so a link opens it: ?board=<id>&card=<id>&row=<key>. Pure, so it is tested directly.
 */
const NAMES = ['board', 'card', 'row']

/** `{ board?, card?, row? }` from a query string (missing ones left out). */
export function readNav(search) {
  const params = new URLSearchParams(search)
  const nav = {}
  for (const name of NAMES) {
    const value = params.get(name)
    if (value) nav[name] = value
  }
  return nav
}

/** The query string with these params set (and the others of ours removed); other params stay as they are. */
export function writeNav(search, nav) {
  const params = new URLSearchParams(search)
  for (const name of NAMES) params.delete(name)
  for (const name of NAMES) if (nav?.[name]) params.set(name, nav[name])
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** True when the URL asks for a card (the page should open itself). */
export const hasNav = search => Boolean(readNav(search).card)
