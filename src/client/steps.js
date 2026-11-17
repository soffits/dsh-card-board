// The times on a countdown's track. A step's own offset ("…T14:20:00-07:00") is the authority for its wall-clock
// time: whoever writes the card knows the local time on the ticket, and a browser's zone data can be older than a
// zone's current rules. `zone` names the place; its short name is shown only when the browser agrees with the
// offset, otherwise the offset itself ("GMT−7").

export function ownOffset(at) {
  const m = /(?:([+-])(\d{2}):?(\d{2})|Z)$/.exec(String(at))
  if (!m) return null
  return m[1] ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0
}

function part(locale, zone, time, style) {
  const parts = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: style }).formatToParts(time)
  return parts.find(p => p.type === 'timeZoneName')?.value ?? ''
}

export function browserOffset(zone, time) {
  const m = /([+-])(\d{1,2})(?::(\d{2}))?/.exec(part('und', zone, time, 'shortOffset'))
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0
}

export function offsetName(offset) {
  const abs = Math.abs(offset)
  return `GMT${offset < 0 ? '−' : '+'}${Math.floor(abs / 60)}${abs % 60 ? `:${String(abs % 60).padStart(2, '0')}` : ''}`
}

export function stepTimes(steps, locale, here = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  let lastDay = null
  return steps.map(step => {
    const time = new Date(step.at)
    const away = Boolean(step.zone) && step.zone !== here
    const offset = away ? ownOffset(step.at) : null
    // in another zone with an explicit offset: shift by that offset and format the result as UTC
    const shown = offset === null ? time : new Date(time.getTime() + offset * 60000)
    const zone = offset === null ? (away ? step.zone : here) : 'UTC'
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(shown)
    const showDay = day !== lastDay
    lastDay = day
    let text = new Intl.DateTimeFormat(locale, { timeZone: zone, hour: '2-digit', minute: '2-digit', ...(showDay ? { weekday: 'short' } : {}) }).format(shown)
    if (away) {
      text += ' ' + (offset === null || browserOffset(step.zone, time) === offset ? part(locale, step.zone, time, 'short') : offsetName(offset))
    }
    return { time, text }
  })
}
