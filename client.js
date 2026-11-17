/* @soffits/dsh-card-board 0.8.0: built by scripts/build.mjs from src/client/. Do not edit. */
window.__ModuleLoader__.load({
  id: "@soffits/dsh-card-board",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react9 = require("react");

// src/client/look.js
var STYLE_ID = "dsh-card-board-style";
var CSS = `
.cb-page{overflow-x:hidden;width:100%;height:100%;min-height:0;overflow:auto;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.5;scrollbar-gutter:stable}
.cb-content{box-sizing:border-box;max-width:1680px;margin:0 auto;padding:0 clamp(16px,3.2vw,40px) 48px}
.cb-heading{padding-top:28px;margin-bottom:14px}
[data-platform=darwin] .cb-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.cb-heading h1{margin:0;font-size:20px;font-weight:500;line-height:28px}
.cb-sub{margin-top:4px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.cb-tabs{display:flex;flex-wrap:wrap;gap:6px 8px;margin:0 0 18px}
.cb-grid{display:grid;row-gap:0;grid-auto-flow:row dense;align-items:start}
.cb-more{align-self:flex-start;margin-top:2px}
.cb-card{container-type:inline-size;box-sizing:border-box;min-width:0;display:flex;flex-direction:column;gap:12px;padding:16px 18px 18px;border-radius:16px;background:var(--dsw-alias-bg-base);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.cb-cardHead{display:flex;align-items:center;gap:10px;min-height:28px}
.cb-cardHead h3{flex:1;min-width:0;margin:0;font-size:15px;font-weight:600;line-height:22px}
.cb-trunc{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-trunc2{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.cb-truncOpen{white-space:normal;display:block;overflow:visible;overflow-wrap:anywhere}
h3.cb-truncOpen{overflow:visible}
.cb-cardChat{display:inline-flex;margin:-5px -8px -5px 0}
.cb-cardLink{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;margin:-5px 0;border-radius:8px;color:var(--dsw-alias-label-tertiary)}
@media (hover:hover){.cb-cardLink:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.cb-stale{flex:0 1 auto;min-width:0;display:inline-flex}
.cb-cardStale .cb-cardBody,.cb-cardStale .cb-stats{opacity:.62}
.cb-cardBody{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-start}
.cb-cardActions{padding-top:2px}
.cb-cardError{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-error-primary) 35%,transparent)}
.cb-errorText{margin:0;color:var(--dsw-alias-state-error-primary);font-size:13px}
.cb-problems{margin:6px 0 0;padding:0 0 0 16px;color:var(--dsw-alias-label-tertiary);font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
.cb-notice{margin:0 0 14px;padding:10px 14px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent);color:var(--dsw-alias-label-secondary);font-size:13px}
.cb-muted{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px}
.cb-empty{padding:48px 0;text-align:center}
.cb-emptyTitle{margin:0 0 4px;color:var(--dsw-alias-label-secondary)}

/* the summary: a full-width card with the day's line, a sentence and chips */
.cb-card-summary{flex-direction:row;align-items:flex-start;gap:16px;padding:18px 20px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,var(--dsw-alias-bg-base)),var(--dsw-alias-bg-base) 70%)}
.cb-summaryMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px}
.cb-summaryAside{display:flex;align-items:center;gap:8px}
.cb-summaryLine{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-summaryText{margin:0;font-size:17px;font-weight:500;line-height:26px;letter-spacing:-.005em;text-wrap:pretty}
.cb-chips{display:flex;flex-wrap:wrap;gap:6px}

/* the countdown: the big number, then the stops with the next one marked */
.cb-countdown{display:flex;flex-direction:column;gap:14px}
.cb-countdownHead{display:flex;flex-wrap:wrap;align-items:center;gap:4px 18px}
.cb-countdownText{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:19px}
.cb-track{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;margin:0;padding:0;list-style:none}
.cb-track:before{content:"";position:absolute;left:9px;right:9px;top:8px;height:2px;border-radius:2px;background:var(--dsw-alias-border-l2)}
.cb-track li{position:relative;min-width:0;padding-right:8px}
.cb-track i{display:block;width:18px;height:18px;margin-bottom:6px;border-radius:50%;background:var(--dsw-alias-bg-base);box-shadow:inset 0 0 0 2px var(--dsw-alias-border-l4,var(--dsw-alias-border-l3))}
.cb-track li[data-state=next] i{box-shadow:inset 0 0 0 5px var(--dsw-alias-state-business-primary)}
.cb-track li[data-state=past] i{background:var(--dsw-alias-border-l3);box-shadow:none}
.cb-track b{display:block;font-size:13px;font-weight:600;line-height:19px;font-variant-numeric:tabular-nums}
.cb-track span{display:block;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px;overflow-wrap:anywhere}
.cb-track li[data-state=past] b,.cb-track li[data-state=past] span{color:var(--dsw-alias-label-tertiary)}

/* stats */
.cb-stats{display:flex;flex-wrap:wrap;gap:14px 30px}
.cb-stat{min-width:0;display:flex;flex-direction:column;gap:2px}
.cb-statWide{flex:1 1 100%}
.cb-statLabel{display:flex;align-items:center;gap:6px;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-statValue{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 6px;font-size:28px;font-weight:600;line-height:36px;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.cb-statValue small{font-size:14px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.cb-statsCompact .cb-statValue{font-size:26px;line-height:32px}
.cb-delta{display:flex;align-items:center;gap:3px;font-size:12px;font-weight:500;line-height:18px}
.cb-statSub{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-statProgress{display:flex;flex-direction:column;gap:4px;min-width:180px;margin-top:4px}
.cb-strip{display:flex;justify-content:space-between;gap:4px;margin:10px 0 0;padding:0;list-style:none}
.cb-strip li{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums}
.cb-strip b{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}
.cb-strip li[data-on=true],.cb-strip li[data-on=true] b{color:var(--dsw-alias-state-business-primary)}
/* a narrow card shows the first hours that fit: 6 under 360 px, 8 under 480 px */
@container (width<480px){.cb-strip li:nth-child(n+9){display:none}}
@container (width<360px){.cb-strip li:nth-child(n+7){display:none}}
/* a chart card with headline numbers: side by side when there is room */
.cb-split{display:flex;flex-direction:column;gap:12px}
@container (width>=640px){.cb-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:28px}.cb-split .cb-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 24px}}

/* rows of lists and status cards */
.cb-list{display:flex;flex-direction:column;gap:10px}
.cb-progress{display:flex;align-items:center;gap:14px}
.cb-progressLabel{font-weight:600}
.cb-rows{list-style:none;margin:0;padding:0}
.cb-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 11px;padding:9px 6px;border-top:.5px solid var(--dsw-alias-border-l2);border-radius:10px}
.cb-rows .cb-row:first-child{border-top:0}
.cb-row+.cb-row{border-top-left-radius:0;border-top-right-radius:0}
.cb-rowNow{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 6%,transparent)}
.cb-rowText{flex:1;min-width:0}
.cb-rowTitle{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:20px}
.cb-rowSub{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-done .cb-rowTitle{color:var(--dsw-alias-label-tertiary)}
.cb-rowMeta{display:flex;align-items:center;gap:8px;min-width:0;max-width:45%}
.cb-rowMeta>*{min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-when{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}
.cb-rowActions{display:inline-flex;flex-wrap:wrap;justify-content:flex-end;min-width:0}
.cb-rowSteps{flex-basis:100%;min-width:0;padding-left:41px}
.cb-check{flex:none;display:inline-grid;place-items:center;width:18px;height:18px;border-radius:5px;color:#fff;box-shadow:inset 0 0 0 1.5px var(--dsw-alias-border-l4,var(--dsw-alias-border-l3))}
.cb-check[data-checked=true]{background:var(--dsw-alias-state-success-primary);box-shadow:none}
.cb-dotSlot{flex:none;display:inline-grid;place-items:center;width:28px}
.cb-statusSpark{flex:0 1 90px;min-width:48px}
.cb-statusValue{flex:none;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}

/* charts */
.cb-chart{position:relative;width:100%;min-width:0}
.cb-chart svg,.cb-donutRing svg{display:block;overflow:visible}
.cb-rule{stroke:var(--dsw-alias-border-l2);stroke-width:1;shape-rendering:crispEdges}
.cb-axis{fill:var(--dsw-alias-label-caption);font-size:11px}
.cb-goal{stroke:var(--dsw-alias-label-caption);stroke-width:1.2;stroke-dasharray:4 4;fill:none}
.cb-goalLabel{fill:var(--dsw-alias-label-tertiary);font-size:11px}
.cb-marker{stroke:var(--dsw-alias-border-l3);stroke-dasharray:2 3}
.cb-markerLabel{fill:var(--dsw-alias-label-tertiary);font-size:11px}
.cb-barValue{fill:var(--dsw-alias-label-secondary);font-size:11px}
.cb-dayLine{stroke:var(--dsw-alias-border-l1,var(--dsw-alias-border-l2));stroke-dasharray:2 4}
.cb-today{stroke:var(--dsw-alias-state-business-primary);stroke-width:1.2;stroke-opacity:.6}
.cb-leader{stroke:var(--dsw-alias-border-l3)}
.cb-pointLabel{fill:var(--dsw-alias-label-secondary);font-size:12px}
.cb-spanLabel{fill:var(--dsw-alias-label-tertiary);font-size:12px}
.cb-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:8px 0 0;padding:0;list-style:none;color:var(--dsw-alias-label-secondary);font-size:12px}
.cb-legend li{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%}
.cb-legend i,.cb-donutTable i{display:inline-block;width:8px;height:8px;border-radius:50%}
.cb-legend b{font-weight:500;color:var(--dsw-alias-label-tertiary)}
.cb-donut{display:flex;align-items:center;gap:24px}
.cb-donutNarrow{flex-direction:column;align-items:stretch;gap:12px}
.cb-donutNarrow .cb-donutRing{align-self:center}
.cb-donutRing{position:relative;flex:none}
.cb-donutCentre{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.cb-donutCentre strong{font-size:22px;font-weight:600;line-height:28px;font-variant-numeric:tabular-nums}
.cb-donutCentre span{color:var(--dsw-alias-label-tertiary);font-size:12px}
.cb-donutTable{flex:1;min-width:0;border-collapse:collapse;font-size:13px}
.cb-donutTable td{padding:4px 0;white-space:nowrap}
.cb-donutTable td:first-child{width:8px;padding-right:10px}
.cb-donutLabel{max-width:0;width:100%}
.cb-num{text-align:right;padding-left:14px!important;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.cb-dim{color:var(--dsw-alias-label-tertiary)}

/* narrow cards: meta and buttons move under the words */
@container (width<360px){
.cb-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;column-gap:10px}
.cb-row>.cb-rowText{grid-column:2}
.cb-row>.cb-rowMeta,.cb-row>.cb-statusSpark{grid-column:2/-1;max-width:none;justify-content:flex-start}
.cb-row>.cb-rowActions{grid-column:3;grid-row:1}
.cb-row>.cb-statusValue{grid-column:3;grid-row:1}
.cb-statusRow>.cb-rowActions{grid-row:2}
.cb-row>.cb-rowSteps{grid-column:2/-1;padding-left:0}
.cb-row>.cb-check+.uk-tile{display:none}
}
@container (width<520px){
.cb-track{grid-auto-flow:row;grid-auto-columns:auto;gap:10px}
.cb-track:before{left:8px;right:auto;top:9px;bottom:9px;width:2px;height:auto}
.cb-track li{display:grid;grid-template-columns:18px auto 1fr;column-gap:10px;align-items:baseline}
.cb-track i{margin:0;align-self:center}
.cb-track span{grid-column:3}
}
@media (width<=640px){
.cb-heading{padding-top:18px}
.cb-card{padding:14px 14px 16px;border-radius:14px}
.cb-card-summary{flex-direction:column;padding:15px}
.cb-summaryAside{position:absolute;right:10px;top:8px}
.cb-card-summary{position:relative}
.cb-summaryText{font-size:16px;line-height:24px}
.cb-statValue{font-size:24px;line-height:30px}
}
@media (width<=768px),(pointer:coarse){
.cb-cardLink{width:40px;height:40px;margin:-9px 0}
.cb-cardChat{margin:-9px -10px -9px 0}
}
`;

// src/client/page.js
var import_react8 = require("react");
var import_dsh_client_ui_primitives4 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/card.js
var import_react7 = require("react");
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/charts.js
var import_react4 = require("react");

// src/client/pieces.js
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function Trunc({ text, as = "div", className = "", lines = 1 }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  return (0, import_react.createElement)(as, {
    className: `cb-trunc${lines > 1 ? " cb-trunc2" : ""}${open ? " cb-truncOpen" : ""} ${className}`.trim(),
    title: text,
    onClick: () => setOpen((value) => !value)
  }, text);
}
function CheckBox({ checked, label }) {
  return (0, import_react.createElement)(
    "span",
    { className: "cb-check", "data-checked": checked ? "true" : "false", role: "img", "aria-label": label },
    checked && (0, import_react.createElement)(import_dsh_client_ui_primitives.IconCheckOutlineMedium, { size: 12 })
  );
}

// src/client/format.js
var import_react2 = require("react");
function formatNumber(value, locale, digits) {
  if (typeof value !== "number") return String(value);
  const abs = Math.abs(value);
  const max = digits ?? (abs >= 1e3 ? 0 : abs >= 100 ? 1 : 2);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: max }).format(value);
}
function formatAxis(value, locale) {
  const abs = Math.abs(value);
  if (abs >= 1e4) return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: abs >= 1e5 ? 0 : 1 }).format(value);
  return formatNumber(value, locale, abs >= 100 ? 0 : 1);
}
var DAY_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
function toTime(value) {
  if (typeof value !== "string") return NaN;
  const day = DAY_ONLY.exec(value);
  if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])).getTime();
  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? Date.parse(value) : NaN;
}
function formatDay(time, locale, spanDays) {
  const date = new Date(time);
  if (spanDays > 120) return new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
  return new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric" }).format(date);
}
function formatAge(seconds, locale) {
  const [unit, amount] = seconds < 3600 ? ["minute", Math.max(1, Math.round(seconds / 60))] : seconds < 86400 * 2 ? ["hour", Math.round(seconds / 3600)] : ["day", Math.round(seconds / 86400)];
  return new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" }).format(amount);
}
function formatClock(time, locale, zone) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", ...zone ? { timeZone: zone } : {} }).format(time);
}
var textWidth = (text) => [...String(text)].reduce((sum, char) => sum + (char.charCodeAt(0) > 11903 ? 11.5 : 6.4), 0);
function fit(text, px) {
  if (textWidth(text) <= px) return String(text);
  let out = "";
  for (const char of String(text)) {
    if (textWidth(`${out}${char}\u2026`) > px) break;
    out += char;
  }
  return `${out}\u2026`;
}
function niceTicks(min, max, count) {
  if (min === max) return [min];
  const raw = (max - min) / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? raw;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}
