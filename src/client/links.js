/** Where a row's or a stat's `link` goes: an http(s) URL in a new tab, a path of this app in place. */
export function openLink(link) {
  if (/^https?:/i.test(link)) {
    window.open(link, '_blank', 'noopener,noreferrer')
    return
  }
  const url = new URL(link, window.location.origin)
  if (url.origin !== window.location.origin) return
  // DSH's pages follow the URL: push it and tell the router, as its own links do.
  window.history.pushState(null, '', url.pathname + url.search + url.hash)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** True when a click started on something with its own behaviour (a button, a link, a checkbox, a field). */
export function onControl(event) {
  return Boolean(event.target?.closest?.('button,a,input,select,textarea,label,[role=button],[role=checkbox],[role=menuitem]'))
}