function spread(length, count) {
  if (length <= count) return Array.from({ length }, (_, i) => i);
  const step = (length - 1) / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(i * step));
}
function useWidth() {
  const [element, setElement] = (0, import_react2.useState)(null);
  const [width, setWidth] = (0, import_react2.useState)(0);
  (0, import_react2.useLayoutEffect)(() => {
    if (!element) return void 0;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, width];
}
var isActive = (active, now) => active !== void 0 && Date.parse(active.from) <= now && now < Date.parse(active.to);

// src/client/services.js
var import_react3 = require("react");
var OWNER = "@soffits/dsh-card-board";
var api = (path) => new URL(`api/card-board/${path}`, document.baseURI).href;
function createStore() {
  let value = null;
  const listeners = /* @__PURE__ */ new Set();
  return {
    get: () => value,
    set: (next) => {
      value = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
var kitStore = createStore();
var buttonsStore = createStore();
var useKit = () => (0, import_react3.useSyncExternalStore)(kitStore.subscribe, kitStore.get);
var useButtons = () => (0, import_react3.useSyncExternalStore)(buttonsStore.subscribe, buttonsStore.get);

// src/client/charts.js
var PALETTE = ["accent", "ok", "warn", "violet", "bad", "muted"];
var toneColor = (tone, index = 0) => kitStore.get().toneColor(tone ?? PALETTE[index % PALETTE.length]);
function Legend({ items, locale }) {
  return (0, import_react4.createElement)("ul", { className: "cb-legend" }, items.map((item, i) => (0, import_react4.createElement)(
    "li",
    { key: i },
    (0, import_react4.createElement)("i", { style: { background: item.color } }),
    (0, import_react4.createElement)(Trunc, { as: "span", text: item.label }),
    item.value !== void 0 && (0, import_react4.createElement)("b", null, formatNumber(item.value, locale))
  )));
}
function LineChart({ data, locale, height }) {
  const [ref, width] = useWidth();
  const model = (0, import_react4.useMemo)(() => {
    const allX = [...data.series.flatMap((s) => s.points.map((p) => p.x)), ...(data.goal?.points ?? []).map((p) => p.x), ...(data.markers ?? []).map((m) => m.x)];
    const times = allX.map(toTime);
    const timeAxis = times.every(Number.isFinite);
    const numberAxis = !timeAxis && allX.every((x) => typeof x === "number");
    const categories = timeAxis || numberAxis ? [] : [...new Set(allX.map(String))];
    const xValue = (x) => timeAxis ? toTime(x) : numberAxis ? x : categories.indexOf(String(x));
    const xs = allX.map(xValue);
    let ys = data.series.flatMap((s) => s.points.map((p) => p.y)).filter((y) => typeof y === "number");
    if (data.goal?.y !== void 0) ys = ys.concat(data.goal.y);
    if (data.goal?.points) ys = ys.concat(data.goal.points.map((p) => p.y).filter((y) => typeof y === "number"));
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);
    const pad = (yMax - yMin || Math.abs(yMax) || 1) * 0.08;
    yMin -= pad;
    yMax += pad;
    return { timeAxis, categories, xValue, xMin: Math.min(...xs), xMax: Math.max(...xs), yMin, yMax };
  }, [data]);
  const ticks = niceTicks(model.yMin, model.yMax, height > 160 ? 4 : 3).filter((v) => v >= model.yMin && v <= model.yMax);
  const left = Math.max(...ticks.map((v) => textWidth(formatAxis(v, locale)))) + 10;
  const right = 12;
  const top = 10;
  const bottom = 20;
  const plotW = Math.max(10, width - left - right);
  const plotH = Math.max(10, height - top - bottom);
  const sx = (x) => left + (model.xMax === model.xMin ? plotW / 2 : (model.xValue(x) - model.xMin) / (model.xMax - model.xMin) * plotW);
  const sy = (y) => top + (1 - (y - model.yMin) / (model.yMax - model.yMin || 1)) * plotH;
  const spanDays = model.timeAxis ? (model.xMax - model.xMin) / 864e5 : 0;
  const xLabel = (x) => model.timeAxis ? formatDay(toTime(x), locale, spanDays) : typeof x === "number" ? formatNumber(x, locale) : String(x);
  const longest = data.series.reduce((best, s) => s.points.length > best.points.length ? s : best, data.series[0]);
  const labelWidth = Math.max(36, ...longest.points.slice(0, 40).map((p) => textWidth(xLabel(p.x)) + 12));
  const labelCount = Math.max(2, Math.floor(plotW / labelWidth));
  const xTicks = [];
  for (const x of spread(longest.points.length, labelCount).map((i) => longest.points[i].x)) {
    const last = xTicks[xTicks.length - 1];
    if (last !== void 0 && (xLabel(last) === xLabel(x) || sx(x) - sx(last) < labelWidth)) continue;
    xTicks.push(x);
  }
  const labelRows = [[], []];
  const markerLabels = [...data.markers ?? []].sort((a, b) => model.xValue(a.x) - model.xValue(b.x)).map((marker) => {
    const x = sx(marker.x);
    const room = left + plotW - x - 6;
    const flip = room < Math.min(textWidth(marker.label), 90) && x - left > room;
    const space = Math.max(20, Math.min(120, flip ? x - left - 6 : room));
    const width2 = Math.min(textWidth(marker.label), space);
    const span = flip ? [x - 4 - width2, x - 4] : [x + 4, x + 4 + width2];
    const row = labelRows.findIndex((taken) => taken.every(([from, to]) => span[0] > to + 4 || span[1] < from - 4));
    if (row >= 0) labelRows[row].push(span);
    return { marker, x, flip, space, label: row >= 0 ? row : null };
  });
  const path = (points) => {
    let d = "";
    let pen = false;
    for (const p of points) {
      if (typeof p.y !== "number") {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const gradientId = (0, import_react4.useMemo)(() => `cb-g-${Math.random().toString(36).slice(2, 9)}`, []);
  return (0, import_react4.createElement)("div", { ref, className: "cb-chart", style: { height } }, width > 0 && (0, import_react4.createElement)(
    "svg",
    { width, height, role: "img" },
    (0, import_react4.createElement)("defs", null, data.series.map((s, i) => (0, import_react4.createElement)(
      "linearGradient",
      { key: i, id: `${gradientId}-${i}`, x1: 0, y1: 0, x2: 0, y2: 1 },
      (0, import_react4.createElement)("stop", { offset: "0%", stopColor: toneColor(s.tone, i), stopOpacity: 0.22 }),
      (0, import_react4.createElement)("stop", { offset: "100%", stopColor: toneColor(s.tone, i), stopOpacity: 0 })
    ))),
    ticks.map((v) => (0, import_react4.createElement)(
      "g",
      { key: v },
      (0, import_react4.createElement)("line", { x1: left, x2: left + plotW, y1: sy(v), y2: sy(v), className: "cb-rule" }),
      (0, import_react4.createElement)("text", { x: left - 8, y: sy(v), className: "cb-axis", textAnchor: "end", dominantBaseline: "middle" }, formatAxis(v, locale))
    )),
    xTicks.map((x, i) => (0, import_react4.createElement)("text", { key: i, x: sx(x), y: height - 4, className: "cb-axis", textAnchor: i === 0 && xTicks.length > 1 ? "start" : i === xTicks.length - 1 && xTicks.length > 1 ? "end" : "middle" }, xLabel(x))),
    markerLabels.map(({ marker, x, label, flip, space }, i) => (0, import_react4.createElement)(
      "g",
      { key: `m${i}` },
      (0, import_react4.createElement)("line", { x1: x, x2: x, y1: top, y2: top + plotH, className: "cb-marker" }),
      (0, import_react4.createElement)("title", null, marker.label),
      label !== null && (0, import_react4.createElement)("text", { x: flip ? x - 4 : x + 4, y: top + plotH - 5 - label * 13, className: "cb-markerLabel", textAnchor: flip ? "end" : "start" }, fit(marker.label, space))
    )),
    data.goal && (data.goal.points ? (0, import_react4.createElement)("path", { d: path(data.goal.points), className: "cb-goal" }) : (0, import_react4.createElement)("line", { x1: left, x2: left + plotW, y1: sy(data.goal.y), y2: sy(data.goal.y), className: "cb-goal" })),
    data.goal?.label && (() => {
      const end = data.goal.points ? data.goal.points[data.goal.points.length - 1] : { x: null, y: data.goal.y };
      const x = end.x === null ? left + plotW : sx(end.x);
      return (0, import_react4.createElement)("text", { x: Math.min(x, left + plotW), y: sy(end.y) - 5, className: "cb-goalLabel", textAnchor: "end" }, (0, import_react4.createElement)("title", null, data.goal.label), fit(data.goal.label, plotW));
    })(),
    data.series.map((s, i) => {
      const color = toneColor(s.tone, i);
      const line = path(s.points);
      const valid = s.points.filter((p) => typeof p.y === "number");
      const last = valid[valid.length - 1];
      const area = data.area && valid.length > 1 ? `${line}L${sx(last.x).toFixed(1)},${(top + plotH).toFixed(1)}L${sx(valid[0].x).toFixed(1)},${(top + plotH).toFixed(1)}Z` : null;
      return (0, import_react4.createElement)(
        "g",
        { key: `s${i}` },
        area && (0, import_react4.createElement)("path", { d: area, fill: `url(#${gradientId}-${i})`, stroke: "none" }),
        (0, import_react4.createElement)("path", { d: line, fill: "none", stroke: color, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" }),
        valid.length <= 16 && valid.map((p, j) => (0, import_react4.createElement)(
          "circle",
          { key: j, cx: sx(p.x), cy: sy(p.y), r: 2.6, fill: "var(--dsw-alias-bg-base)", stroke: color, strokeWidth: 1.6 },
          (0, import_react4.createElement)("title", null, `${s.name ? `${s.name} \xB7 ` : ""}${xLabel(p.x)}: ${formatNumber(p.y, locale)}${data.unit ? ` ${data.unit}` : ""}`)
        )),
        valid.length > 16 && last && (0, import_react4.createElement)("circle", { cx: sx(last.x), cy: sy(last.y), r: 3, fill: color })
      );
    })
  ));
}
function BarChart({ data, locale, height }) {
  const [ref, width] = useWidth();
  const keys = (0, import_react4.useMemo)(() => {
    const seen = [];
    for (const bar of data.bars) for (const key of Object.keys(bar.values ?? {})) if (!seen.includes(key)) seen.push(key);
    return seen;
  }, [data]);
  const multi = keys.length > 0;
  const stacked = multi && data.stacked === true;
  const totals = data.bars.map((bar) => multi ? keys.reduce((sum, key) => sum + Math.max(0, bar.values?.[key] ?? 0), 0) : Math.max(0, bar.value ?? 0));
  const peaks = data.bars.map((bar, i) => multi && !stacked ? Math.max(0, ...keys.map((key) => bar.values?.[key] ?? 0)) : totals[i]);
  const max = Math.max(1e-9, ...peaks, data.goal?.y ?? 0);
  const showValues = data.bars.length <= 14;
  const top = showValues ? 16 : 6;
  const bottom = 20;
  const plotH = Math.max(10, height - top - bottom);
  const slot = width / data.bars.length;
  const barW = Math.max(2, Math.min(44, slot * 0.62));
  const sy = (v) => top + plotH - v / max * plotH;
  const labelEvery = Math.max(1, Math.ceil(data.bars.length / Math.max(1, Math.floor(width / 40))));
  const label = (x) => {
    const time = toTime(x);
    return Number.isFinite(time) ? formatDay(time, locale, 0) : String(x);
  };
  return (0, import_react4.createElement)(
    "div",
    null,
    (0, import_react4.createElement)("div", { ref, className: "cb-chart", style: { height } }, width > 0 && (0, import_react4.createElement)(
      "svg",
      { width, height, role: "img" },
      (0, import_react4.createElement)("line", { x1: 0, x2: width, y1: top + plotH + 0.5, y2: top + plotH + 0.5, className: "cb-rule" }),
      data.goal && (0, import_react4.createElement)("line", { x1: 0, x2: width, y1: sy(data.goal.y), y2: sy(data.goal.y), className: "cb-goal" }),
      data.goal?.label && (0, import_react4.createElement)("text", { x: width, y: sy(data.goal.y) - 4, className: "cb-goalLabel", textAnchor: "end" }, (0, import_react4.createElement)("title", null, data.goal.label), fit(data.goal.label, width)),
      data.bars.map((bar, i) => {
        const cx = slot * i + slot / 2;
        const tip = multi ? `${label(bar.x)}: ${keys.filter((k) => bar.values?.[k] !== void 0).map((k) => `${k} ${formatNumber(bar.values[k], locale)}`).join(", ")}` : `${label(bar.x)}: ${formatNumber(bar.value, locale)}${data.unit ? ` ${data.unit}` : ""}`;
        let parts;
        if (!multi) parts = [{ y0: 0, y1: Math.max(0, bar.value), color: toneColor(void 0, 1), x: cx - barW / 2, w: barW }];
        else if (stacked) {
          let base = 0;
          parts = keys.map((key, k) => {
            const v = Math.max(0, bar.values?.[key] ?? 0);
            const part2 = { y0: base, y1: base + v, color: toneColor(void 0, k), x: cx - barW / 2, w: barW };
            base += v;
            return part2;
          });
        } else {
          const each = barW / keys.length;
          parts = keys.map((key, k) => ({ y0: 0, y1: Math.max(0, bar.values?.[key] ?? 0), color: toneColor(void 0, k), x: cx - barW / 2 + k * each, w: Math.max(1, each - 1) }));
        }
        return (0, import_react4.createElement)(
          "g",
          { key: i },
          (0, import_react4.createElement)("title", null, tip),
          parts.filter((p) => p.y1 > p.y0).map((p, k) => (0, import_react4.createElement)("rect", {
            key: k,
            x: p.x,
            width: p.w,
            y: sy(p.y1),
            height: Math.max(0.5, sy(p.y0) - sy(p.y1)),
            rx: Math.min(4, p.w / 3),
            fill: p.color,
            fillOpacity: multi ? 0.85 : 0.55
          })),
          showValues && (0, import_react4.createElement)("text", { x: cx, y: sy(peaks[i]) - 4, className: "cb-barValue", textAnchor: "middle" }, formatNumber(multi && !stacked ? peaks[i] : totals[i], locale, 1)),
          i % labelEvery === 0 && (0, import_react4.createElement)("text", { x: Math.min(Math.max(cx, textWidth(label(bar.x)) / 2), width - textWidth(label(bar.x)) / 2), y: height - 4, className: "cb-axis", textAnchor: "middle" }, label(bar.x))
        );
      })
    )),
    multi && (0, import_react4.createElement)(Legend, { items: keys.map((key, k) => ({ label: key, color: toneColor(void 0, k) })), locale })
  );
}
function arc(cx, cy, r, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.sin(start);
  const y0 = cy - r * Math.cos(start);
  const x1 = cx + r * Math.sin(end);
  const y1 = cy - r * Math.cos(end);
  return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}
function Donut({ data, locale, height }) {
  const [ref, width] = useWidth();
  const total = data.segments.reduce((sum, s) => sum + s.value, 0);
  const narrow = width < 340;
  const size = Math.max(90, Math.min(narrow ? 150 : 170, height - 8, narrow ? width * 0.6 : width * 0.42));
  const ring = size * 0.13;
  const r = size / 2 - ring / 2;
  let angle = 0;
  const gap = data.segments.filter((s) => s.value > 0).length > 1 ? 0.025 : 0;
  const segments = data.segments.map((s, i) => {
    const sweep = total > 0 ? s.value / total * Math.PI * 2 : 0;
    const seg = { ...s, color: toneColor(s.tone, i), start: angle + gap / 2, end: angle + sweep - gap / 2 };
    angle += sweep;
    return seg;
  });
  return (0, import_react4.createElement)(
    "div",
    { ref, className: `cb-donut${narrow ? " cb-donutNarrow" : ""}` },
    width > 0 && (0, import_react4.createElement)(
      "div",
      { className: "cb-donutRing", style: { width: size, height: size } },
      (0, import_react4.createElement)(
        "svg",
        { width: size, height: size, role: "img" },
        (0, import_react4.createElement)("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--dsw-alias-border-l2)", strokeWidth: ring }),
        segments.filter((s) => s.end > s.start).map((s, i) => (0, import_react4.createElement)(
          "path",
          { key: i, d: arc(size / 2, size / 2, r, s.start, s.end), fill: "none", stroke: s.color, strokeWidth: ring },
          (0, import_react4.createElement)("title", null, `${s.label}: ${formatNumber(s.value, locale)}${data.unit ? ` ${data.unit}` : ""}`)
        ))
      ),
      data.centre && (0, import_react4.createElement)(
        "div",
        { className: "cb-donutCentre" },
        (0, import_react4.createElement)("strong", null, data.centre.text),
        data.centre.sub && (0, import_react4.createElement)("span", null, data.centre.sub)
      )
    ),
    (0, import_react4.createElement)("table", { className: "cb-donutTable" }, (0, import_react4.createElement)("tbody", null, segments.map((s, i) => (0, import_react4.createElement)(
      "tr",
      { key: i },
      (0, import_react4.createElement)("td", null, (0, import_react4.createElement)("i", { style: { background: s.color } })),
      (0, import_react4.createElement)("td", { className: "cb-donutLabel" }, (0, import_react4.createElement)(Trunc, { text: s.label })),
      (0, import_react4.createElement)("td", { className: "cb-num" }, formatNumber(s.value, locale)),
      (0, import_react4.createElement)("td", { className: "cb-num cb-dim" }, total > 0 ? `${Math.round(s.value / total * 100)}%` : "\u2013")
    ))))
  );
}
var KIND_TONE = { due: "warn", health: "ok", event: "accent", home: "muted", money: "ok", travel: "accent" };
var KIND_ICON = { due: "receipt", health: "heart-pulse", event: "calendar", home: "house", money: "wallet", travel: "plane" };
function Timeline({ data, locale }) {
  const kit = useKit();
  const [ref, width] = useWidth();
  const from = toTime(data.from);
  const to = toTime(data.to);
  const days = Math.max(1, Math.round((to - from) / 864e5));
  const pad = 14;
  const plotW = Math.max(10, width - pad * 2);
  const sx = (time) => pad + (time - from) / (to - from) * plotW;
  const now = Date.now();
  const dayEvery = Math.max(1, Math.ceil(days / Math.max(1, Math.floor(plotW / 44))));
  const ticks = [];
  for (let i = 0; i <= days; i += dayEvery) ticks.push(from + i * 864e5);
  const points = (data.points ?? []).map((p) => ({ ...p, time: toTime(p.date) })).filter((p) => p.time >= from && p.time <= to).sort((a, b) => a.time - b.time);
  const rowEnds = [];
  const placed = points.map((p) => {
    const half = Math.min(90, textWidth(p.label)) / 2 + 4;
    const x = sx(p.time);
    let row = rowEnds.findIndex((end) => x - half > end);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(0);
    }
    rowEnds[row] = x + half;
    return { ...p, x, row };
  });
  const labelRows = Math.max(1, rowEnds.length);
  const tickH = 18;
  const pointY = tickH + 16;
  const labelTop = pointY + 18;
  const spansTop = labelTop + labelRows * 15 + 8;
  const spans = (data.spans ?? []).map((s) => ({ ...s, a: Math.max(from, toTime(s.from)), b: Math.min(to, toTime(s.to) + 864e5 - 1) })).filter((s) => s.b >= s.a);
  const height = spansTop + spans.length * 36 + 4;
  return (0, import_react4.createElement)("div", { ref, className: "cb-chart", style: { height } }, width > 0 && (0, import_react4.createElement)(
    "svg",
    { width, height, role: "img" },
    ticks.map((time, i) => (0, import_react4.createElement)(
      "g",
      { key: i },
      (0, import_react4.createElement)("line", { x1: sx(time), x2: sx(time), y1: tickH, y2: height, className: "cb-dayLine" }),
      (0, import_react4.createElement)("text", { x: sx(time), y: 11, className: "cb-axis", textAnchor: "middle" }, formatDay(time, locale, 0))
    )),
    now >= from && now <= to && (0, import_react4.createElement)("line", { x1: sx(now), x2: sx(now), y1: tickH - 2, y2: height, className: "cb-today" }),
    placed.map((p, i) => {
      const color = toneColor(p.tone ?? KIND_TONE[p.kind] ?? "accent");
      const text = fit(p.label, 90);
      return (0, import_react4.createElement)(
        "g",
        { key: i },
        (0, import_react4.createElement)("title", null, `${formatDay(p.time, locale, 0)} \xB7 ${p.label}`),
        KIND_ICON[p.kind] ? (0, import_react4.createElement)("g", { transform: `translate(${(p.x - 8).toFixed(1)},${pointY - 8})`, style: { color } }, (0, import_react4.createElement)(kit.Icon, { name: KIND_ICON[p.kind], size: 16 })) : (0, import_react4.createElement)("circle", { cx: p.x, cy: pointY, r: 5, fill: color }),
        p.row > 0 && (0, import_react4.createElement)("line", { x1: p.x, x2: p.x, y1: pointY + 8, y2: labelTop + p.row * 15 - 9, className: "cb-leader" }),
        (0, import_react4.createElement)("text", { x: p.x, y: labelTop + p.row * 15, className: "cb-pointLabel", textAnchor: "middle" }, text)
      );
    }),
    spans.map((s, i) => {
      const x = sx(s.a);
      const w = Math.max(6, sx(s.b) - x);
      const y = spansTop + i * 36;
      const full = `${s.label} \xB7 ${formatDay(toTime(s.from), locale, 0)} \u2013 ${formatDay(toTime(s.to), locale, 0)}`;
      return (0, import_react4.createElement)(
        "g",
        { key: `s${i}` },
        (0, import_react4.createElement)("title", null, full),
        (0, import_react4.createElement)("rect", { x, y, width: w, height: 12, rx: 6, fill: toneColor(s.tone ?? "accent"), fillOpacity: 0.22 }),
        (0, import_react4.createElement)("text", { x: Math.min(Math.max(x + w / 2, pad + Math.min(plotW, textWidth(full) * 0.55) / 2), width - pad - Math.min(plotW, textWidth(full) * 0.55) / 2), y: y + 26, className: "cb-spanLabel", textAnchor: "middle" }, fit(full, plotW))
      );
    })
  ));
}

// src/client/cards.js
var import_react5 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/steps.js
function ownOffset(at) {
  const m = /(?:([+-])(\d{2}):?(\d{2})|Z)$/.exec(String(at));
  if (!m) return null;
  return m[1] ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}
function part(locale, zone, time, style) {
  const parts = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: style }).formatToParts(time);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}
function browserOffset(zone, time) {
  const m = /([+-])(\d{1,2})(?::(\d{2}))?/.exec(part("und", zone, time, "shortOffset"));
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
}
function offsetName(offset) {
  const abs = Math.abs(offset);
  return `GMT${offset < 0 ? "\u2212" : "+"}${Math.floor(abs / 60)}${abs % 60 ? `:${String(abs % 60).padStart(2, "0")}` : ""}`;
}
function stepTimes(steps, locale, here = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  let lastDay = null;
  return steps.map((step) => {
    const time = new Date(step.at);
    const away = Boolean(step.zone) && step.zone !== here;
    const offset = away ? ownOffset(step.at) : null;
    const shown = offset === null ? time : new Date(time.getTime() + offset * 6e4);
    const zone = offset === null ? away ? step.zone : here : "UTC";
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(shown);
    const showDay = day !== lastDay;
    lastDay = day;
    let text = new Intl.DateTimeFormat(locale, { timeZone: zone, hour: "2-digit", minute: "2-digit", ...showDay ? { weekday: "short" } : {} }).format(shown);
    if (away) {
      text += " " + (offset === null || browserOffset(step.zone, time) === offset ? part(locale, step.zone, time, "short") : offsetName(offset));
    }
    return { time, text };
  });
}

// src/client/layout.js
var DEFAULT_SIZE = { summary: "wide", countdown: "large", timeline: "wide", stat: "small" };
var SPAN = { 6: { small: 2, medium: 3, large: 4, wide: 6 }, 2: { small: 1, medium: 1, large: 2, wide: 2 }, 1: {} };
var ROW = 4;
var GAP = 14;
function spanOf(type, size, tracks) {
  const chosen = type === "summary" ? "wide" : size ?? DEFAULT_SIZE[type] ?? "medium";
  return SPAN[tracks]?.[chosen] ?? 1;
}
var LIST_ROWS = 6;
function shownRows(rows, open, limit, live) {
  if (open || rows.length <= limit + 1) return rows;
  return rows.filter((row, i) => i < limit || row.key !== void 0 && (live?.freshRows?.has(row.key) || live?.rows?.[row.key] > 0));
}

// src/client/cards.js
var STATE_OF_TONE = { ok: "done", warn: "warning", bad: "error" };
var DIRECTION_ICON = { up: "trending-up", down: "trending-down" };
function StatBlock({ data, locale, compact, wash }) {
  const kit = useKit();
  return (0, import_react5.createElement)("div", { className: `cb-stats${compact ? " cb-statsCompact" : ""}` }, data.items.map((item, i) => (0, import_react5.createElement)(
    "div",
    { key: i, className: `cb-stat${item.strip ? " cb-statWide" : ""}` },
    (0, import_react5.createElement)("div", { className: "cb-statLabel" }, (0, import_react5.createElement)(Trunc, { as: "span", text: item.label }), i === 0 && wash && (0, import_react5.createElement)(kit.JustNow)),
    (0, import_react5.createElement)(
      "div",
      { className: "cb-statValue", style: item.tone ? { color: kit.toneColor(item.tone) } : void 0 },
      (0, import_react5.createElement)("span", null, formatNumber(item.value, locale)),
      item.unit && (0, import_react5.createElement)("small", null, item.unit)
    ),
    item.delta && (0, import_react5.createElement)(
      "div",
      { className: "cb-delta", style: { color: kit.toneColor(item.delta.tone ?? "muted") } },
      DIRECTION_ICON[item.delta.dir] && (0, import_react5.createElement)(kit.Icon, { name: DIRECTION_ICON[item.delta.dir], size: 13 }),
      (0, import_react5.createElement)("span", null, item.delta.text)
    ),
    item.progress && (0, import_react5.createElement)(
      "div",
      { className: "cb-statProgress" },
      (0, import_react5.createElement)(kit.Progress, { value: item.progress.value, max: item.progress.max, tone: item.tone ?? (item.progress.value > item.progress.max ? "warn" : "ok") }),
      item.progress.text && (0, import_react5.createElement)("div", { className: "cb-statSub" }, item.progress.text)
    ),
    item.spark && (0, import_react5.createElement)(kit.Spark, { values: item.spark, tone: item.tone ?? "accent", height: 28, area: true }),
    item.sub && (0, import_react5.createElement)(Trunc, { className: "cb-statSub", lines: 2, text: item.sub }),
    item.strip && (0, import_react5.createElement)("ol", { className: "cb-strip" }, item.strip.map((cell, j) => (0, import_react5.createElement)(
      "li",
      { key: j, "data-on": cell.on ? "true" : void 0 },
      (0, import_react5.createElement)("b", null, formatNumber(cell.value, locale, 1)),
      cell.icon && (0, import_react5.createElement)(kit.Icon, { name: cell.icon, size: 14 }),
      (0, import_react5.createElement)("span", null, cell.label)
    )))
  )));
}
function RowWhen({ row, locale, t }) {
  const kit = useKit();
  const now = kit.useNow();
  if (row.active) {
    if (isActive(row.active, now)) return (0, import_react5.createElement)(import_dsh_client_ui_primitives2.Tag, { tone: "info" }, t("now"));
    const from = Date.parse(row.active.from);
    if (from > now && new Date(from).toDateString() === new Date(now).toDateString()) return (0, import_react5.createElement)("span", { className: "cb-when" }, t("fromTime", { time: formatClock(from, locale) }));
  }
  return row.date ? (0, import_react5.createElement)("span", { className: "cb-when" }, (0, import_react5.createElement)(kit.RelativeDay, { date: row.date })) : null;
}
function Row({ lead, title, sub, meta, value, spark, row, index, washCount, fresh, rowActions, className }) {
  const kit = useKit();
  const now = kit.useNow();
  const wash = kit.useWash(washCount, row.key);
  return (0, import_react5.createElement)(
    "li",
    { className: ["cb-row", className, row.checked && "cb-done", isActive(row.active, now) && "cb-rowNow", wash].filter(Boolean).join(" ") },
    lead,
    (0, import_react5.createElement)(
      "div",
      { className: "cb-rowText" },
      (0, import_react5.createElement)("div", { className: "cb-rowTitle" }, fresh && (0, import_react5.createElement)(kit.NewDot), (0, import_react5.createElement)(Trunc, { as: "span", lines: 2, text: title })),
      sub && (0, import_react5.createElement)(Trunc, { className: "cb-rowSub", lines: 2, text: sub })
    ),
    spark,
    meta,
    value,
    row.actions && rowActions && (0, import_react5.createElement)("span", { className: "cb-rowActions" }, rowActions(index, row.actions, "buttons")),
    row.actions?.some((action) => action.kind === "step") && rowActions && (0, import_react5.createElement)("div", { className: "cb-rowSteps" }, rowActions(index, row.actions, "steps"))
  );
}
var rowLive = (live, row) => ({ washCount: live.rows?.[row.key] ?? 0, fresh: row.key !== void 0 && live.freshRows.has(row.key) });
function ListCard({ data, live, locale, t, rowActions }) {
  const kit = useKit();
  const [open, setOpen] = (0, import_react5.useState)(false);
  const rows = shownRows(data.rows, open, LIST_ROWS, live);
  const hidden = data.rows.length - rows.length;
  const checkable = data.rows.some((row) => "checked" in row);
  const progress = data.progress;
  return (0, import_react5.createElement)(
    "div",
    { className: "cb-list" },
    progress && (0, import_react5.createElement)(
      "div",
      { className: "cb-progress" },
      (0, import_react5.createElement)(
        kit.Ring,
        { value: progress.done, max: progress.total, size: 54, tone: progress.done >= progress.total ? "ok" : "accent", label: `${progress.done}/${progress.total}` },
        (0, import_react5.createElement)("span", null, String(progress.done)),
        (0, import_react5.createElement)("small", null, t("ofTotal", { total: progress.total }))
      ),
      (0, import_react5.createElement)(
        "div",
        { className: "cb-progressText" },
        progress.label && (0, import_react5.createElement)("div", { className: "cb-progressLabel" }, progress.label),
        progress.sub && (0, import_react5.createElement)("div", { className: "cb-rowSub" }, progress.sub)
      )
    ),
    data.rows.length === 0 ? (0, import_react5.createElement)("p", { className: "cb-muted" }, data.empty ?? t("listEmpty")) : (0, import_react5.createElement)("ul", { className: "cb-rows" }, rows.map((row, i) => (0, import_react5.createElement)(Row, {
      key: row.key ?? i,
      index: i,
      row,
      rowActions,
      ...rowLive(live, row),
      lead: [
        checkable && (0, import_react5.createElement)(CheckBox, { key: "check", checked: row.checked === true, label: t(row.checked ? "checked" : "unchecked") }),
        row.icon && (0, import_react5.createElement)(kit.Tile, { key: "tile", icon: row.icon, tone: row.tone ?? "muted", size: 30 })
      ],
      title: row.title,
      sub: row.sub,
      meta: (0, import_react5.createElement)(
        "span",
        { className: "cb-rowMeta" },
        row.chip && (0, import_react5.createElement)(import_dsh_client_ui_primitives2.Tag, { tone: kit.tagTone(row.chip.tone ?? "muted") }, row.chip.text),
        (0, import_react5.createElement)(RowWhen, { row, locale, t })
      )
    }))),
    (hidden > 0 || open) && data.rows.length > LIST_ROWS + 1 && (0, import_react5.createElement)(
      import_dsh_client_ui_primitives2.Button,
      { variant: "ghost", size: "sm", className: "cb-more", onClick: () => setOpen((value) => !value) },
      open ? t("showFewer") : t("showMore", { n: hidden })
    )
  );
}
function StatusCard({ data, live, locale, rowActions }) {
  const kit = useKit();
  return (0, import_react5.createElement)("ul", { className: "cb-rows" }, data.rows.map((row, i) => (0, import_react5.createElement)(Row, {
    key: row.key ?? i,
    index: i,
    row,
    rowActions,
    ...rowLive(live, row),
    className: "cb-statusRow",
    lead: row.icon ? (0, import_react5.createElement)(kit.Tile, { icon: row.icon, tone: row.tone, size: 28 }) : (0, import_react5.createElement)("span", { className: "cb-dotSlot" }, (0, import_react5.createElement)(import_dsh_client_ui_primitives2.StateDot, { state: STATE_OF_TONE[row.tone] ?? "idle" })),
    title: row.label,
    sub: row.sub,
    spark: row.spark && (0, import_react5.createElement)("span", { className: "cb-statusSpark" }, (0, import_react5.createElement)(kit.Spark, { values: row.spark, tone: row.tone === "ok" ? "ok" : row.tone, height: 22 })),
    value: (0, import_react5.createElement)("span", { className: "cb-statusValue", style: row.tone === "bad" || row.tone === "warn" ? { color: kit.toneColor(row.tone) } : void 0 }, formatNumber(row.value, locale))
  })));
}
var PARTS = [[5, "dayPart.morning"], [12, "dayPart.afternoon"], [18, "dayPart.evening"], [22, "dayPart.night"]];
function dayLine(now, locale, t) {
  const hour = new Date(now).getHours();
  const part2 = [...PARTS].reverse().find(([from]) => hour >= from)?.[1] ?? "dayPart.night";
  return { text: t("dayLine", { day: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(now), part: t(part2) }), dark: part2 === "dayPart.night" || part2 === "dayPart.evening" };
}
function SummaryBody({ card, locale, t, wash }) {
  const kit = useKit();
  const now = kit.useNow();
  const day = dayLine(now, locale, t);
  return (0, import_react5.createElement)(
    "div",
    { className: "cb-summary" },
    (0, import_react5.createElement)("div", { className: "cb-summaryLine" }, (0, import_react5.createElement)(kit.Icon, { name: day.dark ? "moon" : "sun-medium", size: 14 }), (0, import_react5.createElement)("span", null, `${day.text} \xB7 ${card.title}`), wash && (0, import_react5.createElement)(kit.JustNow)),
    (0, import_react5.createElement)("p", { className: "cb-summaryText" }, card.data.text),
    card.data.chips?.length > 0 && (0, import_react5.createElement)("div", { className: "cb-chips" }, card.data.chips.map((chip, i) => (0, import_react5.createElement)(kit.Chip, { key: i, icon: chip.icon, tone: chip.tone ?? "muted", to: chip.to }, chip.text)))
  );
}
function CountdownBody({ card, locale }) {
  const kit = useKit();
  const now = kit.useNow();
  const data = card.data;
  const times = data.steps ? stepTimes(data.steps, locale) : [];
  const next = times.findIndex((step) => step.time > now);
  return (0, import_react5.createElement)(
    "div",
    { className: "cb-countdown" },
    (0, import_react5.createElement)(
      "div",
      { className: "cb-countdownHead" },
      (0, import_react5.createElement)(kit.Countdown, { to: data.to }),
      (0, import_react5.createElement)(
        "div",
        { className: "cb-countdownText" },
        (0, import_react5.createElement)("div", null, data.label),
        data.sub && (0, import_react5.createElement)("div", { className: "cb-rowSub" }, data.sub)
      )
    ),
    times.length > 0 && (0, import_react5.createElement)("ol", { className: "cb-track" }, data.steps.map((step, i) => (0, import_react5.createElement)(
      "li",
      { key: i, "data-state": i === next ? "next" : times[i].time <= now ? "past" : "later" },
      (0, import_react5.createElement)("i", { "aria-hidden": true }),
      (0, import_react5.createElement)("b", null, times[i].text),
      (0, import_react5.createElement)("span", null, step.sub ? `${step.label} \xB7 ${step.sub}` : step.label)
    )))
  );
}

// src/client/quote.js
function withUnit(value, unit, locale) {
  return `${formatNumber(value, locale)}${unit ? ` ${unit}` : ""}`;
}
function statLines(data, locale) {
  return data.items.map((item) => `${item.label}: ${withUnit(item.value, item.unit, locale)}${item.delta ? ` (${item.delta.text})` : ""}${item.sub ? ` \xB7 ${item.sub}` : ""}${item.progress?.text ? ` \xB7 ${item.progress.text}` : ""}`);
}
function listRowLine(row) {
  const box = "checked" in row ? row.checked ? "\u2611 " : "\u2610 " : "";
  return `${box}${row.title}${row.sub ? ` \xB7 ${row.sub}` : ""}${row.date ? ` \xB7 ${row.date}` : ""}${row.chip ? ` [${row.chip.text}]` : ""}`;
}
function statusRowLine(row, locale) {
  return `${row.label}: ${formatNumber(row.value, locale)}${row.sub ? ` \xB7 ${row.sub}` : ""}`;
}
function summaryLines(card, locale, t) {
  const data = card.data;
  const lines = card.stat ? statLines(card.stat, locale) : [];
  switch (card.type) {
    case "summary":
      return [data.text, ...(data.chips ?? []).map((chip) => chip.to ? `${chip.text} (${chip.to})` : chip.text)];
    case "countdown":
      return [`${data.label}: ${data.to}`, ...data.sub ? [data.sub] : [], ...(data.steps ?? []).map((step) => `${step.at} ${step.label}${step.sub ? ` \xB7 ${step.sub}` : ""}`)];
    case "stat":
      return statLines(data, locale);
    case "line":
      for (const series of data.series) {
        const last = [...series.points].reverse().find((p) => typeof p.y === "number");
        if (last) lines.push(t("summary.latest", { name: series.name || t("summary.latestName"), value: withUnit(last.y, data.unit, locale), x: last.x, n: series.points.length, from: series.points[0].x }));
      }
      if (data.goal?.y !== void 0) lines.push(t("summary.goal", { value: withUnit(data.goal.y, data.unit, locale) }));
      return lines;
    case "bar":
      return lines.concat(data.bars.slice(-10).map((bar) => `${bar.x}: ${bar.values ? Object.entries(bar.values).map(([k, v]) => `${k} ${formatNumber(v, locale)}`).join(", ") : withUnit(bar.value, data.unit, locale)}`));
    case "donut": {
      const total = data.segments.reduce((sum, s) => sum + s.value, 0);
      return lines.concat(data.segments.map((s) => `${s.label}: ${withUnit(s.value, data.unit, locale)}${total > 0 ? ` (${Math.round(s.value / total * 100)}%)` : ""}`));
    }
    case "list":
      return lines.concat(data.progress ? [t("summary.progress", data.progress)] : [], data.rows.slice(0, 15).map(listRowLine));
    case "timeline":
      return lines.concat((data.points ?? []).map((p) => `${p.date}: ${p.label}`), (data.spans ?? []).map((s) => `${s.from} \u2013 ${s.to}: ${s.label}`));
    case "status":
      return lines.concat(data.rows.map((row) => statusRowLine(row, locale)));
    default:
      return lines;
  }
}

// src/client/words.js
var import_react6 = require("react");
var messageRequests = /* @__PURE__ */ new Map();
function fetchMessages(tag) {
  if (!messageRequests.has(tag)) {
    const request = fetch(api(`locale?tag=${encodeURIComponent(tag)}`), { credentials: "same-origin" }).then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))).then((body) => body.messages);
    request.catch(() => messageRequests.delete(tag));
    messageRequests.set(tag, request);
  }
  return messageRequests.get(tag);
}
var LANGUAGE_KEY = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/;
function pickText(value, active) {
  if (typeof value !== "object" || value === null) return value;
  const byId = new Map(Object.entries(value).map(([id, text]) => [id.toLowerCase(), text]));
  const tag = String(active ?? "en").toLowerCase();
  const primary = tag.split("-")[0];
  return byId.get(tag) ?? byId.get(primary) ?? [...byId].find(([id]) => id.split("-")[0] === primary)?.[1] ?? byId.get("en") ?? [...byId.values()][0] ?? "";
}
function pickCard(card, active) {
  const withPrompt = (payload) => payload && "prompt" in payload ? { ...payload, prompt: pickText(payload.prompt, active) } : payload;
  const walk = (value) => {
    if (Array.isArray(value)) return value.map(walk);
    if (typeof value !== "object" || value === null) return value;
    const keys = Object.keys(value);
    if (keys.length > 0 && "en" in value && keys.every((key) => LANGUAGE_KEY.test(key)) && keys.every((key) => typeof value[key] === "string")) return pickText(value, active);
    return Object.fromEntries(keys.map((key) => [key, key === "payload" ? withPrompt(value[key]) : walk(value[key])]));
  };
  return walk(card);
}
var fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, key) => key in params ? String(params[key]) : match);
function intlTag(active) {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(active).length > 0 ? active : "en";
  } catch {
    return "en";
  }
}
var translator = (messages) => (key, params) => {
  const text = messages[key] ?? key;
  return params ? fill(text, params) : text;
};
var clientCtx = null;
var setClientContext = (ctx) => {
  clientCtx = ctx;
};
function useActiveLocale() {
  const subscribe = (0, import_react6.useCallback)((listener) => clientCtx.locale.subscribe(listener), []);
  const active = (0, import_react6.useSyncExternalStore)(subscribe, () => clientCtx.locale.getSnapshot().active);
  const [loaded, setLoaded] = (0, import_react6.useState)(null);
  const [attempt, setAttempt] = (0, import_react6.useState)(0);
  (0, import_react6.useEffect)(() => {
    let live = true;
    let timer;
    fetchMessages(active).then(
      (messages) => {
        if (live) setLoaded({ active, messages });
      },
      () => {
        if (live) timer = setTimeout(() => setAttempt((count) => count + 1), 3e3);
      }
    );
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [active, attempt]);
  return (0, import_react6.useMemo)(() => ({ active: loaded?.active ?? active, ready: loaded !== null, intl: intlTag(loaded?.active ?? active), t: translator(loaded?.messages ?? {}) }), [loaded, active]);
}

// src/client/card.js
var CHART_HEIGHT = 150;
function useRowSpan() {
  const ref = (0, import_react7.useRef)(null);
  const [rows, setRows] = (0, import_react7.useState)(0);
  (0, import_react7.useLayoutEffect)(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return void 0;
    const measure = () => setRows(Math.ceil((el.getBoundingClientRect().height + GAP) / ROW));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rows];
}
var CHARTS = { line: LineChart, bar: BarChart, donut: Donut, timeline: Timeline };
function statesOf(presses, row) {
  const states = {};
  for (const press of presses ?? []) if (press.row === row) states[press.id] = press.state;
  return states;
}
function Body({ card, live, wash, locale, t, rowActions }) {
  const data = card.data;
  switch (card.type) {
    case "stat":
      return (0, import_react7.createElement)(StatBlock, { data, locale, wash });
    case "list":
      return (0, import_react7.createElement)(ListCard, { data, live, locale, t, rowActions });
    case "status":
      return (0, import_react7.createElement)(StatusCard, { data, live, locale, rowActions });
    case "countdown":
      return (0, import_react7.createElement)(CountdownBody, { card, locale });
    default: {
      const Chart = CHARTS[card.type];
      if (Chart === void 0) return null;
      return (0, import_react7.createElement)(Chart, { data, locale, height: card.type === "bar" ? 130 : card.type === "donut" ? 160 : CHART_HEIGHT });
    }
  }
}
function Card({ entry, live, boardId, assistant, tracks, active, locale, t, press }) {
  const kit = useKit();
  const actions = useButtons();
  const now = kit.useNow();
  const wash = kit.useWash(live.wash, entry.id);
  const [ref, rows] = useRowSpan();
  const style = { gridColumn: `span ${spanOf(entry.card?.type, entry.size, tracks)}`, gridRowEnd: rows > 0 ? `span ${rows}` : void 0 };
  if (!entry.card) {
    return (0, import_react7.createElement)(
      "section",
      { ref, className: "cb-card cb-cardError", style },
      (0, import_react7.createElement)("header", { className: "cb-cardHead" }, (0, import_react7.createElement)("h3", { title: entry.id }, entry.id)),
      (0, import_react7.createElement)("p", { className: "cb-errorText" }, t("cardError")),
      (0, import_react7.createElement)("ul", { className: "cb-problems" }, (entry.problems ?? []).map((p, i) => (0, import_react7.createElement)("li", { key: i }, p)))
    );
  }
  const card = pickCard(entry.card, active);
  if (card.type === "countdown" && card.data.expiresAt && Date.parse(card.data.expiresAt) <= now) return null;
  const updated = Date.parse(card.updatedAt);
  const age = Math.max(0, (now - updated) / 1e3);
  const stale = typeof card.staleAfter === "number" && age > card.staleAfter;
  const external = card.link && /^https?:/i.test(card.link);
  const about = (row, line) => ({
    source: OWNER,
    title: card.title,
    lines: row === void 0 ? summaryLines(card, locale, t).slice(0, 15) : [line],
    context: { board: boardId, card: entry.id, ...row === void 0 ? {} : { row }, type: card.type, updatedAt: card.updatedAt }
  });
  const rowLine = (row) => card.type === "status" ? statusRowLine(card.data.rows[row], locale) : listRowLine(card.data.rows[row]);
  const askName = assistant ? t("action.chatNamed", { name: assistant }) : void 0;
  const named = (list) => assistant ? list?.map((action) => action.kind === "chat" && action.label === void 0 ? { ...action, label: askName } : action) : list;
  const onPress = (target) => (action, extra) => press(action, extra, { card: entry.id, ...target });
  const rowActions = actions && ((row, list, part2) => (0, import_react7.createElement)(actions.ActionBar, {
    actions: named(list),
    part: part2,
    states: statesOf(entry.presses, row),
    compact: true,
    about: about(row, rowLine(row)),
    onPress: onPress({ row })
  }));
  const chat = actions && (0, import_react7.createElement)("span", { className: "cb-cardChat" }, (0, import_react7.createElement)(actions.ActionButton, { action: { kind: "chat", id: "_chat", label: askName }, compact: true, about: about() }));
  const others = card.actions?.filter((action) => action.kind !== "step") ?? [];
  const steps = card.actions?.some((action) => action.kind === "step") && (0, import_react7.createElement)(kit.Suggested, { actions: card.actions, about: about(), states: statesOf(entry.presses, void 0), onPress: onPress({}) });
  const footer = actions && others.length > 0 && (0, import_react7.createElement)("footer", { className: "cb-cardActions" }, (0, import_react7.createElement)(actions.ActionBar, {
    actions: named(others),
    part: "buttons",
    states: statesOf(entry.presses, void 0),
    about: about(),
    onPress: onPress({})
  }));
  const className = ["cb-card", `cb-card-${card.type}`, stale && "cb-cardStale", wash].filter(Boolean).join(" ");
  if (card.type === "summary") {
    return (0, import_react7.createElement)(
      "section",
      { ref, className, style, "data-type": card.type },
      (0, import_react7.createElement)("div", { className: "cb-summaryMain" }, (0, import_react7.createElement)(SummaryBody, { card, locale, t, wash: wash !== "" }), steps, footer),
      (0, import_react7.createElement)("div", { className: "cb-summaryAside" }, live.fresh && (0, import_react7.createElement)(kit.NewDot), chat)
    );
  }
  const statBlock = card.stat && (0, import_react7.createElement)(StatBlock, { data: card.stat, locale, compact: true, wash: wash !== "" });
  const body = (0, import_react7.createElement)(Body, { card, live, wash: wash !== "", locale, t, rowActions });
  return (0, import_react7.createElement)(
    "section",
    { ref, className, style, "data-type": card.type },
    (0, import_react7.createElement)(
      "header",
      { className: "cb-cardHead" },
      card.icon && (0, import_react7.createElement)(kit.Tile, { icon: card.icon, tone: card.tone ?? "muted", size: 30 }),
      (0, import_react7.createElement)(Trunc, { as: "h3", text: card.title }),
      live.fresh && (0, import_react7.createElement)(kit.NewDot),
      wash !== "" && card.type !== "stat" && !card.stat && (0, import_react7.createElement)(kit.JustNow),
      stale && (0, import_react7.createElement)(
        "span",
        { className: "cb-stale", title: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(updated) },
        (0, import_react7.createElement)(import_dsh_client_ui_primitives3.Tag, { tone: "warning" }, t("stale", { age: formatAge(age, locale) }))
      ),
      card.link && (0, import_react7.createElement)("a", { className: "cb-cardLink", href: card.link, title: t("open"), "aria-label": t("open"), ...external ? { target: "_blank", rel: "noopener noreferrer" } : {} }, (0, import_react7.createElement)(import_dsh_client_ui_primitives3.IconRightUpOutlineRegular, { size: 14 })),
      chat
    ),
    statBlock && ["line", "bar", "donut"].includes(card.type) ? (0, import_react7.createElement)("div", { className: "cb-split" }, statBlock, (0, import_react7.createElement)("div", { className: "cb-cardBody" }, body)) : [statBlock && (0, import_react7.createElement)("div", { key: "stat" }, statBlock), (0, import_react7.createElement)("div", { key: "body", className: "cb-cardBody" }, body)],
    steps,
    footer
  );
}

// src/client/live-state.js
var EMPTY = Object.freeze({ wash: 0, rows: Object.freeze({}), fresh: false, freshRows: /* @__PURE__ */ new Set() });
var liveOf = (live, id) => live[id] ?? EMPTY;
function nextLive(before, after, live) {
  const old = new Map((before?.cards ?? []).map((entry) => [entry.id, entry]));
  const next = {};
  for (const entry of after.cards) {
    const was = old.get(entry.id);
    const state = liveOf(live, entry.id);
    let { wash, rows } = state;
    if (before !== null && entry.version !== void 0 && was?.version !== entry.version) {
      const changed = was === void 0 ? [] : Object.keys(entry.rows ?? {}).filter((key) => was.rows?.[key] !== entry.rows[key]);
      if (changed.length > 0) rows = { ...rows, ...Object.fromEntries(changed.map((key) => [key, (rows[key] ?? 0) + 1])) };
      else wash += 1;
    }
    const freshRows = entry.fresh?.rows?.length ? /* @__PURE__ */ new Set([...state.freshRows, ...entry.fresh.rows]) : state.freshRows;
    next[entry.id] = { wash, rows, fresh: state.fresh || entry.fresh?.card === true, freshRows };
  }
  return next;
}
function withCard(board, id, entry) {
  if (entry === null) return { ...board, cards: board.cards.filter((card) => card.id !== id) };
  const present = board.cards.some((card) => card.id === id);
  return { ...board, cards: present ? board.cards.map((card) => card.id === id ? entry : card) : [...board.cards, entry] };
}
function seenReport(board) {
  const cards = {};
  for (const entry of board.cards) if (entry.version !== void 0) cards[entry.id] = entry.rows ? { v: entry.version, rows: entry.rows } : { v: entry.version };
  return { board: board.id, cards };
}

// src/client/page.js
var STORE_KEY = "dsh-card-board:board";
var SEEN_AFTER_MS = 2500;
function requestError(status, body) {
  const error = new Error(body?.error ?? `HTTP ${status}`);
  error.status = status;
  return error;
}
async function getJson(path, etag) {
  const response = await fetch(api(path), { cache: "no-store", credentials: "same-origin", headers: etag ? { "if-none-match": etag } : {} });
  if (response.status === 304) return { notModified: true };
  let body = null;
  try {
    body = await response.json();
  } catch {
  }
  if (!response.ok) throw requestError(response.status, body);
  return { body, etag: response.headers.get("etag") };
}
var ERROR_KEYS = { 403: "error.forbidden", 404: "error.notFound", 409: "error.gone", 503: "error.noProvider" };
var errorText = (error, t) => error.status === void 0 ? error.message : t(ERROR_KEYS[error.status] ?? "error.http", { status: error.status });
function useTracks() {
  const [ref, width] = useWidth();
  return [ref, width >= 900 ? 6 : width >= 560 ? 2 : 1];
}
var visible = () => document.visibilityState === "visible";
function BoardsPage() {
  const kit = useKit();
  const { active, intl: locale, ready, t } = useActiveLocale();
  const [boards, setBoards] = (0, import_react8.useState)(null);
  const [listError, setListError] = (0, import_react8.useState)(null);
  const [selected, setSelected] = (0, import_react8.useState)(() => {
    try {
      return localStorage.getItem(STORE_KEY);
    } catch {
      return null;
    }
  });
  const [view, setView] = (0, import_react8.useState)({ board: null, live: {} });
  const [boardError, setBoardError] = (0, import_react8.useState)(null);
  const [pollSeconds, setPollSeconds] = (0, import_react8.useState)(30);
  const etag = (0, import_react8.useRef)(null);
  const [gridRef, tracks] = useTracks();
  const currentRef = (0, import_react8.useRef)(null);
  const translateRef = (0, import_react8.useRef)(t);
  translateRef.current = t;
  const board = view.board;
  const boardRef = (0, import_react8.useRef)(null);
  boardRef.current = board;
  const show = (0, import_react8.useCallback)((next) => setView((prev) => ({
    board: next,
    live: next === null ? {} : nextLive(prev.board?.id === next.id ? prev.board : null, next, prev.board?.id === next.id ? prev.live : {})
  })), []);
  const loadList = (0, import_react8.useCallback)(async () => {
    try {
      const { body } = await getJson("boards");
      setBoards(body.boards);
      setPollSeconds(body.pollSeconds ?? 30);
      setListError(null);
    } catch (error) {
      setListError(error);
    }
  }, []);
  const current = boards?.some((b) => b.id === selected) ? selected : boards?.[0]?.id ?? null;
  const loadBoard = (0, import_react8.useCallback)(async (id, fresh) => {
    if (!id) return;
    try {
      const result = await getJson(`board?id=${encodeURIComponent(id)}`, fresh ? null : etag.current);
      setBoardError(null);
      if (result.notModified || currentRef.current !== id) return;
      etag.current = result.etag;
      show(result.body);
    } catch (error) {
      if (error.status === 403 || error.status === 404) {
        show(null);
        setBoardError(error);
        loadList();
      }
    }
  }, [loadList, show]);
  const loadCard = (0, import_react8.useCallback)(async (boardId, id) => {
    try {
      if (boardRef.current?.id !== boardId || !boardRef.current.cards.some((card) => card.id === id)) return loadBoard(boardId, false);
      const { body } = await getJson(`card?board=${encodeURIComponent(boardId)}&id=${encodeURIComponent(id)}`);
      setView((prev) => {
        if (prev.board?.id !== boardId) return prev;
        const next = withCard(prev.board, id, body);
        return { board: next, live: nextLive(prev.board, next, prev.live) };
      });
    } catch (error) {
      if (error.status === 404) setView((prev) => prev.board?.id === boardId ? { ...prev, board: withCard(prev.board, id, null) } : prev);
      else loadBoard(boardId, false);
    }
  }, [loadBoard]);
  const onEvent = (0, import_react8.useCallback)((message) => {
    const id = currentRef.current;
    if (!id) return;
    if (message.type === "card") loadCard(id, message.id);
    else if (message.type === "board" || message.type === "hello") loadBoard(id, false);
    else if (message.type === "gone") {
      show(null);
      setBoardError(requestError(403));
      loadList();
    }
  }, [loadBoard, loadCard, loadList, show]);
  const status = kit.useEventStream(current ? `api/card-board/events?board=${encodeURIComponent(current)}` : null, onEvent);
  const press = (0, import_react8.useCallback)(async (action, extra, target) => {
    const response = await fetch(api("action"), {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ board: currentRef.current, ...target, id: action.id, ...extra })
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(errorText(requestError(response.status, body), translateRef.current));
    loadBoard(currentRef.current, false);
    return body;
  }, [loadBoard]);
  (0, import_react8.useEffect)(() => {
    loadList();
  }, [loadList]);
  (0, import_react8.useEffect)(() => {
    currentRef.current = current;
    if (!current) return;
    etag.current = null;
    setView((prev) => prev.board?.id === current ? prev : { board: null, live: {} });
    loadBoard(current, true);
  }, [current, loadBoard]);
  const waiting = board?.cards.some((entry) => entry.presses?.some((p) => p.state === "pending")) === true;
  (0, import_react8.useEffect)(() => {
    if (!current || status === "live" && !waiting) return void 0;
    let ticks = 0;
    const timer = setInterval(() => {
      if (!visible()) return;
      loadBoard(current, false);
      if (++ticks % 10 === 0) loadList();
    }, Math.max(5, pollSeconds) * 1e3);
    const onVisible = () => {
      if (visible()) {
        loadBoard(current, false);
        loadList();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [current, status, waiting, pollSeconds, loadBoard, loadList]);
  const reported = (0, import_react8.useRef)("");
  (0, import_react8.useEffect)(() => {
    if (!board) return void 0;
    const report = seenReport(board);
    const text = JSON.stringify(report);
    if (text === reported.current) return void 0;
    const timer = setTimeout(() => {
      if (!visible()) return;
      fetch(api("seen"), { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: text }).then((response) => {
        if (response.ok) reported.current = text;
      }, () => {
      });
    }, SEEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [board]);
  const choose = (id) => {
    setSelected(id);
    try {
      localStorage.setItem(STORE_KEY, id);
    } catch {
    }
  };
  const newest = board?.cards.reduce((max, entry) => {
    const time = entry.card ? Date.parse(entry.card.updatedAt) : NaN;
    return Number.isFinite(time) && time > max ? time : max;
  }, 0);
  const titleOf = (entry) => pickText(entry.title, active);
  if (!ready) return (0, import_react8.createElement)("div", { className: "cb-page" });
  let content;
  if (listError) content = (0, import_react8.createElement)("p", { className: "cb-notice" }, errorText(listError, t));
  else if (boards === null) content = (0, import_react8.createElement)("p", { className: "cb-muted" }, t("loading"));
  else if (boards.length === 0) content = (0, import_react8.createElement)("div", { className: "cb-empty" }, (0, import_react8.createElement)("p", { className: "cb-emptyTitle" }, t("emptyTitle")), (0, import_react8.createElement)("p", { className: "cb-muted" }, t("emptyHint")));
  else if (boardError) content = (0, import_react8.createElement)("p", { className: "cb-notice" }, errorText(boardError, t));
  else if (!board) content = (0, import_react8.createElement)("p", { className: "cb-muted" }, t("loading"));
  else content = (0, import_react8.createElement)(
    import_react8.Fragment,
    null,
    board.problems?.length > 0 && (0, import_react8.createElement)("div", { className: "cb-notice" }, t("boardProblems"), (0, import_react8.createElement)("ul", { className: "cb-problems" }, board.problems.map((p, i) => (0, import_react8.createElement)("li", { key: i }, p)))),
    board.cards.length === 0 && (0, import_react8.createElement)("p", { className: "cb-muted" }, t("noCards")),
    (0, import_react8.createElement)(
      "div",
      { className: "cb-grid", style: { gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))`, gridAutoRows: `${ROW}px`, columnGap: GAP } },
      board.cards.map((entry) => (0, import_react8.createElement)(Card, { key: entry.id, entry, live: liveOf(view.live, entry.id), boardId: board.id, assistant: board.assistant, tracks, active, locale, t, press }))
    )
  );
  return (0, import_react8.createElement)(
    "div",
    { className: "cb-page" },
    (0, import_react8.createElement)(
      "div",
      { className: "cb-content", ref: gridRef },
      (0, import_react8.createElement)(
        "div",
        { className: "cb-heading" },
        (0, import_react8.createElement)("h1", null, boards?.length === 1 ? titleOf(boards[0]) : t("title")),
        board && (0, import_react8.createElement)("div", { className: "cb-sub" }, (0, import_react8.createElement)(kit.LiveStatus, { status, updatedAt: newest || void 0 }))
      ),
      boards && boards.length > 1 && (0, import_react8.createElement)("div", { className: "cb-tabs", role: "tablist" }, boards.map((b) => (0, import_react8.createElement)(import_dsh_client_ui_primitives4.Pill, { key: b.id, active: b.id === current, role: "tab", "aria-selected": b.id === current, title: titleOf(b), onClick: () => choose(b.id) }, titleOf(b)))),
      content
    )
  );
}

// src/client/index.js
var NS = "dsh-card-board";
var PANEL = "dsh-card-board";
function SidebarIcon({ size }) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  return (0, import_react9.createElement)(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true, focusable: "false" },
    (0, import_react9.createElement)("rect", { x: 1.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    (0, import_react9.createElement)("rect", { x: 8.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    (0, import_react9.createElement)("rect", { x: 1.75, y: 8.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    (0, import_react9.createElement)("path", { d: "M9 13.5l1.6-2 1.4 1 2-2.8", ...stroke })
  );
}
function Page() {
  return useKit() === null ? (0, import_react9.createElement)("div", { className: "cb-page" }) : (0, import_react9.createElement)(BoardsPage);
}
var inject = ["slots", "locale"];
function apply(ctx) {
  setClientContext(ctx);
  let forget = () => {
  };
  ctx.effect(() => {
    let live = true;
    let loadedFor = null;
    const load = () => {
      const active = ctx.locale.getSnapshot().active;
      if (active === loadedFor) return;
      loadedFor = active;
      fetchMessages(active).then((messages) => {
        if (!live) return;
        forget();
        try {
          forget = ctx.locale.register(NS, active, { panel: messages.panel });
        } catch (error) {
          console.warn("card-board: sidebar name not registered:", error);
        }
      }, () => {
        if (live) {
          loadedFor = null;
          setTimeout(load, 3e3);
        }
      });
    };
    load();
    const stop = ctx.locale.subscribe(load);
    return () => {
      live = false;
      stop();
      forget();
    };
  }, "card-board: sidebar words");
  const sidebarT = ctx.locale.bind(NS);
  ctx.inject(["uiKit"], (scope) => {
    scope.effect(() => {
      kitStore.set(scope.uiKit);
      return () => kitStore.set(null);
    }, "card-board: shared pieces");
  });
  ctx.inject(["uiActions"], (scope) => {
    scope.effect(() => {
      buttonsStore.set(scope.uiActions);
      const unregister = scope.uiActions.registerSource({ id: OWNER, name: () => sidebarT("panel"), icon: SidebarIcon });
      return () => {
        unregister();
        buttonsStore.set(null);
      };
    }, "card-board: shared buttons");
  });
  ctx.effect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return () => {
    };
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.dataset.plugin = OWNER;
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => tag.remove();
  }, "card-board: styles");
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL, locale: NS }, Page));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: PANEL,
    order: 13,
    locale: NS,
    label: () => {
      const text = sidebarT("panel");
      return text === "panel" ? "" : text;
    }
  }, SidebarIcon));
}

    return module.exports
  },
})
