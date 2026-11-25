/* @soffits/dsh-card-board 0.19.0: built from src/client/. Do not edit. */
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
var import_react16 = require("react");

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
/* an item with an icon: a big tinted tile beside its label and number, the rest under the words */
.cb-stats{--cb-statTile:48px}
.cb-statsCompact{--cb-statTile:44px}
.cb-statsIcons{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,136px),1fr));gap:16px 24px}
.cb-statsIcons>.cb-statWide{grid-column:1/-1}
.cb-statIcon .cb-statProgress{min-width:0}
.cb-statIcon{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:12px;row-gap:2px;align-content:start}
.cb-statIcon>*{grid-column:2}
.cb-statIcon>.cb-statTile{grid-column:1;grid-row:1/span 2;align-self:center}
.cb-statIcon>.cb-strip{grid-column:1/-1}
.cb-statTile.uk-tile,.cb-countdownTile.uk-tile{width:var(--cb-statTile);height:var(--cb-statTile);border-radius:calc(var(--cb-statTile) * .3)}
.cb-statTile svg,.cb-countdownTile svg{width:calc(var(--cb-statTile) * .54);height:calc(var(--cb-statTile) * .54)}
.cb-countdownHead{--cb-statTile:52px}
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
.cb-rowText{flex:1 1 10em;min-width:0}
.cb-rowTitle{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:20px}
.cb-rowSub{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-done .cb-rowTitle{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}
.cb-rowMeta{display:flex;align-items:center;gap:8px;min-width:0;max-width:45%}
.cb-rowMeta>*{min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-when{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}
.cb-rowActions{display:inline-flex;flex-wrap:wrap;justify-content:flex-end;min-width:0}
.cb-rowSteps{flex-basis:100%;min-width:0;padding-left:41px}
.cb-doneBox{flex:none;display:inline-flex;align-items:center;min-width:28px;min-height:28px;justify-content:center}
.cb-toastUndo{display:inline-block;min-width:40px;min-height:40px;margin:-12px -6px;padding:0 6px;line-height:40px;text-align:center;-webkit-user-select:none;user-select:none;touch-action:manipulation}
.cb-visuallyHidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
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
.cb-row{display:grid;grid-template-columns:auto minmax(0,1fr) fit-content(50%);align-items:center;column-gap:10px}
.cb-row>.cb-rowText{grid-column:2}
.cb-row>.cb-rowMeta,.cb-row>.cb-statusSpark{grid-column:2/-1;max-width:none;justify-content:flex-start}
.cb-row>.cb-rowActions{grid-column:3;grid-row:1}
.cb-row>.cb-statusValue{grid-column:3;grid-row:1}
.cb-statusRow>.cb-rowActions{grid-row:2}
.cb-row>.cb-rowSteps{grid-column:2/-1;padding-left:0}
.cb-row>.cb-doneBox+.uk-tile{display:none}
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
.cb-stats{--cb-statTile:42px}
.cb-statsIcons{column-gap:16px}
.cb-statIcon{column-gap:10px}
.cb-statsPaired>.cb-statIcon:not(.cb-statWide){grid-template-columns:minmax(0,1fr)}
.cb-statsPaired>.cb-statIcon:not(.cb-statWide)>*{grid-column:1}
.cb-statsPaired>.cb-statIcon:not(.cb-statWide)>.cb-statTile{grid-row:auto;align-self:start;margin-bottom:6px}
.cb-statsCompact{--cb-statTile:40px}
.cb-countdownHead{--cb-statTile:46px}
}
/* Touch and pointer: cards and rows answer a hover and a press, in DSH's own interactive colours and motion. */
.cb-card{transition:box-shadow var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease),transform var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)}
.cb-cardOpenable{cursor:pointer}
button.cb-cardOpen{border:0;background:transparent;padding:0;font:inherit;cursor:pointer}
@media (hover:hover) and (pointer:fine){.cb-cardOpen{opacity:0;transition:opacity var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)}.cb-card:hover .cb-cardOpen,.cb-cardOpen:focus-visible{opacity:1}}
.cb-cardOpenable:active{transform:scale(.995)}
.cb-rowOpens{cursor:pointer}
.cb-row{transition:background-color var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)}
.cb-rowOpens:active{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.cb-rowOpens:focus-visible,.cb-cardOpen:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
.cb-statLink{color:inherit;text-decoration:none;border-radius:10px;margin:-4px -6px;padding:4px 6px;transition:background-color var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)}
.cb-statLink:active{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
@media (hover:hover) and (pointer:fine){
.cb-cardOpenable:hover{box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3),0 2px 10px color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent)}
.cb-row:hover,.cb-statLink:hover{background:var(--dsw-alias-interactive-bg-hover)}
/* a row's buttons show on hover or focus; on touch they are always there */
.cb-row .cb-rowActions{opacity:0;transition:opacity var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)}
.cb-row:hover .cb-rowActions,.cb-row:focus-within .cb-rowActions{opacity:1}
}
/* Motion: a changed card settles, rows that open in a list fade in, numbers ease (motion.js). */
@keyframes cb-settle{from{transform:translateY(3px);opacity:.55}to{transform:none;opacity:1}}
@keyframes cb-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.cb-card.uk-wash .cb-cardBody,.cb-card.uk-wash .cb-stats{animation:cb-settle var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease) both}
.cb-rowLate{animation:cb-in var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease) both}
@media (prefers-reduced-motion:reduce){.cb-card,.cb-row,.cb-statLink{transition:none}.cb-card.uk-wash .cb-cardBody,.cb-card.uk-wash .cb-stats,.cb-rowLate{animation:none}.cb-cardOpenable:active{transform:none}}
/* What is chrome is not selectable (heads, tags, axes, legends, strips, buttons, times); titles, notes and numbers are. */
.cb-chips,.cb-summaryLine,.cb-summaryAside,.cb-cardHead,.cb-tabs,.cb-heading .cb-sub,.cb-rowMeta,.cb-rowActions,.cb-statLabel,.cb-strip,.cb-chart svg,.cb-legend,.cb-track b,.cb-more,.cb-doneBox,.cb-delta,.cb-when,.cb-progress small,.cb-bubble,.cb-page .uk-chip,.cb-page .uk-tile,.cb-page .uk-icon,.cb-page .uk-newDot,.cb-page .uk-justNow,.cb-page .uk-ringText small{-webkit-user-select:none;user-select:none}
.cb-cardHead h3{-webkit-user-select:text;user-select:text}
.cb-card svg,.cb-card img{-webkit-user-drag:none}
/* Arranging: a card's own place (drag, pin, move), and the cue on a card a producer has raised for now */
.cb-card{position:relative}
.cb-cardRaised{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary) 38%,transparent)}
.cb-raisedCue{flex:0 1 auto;min-width:0;display:inline-flex}
button.cb-cardMore{border:0;background:transparent;padding:0;font:inherit;cursor:pointer}
.cb-pinMark{flex:none;display:inline-flex;color:var(--dsw-alias-state-business-primary)}
.cb-cardMore.cb-open{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary)}
.cb-cardMore:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
@media (hover:hover) and (pointer:fine){.cb-cardMore{cursor:grab;opacity:0;transition:opacity var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)}.cb-cardMore:active{cursor:grabbing}.cb-card:hover .cb-cardMore,.cb-card:focus-within .cb-cardMore,.cb-cardMore.cb-open{opacity:1}}
@media (hover:none),(pointer:coarse){.cb-cardHead,.cb-cardHead h3{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}}
.cb-cardDragging{z-index:6;pointer-events:none;opacity:.94;cursor:grabbing;box-shadow:0 14px 36px color-mix(in srgb,var(--dsw-alias-label-primary) 22%,transparent),inset 0 0 0 .5px var(--dsw-alias-border-l3)}
.cb-card[data-drop]::after{content:"";position:absolute;z-index:5;pointer-events:none;border-radius:3px;background:var(--dsw-alias-state-business-primary);animation:cb-in var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease) both}
.cb-card[data-axis=x][data-drop=before]::after{left:-9px;top:6px;bottom:6px;width:3px}
.cb-card[data-axis=x][data-drop=after]::after{right:-9px;top:6px;bottom:6px;width:3px}
.cb-card[data-axis=y][data-drop=before]::after{top:-9px;left:6px;right:6px;height:3px}
.cb-card[data-axis=y][data-drop=after]::after{bottom:-9px;left:6px;right:6px;height:3px}
.cb-heading .cb-sub{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px}
.cb-reset{margin:-4px 0}
.cb-readOnly{padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;color:var(--dsw-alias-label-secondary);font-size:12px}
.cb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* The point under the pointer on a chart */
.cb-chart{position:relative}
.cb-plot{touch-action:pan-y}
.cb-hoverRule{stroke:var(--dsw-alias-border-l3);stroke-width:1}
.cb-bubble{position:absolute;top:4px;z-index:1;pointer-events:none;padding:5px 8px;border-radius:8px;background:var(--dsw-alias-bg-base);box-shadow:0 2px 10px color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent),inset 0 0 0 .5px var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-size:12px;line-height:17px;white-space:nowrap;font-variant-numeric:tabular-nums}
.cb-bubbleHead{color:var(--dsw-alias-label-tertiary)}
/* The opened card */
.cb-sheetModal.cb-sheetModal{width:min(720px,calc(100vw - 32px));max-width:none;max-height:100%}
.cb-sheet{min-width:0;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;overflow-wrap:anywhere}
/* a long unbroken word (an id, a key, a path) wraps instead of widening the sheet */
.cb-sheetModal h2{min-width:0;overflow-wrap:anywhere}
.cb-cardInSheet{padding:0;box-shadow:none;background:transparent;border-radius:0}
.cb-detail{display:flex;flex-direction:column;gap:14px;margin-top:4px}
.cb-detailText{margin:0;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:21px;white-space:pre-wrap}
.cb-facts{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px 18px;margin:0;font-size:13px;line-height:19px}
.cb-facts dt{color:var(--dsw-alias-label-tertiary);-webkit-user-select:none;user-select:none}
.cb-facts dd{margin:0;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.cb-detailHistory h4{margin:0 0 6px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-tertiary);-webkit-user-select:none;user-select:none}
.cb-sheetChat{display:flex;justify-content:flex-end}
.cb-openRow{display:flex;flex-direction:column;gap:14px;min-width:0}
.cb-openFacts{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;min-width:0;font-size:13px;line-height:20px}
.cb-openFacts>*{min-width:0;max-width:100%}
.cb-openFacts .cb-rowSub{font-size:13px;line-height:20px;overflow-wrap:anywhere}
.cb-openRow .cb-detail{margin-top:0}
.cb-openActions{display:flex;flex-direction:column;gap:8px;min-width:0}
.cb-openButtons{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0}
.cb-openButtons>.ua-bar{display:contents}
.cb-doneBoxLabelled{justify-content:flex-start;padding:0 10px 0 6px;border-radius:8px;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
/* the opened view shows every word: nothing is cut to a line or two */
.cb-sheet .cb-trunc{white-space:normal;display:block;-webkit-line-clamp:unset;overflow:visible;text-overflow:clip}
@media (width<=640px){.cb-sheetModal.cb-sheetModal{width:calc(100vw - 16px)}}
@media (width<=768px),(pointer:coarse){
.cb-cardLink{width:40px;height:40px;margin:-9px 0}
.cb-doneBox{min-width:40px;min-height:40px;margin:-6px -6px -6px -10px}
.cb-doneBox label{display:inline-flex;align-items:center;justify-content:center;min-width:40px;min-height:40px}
.cb-doneBoxLabelled{margin:0}
.cb-doneBoxLabelled label{justify-content:flex-start;gap:6px}
.cb-cardChat{margin:-9px -10px -9px 0}
.cb-reset{min-height:40px}
}
`;

// src/client/page.js
var import_react15 = require("react");
var import_dsh_client_ui_primitives5 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/schema.js
var SIZES = Object.freeze(["small", "medium", "large", "wide"]);
var CARD_TYPES = Object.freeze(["summary", "countdown", "stat", "line", "bar", "donut", "list", "timeline", "status"]);
var TONES = Object.freeze(["ok", "warn", "bad", "muted", "accent", "violet"]);
var ACTION_KINDS = Object.freeze(["chat", "step", "done", "snooze", "event", "link"]);
var PRESS_KINDS = Object.freeze(["step", "done", "snooze", "event"]);
var INVERSE_KINDS = Object.freeze(["done", "snooze", "event"]);
var DIRECTIONS = Object.freeze(["up", "down", "flat"]);
var TIMELINE_KINDS = Object.freeze(["travel", "due", "event", "health", "home", "money"]);
var MAX_CARD_BYTES = 256 * 1024;

// src/arrange.js
function arranged(ids, arrangement) {
  if (arrangement === void 0) return { pinned: [], order: [...ids] };
  const present = new Set(ids);
  const pinned = arrangement.pinned.filter((id) => present.has(id));
  const taken = new Set(pinned);
  const order = arrangement.order.filter((id) => present.has(id) && !taken.has(id));
  const placed = new Set(order);
  ids.forEach((id, i) => {
    if (taken.has(id) || placed.has(id)) return;
    let after = -1;
    for (let before = i - 1; before >= 0 && after < 0; before--) after = order.indexOf(ids[before]);
    order.splice(after + 1, 0, id);
  });
  return { pinned, order };
}
var sequenceOf = ({ pinned, order }) => [...pinned, ...order];
function visibleOrder(state, raised) {
  const all = sequenceOf(state);
  return [...all.filter((id) => raised.has(id)), ...all.filter((id) => !raised.has(id))];
}
function pinCard({ pinned, order }, id) {
  return { pinned: [...pinned.filter((p) => p !== id), id], order: order.filter((o) => o !== id) };
}
function unpinCard({ pinned, order }, id) {
  return { pinned: pinned.filter((p) => p !== id), order: [id, ...order.filter((o) => o !== id)] };
}
function shiftCard({ pinned, order }, id, delta) {
  const shift = (list) => {
    const from = list.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return list;
    const next = [...list];
    next.splice(from, 1);
    next.splice(to, 0, id);
    return next;
  };
  return { pinned: shift(pinned), order: shift(order) };
}
function canShift({ pinned, order }, id, delta) {
  const list = pinned.includes(id) ? pinned : order;
  const to = list.indexOf(id) + delta;
  return list.includes(id) && to >= 0 && to < list.length;
}
function dropCard(state, id, target, after) {
  if (id === target) return state;
  const wasPinned = state.pinned.includes(id);
  const rest = sequenceOf(state).filter((card) => card !== id);
  const pinsLeft = state.pinned.filter((card) => card !== id).length;
  const at2 = rest.indexOf(target) + (after ? 1 : 0);
  if (at2 < 0 || rest.indexOf(target) < 0) return state;
  const next = [...rest.slice(0, at2), id, ...rest.slice(at2)];
  const pinCount = at2 < pinsLeft ? pinsLeft + 1 : at2 > pinsLeft ? pinsLeft : pinsLeft + (wasPinned ? 1 : 0);
  return { pinned: next.slice(0, pinCount), order: next.slice(pinCount) };
}
var at = (time, fallback) => time === void 0 ? fallback : Date.parse(time);
function isRaised(raise, now) {
  return raise !== void 0 && at(raise.from, -Infinity) <= now && now < at(raise.until, Infinity);
}
function nextRaiseChange(raises, now) {
  const times = raises.flatMap((raise) => [at(raise?.from, NaN), at(raise?.until, NaN)]).filter((time) => time > now);
  return times.length > 0 ? Math.min(...times) : void 0;
}

// src/client/card.js
var import_react10 = require("react");
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/charts.js
var import_react4 = require("react");

// src/client/pieces.js
var import_react = require("react");
function Trunc({ text, as = "div", className = "", lines = 1 }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  return (0, import_react.createElement)(as, {
    className: `cb-trunc${lines > 1 ? " cb-trunc2" : ""}${open ? " cb-truncOpen" : ""} ${className}`.trim(),
    title: text,
    onClick: () => setOpen((value) => !value)
  }, text);
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
function usePointer(pick) {
  const [at2, setAt] = (0, import_react4.useState)(null);
  const fromEvent = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    return pick(event.clientX - box.left);
  };
  return [at2, {
    onPointerMove: (event) => setAt(fromEvent(event)),
    onPointerDown: (event) => setAt(fromEvent(event)),
    onPointerLeave: (event) => {
      if (event.pointerType === "mouse") setAt(null);
    }
  }, () => setAt(null)];
}
function Bubble({ x, width, lines }) {
  const flip = x > width * 0.6;
  return (0, import_react4.createElement)(
    "div",
    { className: "cb-bubble", role: "status", style: flip ? { right: Math.max(0, width - x + 10) } : { left: x + 10 } },
    lines.map((line, i) => (0, import_react4.createElement)("div", { key: i, className: i === 0 ? "cb-bubbleHead" : void 0 }, line))
  );
}
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
  const xsAll = (0, import_react4.useMemo)(() => [...new Set(data.series.flatMap((s) => s.points.filter((p) => typeof p.y === "number").map((p) => p.x)))], [data]);
  const [hover, pointer] = usePointer((px) => {
    let best = null;
    for (const x of xsAll) if (best === null || Math.abs(sx(x) - px) < Math.abs(sx(best) - px)) best = x;
    return best;
  });
  const hoverX = hover === null ? null : sx(hover);
  const hoverLines = hover === null ? [] : [model.timeAxis ? formatDay(toTime(hover), locale, 0) : xLabel(hover), ...data.series.flatMap((s) => {
    const p = s.points.find((q) => q.x === hover && typeof q.y === "number");
    return p ? [`${s.name ? `${s.name}: ` : ""}${formatNumber(p.y, locale)}${data.unit ? ` ${data.unit}` : ""}`] : [];
  })];
  return (0, import_react4.createElement)("div", { ref, className: "cb-chart", style: { height } }, width > 0 && hover !== null && (0, import_react4.createElement)(Bubble, { x: hoverX, width, lines: hoverLines }), width > 0 && (0, import_react4.createElement)(
    "svg",
    { width, height, role: "img", className: "cb-plot", ...pointer },
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
    }),
    hover !== null && (0, import_react4.createElement)(
      "g",
      { className: "cb-hover" },
      (0, import_react4.createElement)("line", { x1: hoverX, x2: hoverX, y1: top, y2: top + plotH, className: "cb-hoverRule" }),
      data.series.map((s, i) => {
        const p = s.points.find((q) => q.x === hover && typeof q.y === "number");
        return p && (0, import_react4.createElement)("circle", { key: i, cx: hoverX, cy: sy(p.y), r: 4, fill: toneColor(s.tone, i), stroke: "var(--dsw-alias-bg-base)", strokeWidth: 2 });
      })
    )
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
  const [hover, pointer] = usePointer((px) => Math.max(0, Math.min(data.bars.length - 1, Math.floor(px / slot))));
  const tipOf = (bar) => multi ? [label(bar.x), ...keys.filter((k) => bar.values?.[k] !== void 0).map((k) => `${k}: ${formatNumber(bar.values[k], locale)}${data.unit ? ` ${data.unit}` : ""}`)] : [label(bar.x), `${formatNumber(bar.value, locale)}${data.unit ? ` ${data.unit}` : ""}`];
  return (0, import_react4.createElement)(
    "div",
    null,
    (0, import_react4.createElement)(
      "div",
      { ref, className: "cb-chart", style: { height } },
      width > 0 && hover !== null && data.bars[hover] && (0, import_react4.createElement)(Bubble, { x: slot * hover + slot / 2, width, lines: tipOf(data.bars[hover]) }),
      width > 0 && (0, import_react4.createElement)(
        "svg",
        { width, height, role: "img", className: "cb-plot", ...pointer },
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
              fillOpacity: hover === i ? 1 : multi ? 0.85 : 0.55
            })),
            showValues && (0, import_react4.createElement)("text", { x: cx, y: sy(peaks[i]) - 4, className: "cb-barValue", textAnchor: "middle" }, formatNumber(multi && !stacked ? peaks[i] : totals[i], locale, 1)),
            i % labelEvery === 0 && (0, import_react4.createElement)("text", { x: Math.min(Math.max(cx, textWidth(label(bar.x)) / 2), width - textWidth(label(bar.x)) / 2), y: height - 4, className: "cb-axis", textAnchor: "middle" }, label(bar.x))
          );
        })
      )
    ),
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
var import_react6 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/motion.js
var import_react5 = require("react");
var reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function useEased(value, ms = 500) {
  const [shown, setShown] = (0, import_react5.useState)(value);
  const from = (0, import_react5.useRef)(value);
  (0, import_react5.useEffect)(() => {
    const start = from.current;
    from.current = value;
    if (typeof value !== "number" || typeof start !== "number" || start === value || reduced() || typeof requestAnimationFrame !== "function") {
      setShown(value);
      return void 0;
    }
    const begin = performance.now();
    let frame = 0;
    const step = (now) => {
      const k = Math.min(1, (now - begin) / ms);
      const eased = 1 - (1 - k) ** 3;
      setShown(k >= 1 ? value : start + (value - start) * eased);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms]);
  return shown;
}

// src/client/links.js
function openLink(link) {
  if (/^https?:/i.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  const url = new URL(link, window.location.origin);
  if (url.origin !== window.location.origin) return;
  window.history.pushState(null, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function onControl(event) {
  const control = event.target?.closest?.("button,a,input,select,textarea,label,[role=button],[role=link],[role=checkbox],[role=menuitem]");
  return Boolean(control) && control !== event.currentTarget;
}

// src/client/steps.js
function ownOffset(at2) {
  const m = /(?:([+-])(\d{2}):?(\d{2})|Z)$/.exec(String(at2));
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
function dropAfter(rect, x, y, single) {
  const across = (x - (rect.left + rect.width / 2)) / Math.max(1, rect.width);
  const down = (y - (rect.top + rect.height / 2)) / Math.max(1, rect.height);
  return single || Math.abs(down) > Math.abs(across) ? down > 0 : across > 0;
}

// src/client/ticks.js
var doneOf = (row) => row?.actions?.find((action) => action.kind === "done" && action.label === void 0);
var rowRef = (row, index) => row?.key ?? index;
var keptId = (row) => row.key ?? doneOf(row)?.id;
function keepOf(row, index) {
  const done = doneOf(row);
  return done === void 0 ? void 0 : { id: keptId(row), index, row: { ...row, checked: true, actions: [done] } };
}
function keepTicked(rows, kept = []) {
  const present = new Set(rows.map(keptId));
  const missing = kept.filter((entry) => !present.has(entry.id)).sort((a, b) => a.index - b.index);
  if (missing.length === 0) return rows;
  const merged = [...rows];
  for (const entry of missing) merged.splice(Math.min(entry.index, merged.length), 0, entry.row);
  return merged;
}
function doneState(row, latest) {
  const state = latest?.state;
  const checked = state === "undone" ? false : state === "pending" || row.checked === true;
  return { checked, undo: checked && latest?.undoable ? latest.press : void 0 };
}
var withKept = (kept = [], entry) => [...kept.filter((other) => other.id !== entry.id), entry];

// src/client/ask.js
var MAX_ACTIONS = 6;
function rowButtons(row, cardAsk) {
  const own = row.actions ?? [];
  if (row.ask === false || cardAsk === false) return own;
  if (own.some((action) => action.kind === "chat") || own.length >= MAX_ACTIONS) return own;
  return [...own, { kind: "chat", id: "_ask" }];
}
function openedButtons(row, cardAsk) {
  const done = doneOf(row);
  return [...row.detail?.actions ?? [], ...rowButtons(row, cardAsk).filter((action) => action !== done)];
}

// src/client/cards.js
var STATE_OF_TONE = { ok: "done", warn: "warning", bad: "error" };
var DIRECTION_ICON = { up: "trending-up", down: "trending-down" };
function EasedNumber({ value, locale }) {
  const shown = useEased(value);
  if (typeof value !== "number") return formatNumber(value, locale);
  const decimals = Math.min(3, (String(value).split(".")[1] ?? "").length);
  return formatNumber(shown === value ? value : Number(shown.toFixed(decimals)), locale);
}
function StatBlock({ data, locale, compact, wash, tone }) {
  const kit = useKit();
  const iconic = data.items.some((item) => item.icon);
  const paired = iconic && data.items.filter((item) => !item.strip).length > 1;
  return (0, import_react6.createElement)("div", { className: ["cb-stats", compact && "cb-statsCompact", iconic && "cb-statsIcons", paired && "cb-statsPaired"].filter(Boolean).join(" ") }, data.items.map((item, i) => (0, import_react6.createElement)(
    item.link ? "a" : "div",
    { key: i, className: ["cb-stat", item.strip && "cb-statWide", item.link && "cb-statLink", item.icon && "cb-statIcon"].filter(Boolean).join(" "), ...item.link ? linkProps(item.link) : {} },
    item.icon && (0, import_react6.createElement)(kit.Tile, { icon: item.icon, tone: item.iconTone ?? item.tone ?? tone ?? "muted", size: compact ? 44 : 48, className: "cb-statTile" }),
    (0, import_react6.createElement)("div", { className: "cb-statLabel" }, (0, import_react6.createElement)(Trunc, { as: "span", text: item.label }), i === 0 && wash && (0, import_react6.createElement)(kit.JustNow)),
    (0, import_react6.createElement)(
      "div",
      { className: "cb-statValue", style: item.tone ? { color: kit.toneColor(item.tone) } : void 0 },
      (0, import_react6.createElement)("span", null, (0, import_react6.createElement)(EasedNumber, { value: item.value, locale })),
      item.unit && (0, import_react6.createElement)("small", null, item.unit)
    ),
    item.delta && (0, import_react6.createElement)(
      "div",
      { className: "cb-delta", style: { color: kit.toneColor(item.delta.tone ?? "muted") } },
      DIRECTION_ICON[item.delta.dir] && (0, import_react6.createElement)(kit.Icon, { name: DIRECTION_ICON[item.delta.dir], size: 13 }),
      (0, import_react6.createElement)("span", null, item.delta.text)
    ),
    item.progress && (0, import_react6.createElement)(
      "div",
      { className: "cb-statProgress" },
      (0, import_react6.createElement)(kit.Progress, { value: item.progress.value, max: item.progress.max, tone: item.tone ?? (item.progress.value > item.progress.max ? "warn" : "ok") }),
      item.progress.text && (0, import_react6.createElement)("div", { className: "cb-statSub" }, item.progress.text)
    ),
    item.spark && (0, import_react6.createElement)(kit.Spark, { values: item.spark, tone: item.tone ?? "accent", height: 28, area: true }),
    item.sub && (0, import_react6.createElement)(Trunc, { className: "cb-statSub", lines: 2, text: item.sub }),
    item.strip && (0, import_react6.createElement)("ol", { className: "cb-strip" }, item.strip.map((cell, j) => (0, import_react6.createElement)(
      "li",
      { key: j, "data-on": cell.on ? "true" : void 0 },
      (0, import_react6.createElement)("b", null, formatNumber(cell.value, locale, 1)),
      cell.icon && (0, import_react6.createElement)(kit.Icon, { name: cell.icon, size: 14 }),
      (0, import_react6.createElement)("span", null, cell.label)
    )))
  )));
}
function linkProps(link) {
  const external = /^https?:/i.test(link);
  return { href: link, ...external ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (event) => {
    event.preventDefault();
    openLink(link);
  } } };
}
function RowWhen({ row, locale, t }) {
  const kit = useKit();
  const now = kit.useNow();
  if (row.active) {
    if (isActive(row.active, now)) return (0, import_react6.createElement)(import_dsh_client_ui_primitives.Tag, { tone: "info" }, t("now"));
    const from = Date.parse(row.active.from);
    if (from > now && new Date(from).toDateString() === new Date(now).toDateString()) return (0, import_react6.createElement)("span", { className: "cb-when" }, t("fromTime", { time: formatClock(from, locale) }));
  }
  return row.date ? (0, import_react6.createElement)("span", { className: "cb-when" }, (0, import_react6.createElement)(kit.RelativeDay, { date: row.date })) : null;
}
function Row({ lead, title, sub, meta, value, spark, row, index, washCount, fresh, rowActions, ask, className, onOpenRow }) {
  const kit = useKit();
  const now = kit.useNow();
  const wash = kit.useWash(washCount, row.key);
  const go = row.link ? () => openLink(row.link) : row.detail && row.key !== void 0 && onOpenRow ? () => onOpenRow(row.key) : null;
  const opens = go && {
    "data-opens": "true",
    role: row.link ? "link" : "button",
    tabIndex: 0,
    onClick: (event) => {
      if (!onControl(event)) {
        event.stopPropagation();
        go();
      }
    },
    onKeyDown: (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
        event.preventDefault();
        go();
      }
    }
  };
  const buttons = rowActions && rowButtons(row, ask);
  return (0, import_react6.createElement)(
    "li",
    { className: ["cb-row", className, isActive(row.active, now) && "cb-rowNow", go && "cb-rowOpens", wash].filter(Boolean).join(" "), ...opens },
    lead,
    (0, import_react6.createElement)(
      "div",
      { className: "cb-rowText" },
      (0, import_react6.createElement)("div", { className: "cb-rowTitle" }, fresh && (0, import_react6.createElement)(kit.NewDot), (0, import_react6.createElement)(Trunc, { as: "span", lines: 2, text: title })),
      sub && (0, import_react6.createElement)(Trunc, { className: "cb-rowSub", lines: 2, text: sub })
    ),
    spark,
    meta,
    value,
    // The row's own buttons on the right: its steps first (a step starts the work on one tap), then the others.
    buttons?.length > 0 && (0, import_react6.createElement)(
      "span",
      { className: "cb-rowActions" },
      buttons.some((action) => action.kind === "step") && rowActions(rowRef(row, index), buttons, "steps"),
      rowActions(rowRef(row, index), buttons, "buttons")
    )
  );
}
function DoneBox({ row, index, done, rowControls, t, labelled = false }) {
  const ref = rowRef(row, index);
  const { checked, undo } = doneState(row, rowControls.latest(ref, done.id));
  const label = t(checked ? undo ? "markNotDone" : "checked" : "markDone");
  return (0, import_react6.createElement)(
    "span",
    { className: `cb-doneBox${labelled ? " cb-doneBoxLabelled" : ""}`, onClick: (event) => event.stopPropagation() },
    (0, import_react6.createElement)(import_dsh_client_ui_primitives.Checkbox, {
      checked,
      disabled: checked ? undo === void 0 : index < 0,
      title: label,
      label: (0, import_react6.createElement)("span", { className: labelled ? void 0 : "cb-visuallyHidden" }, label),
      onChange: (value) => {
        if (value) rowControls.press(ref, done);
        else if (undo) rowControls.undo(undo);
      }
    })
  );
}
var rowLive = (live, row) => ({ washCount: live.rows?.[row.key] ?? 0, fresh: row.key !== void 0 && live.freshRows.has(row.key) });
function ListCard({ data, live, locale, t, rowActions, ask, all = false, onOpenRow, rowControls }) {
  const kit = useKit();
  const [open, setOpen] = (0, import_react6.useState)(false);
  const listed = keepTicked(data.rows, rowControls?.kept);
  const rows = shownRows(listed, open || all, LIST_ROWS, live);
  const hidden = listed.length - rows.length;
  const ticked = (row) => {
    const done = doneOf(row);
    return done !== void 0 && rowControls !== void 0 ? doneState(row, rowControls.latest(rowRef(row, data.rows.indexOf(row)), done.id)).checked : row.checked === true;
  };
  const progress = data.progress;
  return (0, import_react6.createElement)(
    "div",
    { className: "cb-list" },
    progress && (0, import_react6.createElement)(
      "div",
      { className: "cb-progress" },
      (0, import_react6.createElement)(
        kit.Ring,
        { value: progress.done, max: progress.total, size: 54, tone: progress.done >= progress.total ? "ok" : "accent", label: `${progress.done}/${progress.total}` },
        (0, import_react6.createElement)("span", null, String(progress.done)),
        (0, import_react6.createElement)("small", null, t("ofTotal", { total: progress.total }))
      ),
      (0, import_react6.createElement)(
        "div",
        { className: "cb-progressText" },
        progress.label && (0, import_react6.createElement)("div", { className: "cb-progressLabel" }, progress.label),
        progress.sub && (0, import_react6.createElement)("div", { className: "cb-rowSub" }, progress.sub)
      )
    ),
    listed.length === 0 ? (0, import_react6.createElement)("p", { className: "cb-muted" }, data.empty ?? t("listEmpty")) : (0, import_react6.createElement)("ul", { className: "cb-rows" }, rows.map((row, i) => (0, import_react6.createElement)(Row, {
      key: row.key ?? i,
      index: data.rows.indexOf(row),
      row: doneOf(row) && rowControls ? { ...row, actions: row.actions.filter((a) => a !== doneOf(row)) } : row,
      rowActions: data.rows.includes(row) ? rowActions : void 0,
      ask,
      onOpenRow,
      className: [i >= LIST_ROWS && "cb-rowLate", ticked(row) && "cb-done"].filter(Boolean).join(" ") || void 0,
      ...rowLive(live, row),
      lead: [
        doneOf(row) && rowControls && (0, import_react6.createElement)(DoneBox, { key: "check", row, index: data.rows.indexOf(row), done: doneOf(row), rowControls, t }),
        row.icon && (0, import_react6.createElement)(kit.Tile, { key: "tile", icon: row.icon, tone: row.tone ?? "muted", size: 30 })
      ],
      title: row.title,
      sub: row.sub,
      meta: (0, import_react6.createElement)(
        "span",
        { className: "cb-rowMeta" },
        row.chip && (0, import_react6.createElement)(import_dsh_client_ui_primitives.Tag, { tone: kit.tagTone(row.chip.tone ?? "muted") }, row.chip.text),
        (0, import_react6.createElement)(RowWhen, { row, locale, t })
      )
    }))),
    !all && (hidden > 0 || open) && listed.length > LIST_ROWS + 1 && (0, import_react6.createElement)(
      import_dsh_client_ui_primitives.Button,
      { variant: "ghost", size: "sm", className: "cb-more", onClick: () => setOpen((value) => !value) },
      open ? t("showFewer") : t("showMore", { n: hidden })
    )
  );
}
function OpenedRow({ row, kind, index, live, locale, t, rowActions, ask, rowControls, detail }) {
  const kit = useKit();
  const wash = kit.useWash(live.rows?.[row.key] ?? 0, row.key);
  const status = kind === "status";
  const done = doneOf(row);
  const buttons = rowActions ? openedButtons(row, ask) : [];
  const facts = [
    row.icon && (0, import_react6.createElement)(kit.Tile, { key: "tile", icon: row.icon, tone: row.tone ?? "muted", size: 24 }),
    status && !row.icon && (0, import_react6.createElement)(import_dsh_client_ui_primitives.StateDot, { key: "dot", state: STATE_OF_TONE[row.tone] ?? "idle" }),
    !status && row.chip && (0, import_react6.createElement)(import_dsh_client_ui_primitives.Tag, { key: "chip", tone: kit.tagTone(row.chip.tone ?? "muted") }, row.chip.text),
    status && (0, import_react6.createElement)("span", { key: "value", className: "cb-statusValue", style: row.tone === "bad" || row.tone === "warn" ? { color: kit.toneColor(row.tone) } : void 0 }, formatNumber(row.value, locale)),
    status && row.spark && (0, import_react6.createElement)("span", { key: "spark", className: "cb-statusSpark" }, (0, import_react6.createElement)(kit.Spark, { values: row.spark, tone: row.tone === "ok" ? "ok" : row.tone, height: 22 })),
    row.sub && (0, import_react6.createElement)("span", { key: "sub", className: "cb-rowSub" }, row.sub),
    !status && (0, import_react6.createElement)(RowWhen, { key: "when", row, locale, t })
  ].filter(Boolean);
  return (0, import_react6.createElement)(
    "div",
    { className: ["cb-openRow", wash].filter(Boolean).join(" ") },
    facts.length > 0 && (0, import_react6.createElement)("div", { className: "cb-openFacts" }, facts),
    detail,
    (buttons.length > 0 || done && rowControls) && (0, import_react6.createElement)(
      "footer",
      { className: "cb-openActions" },
      buttons.some((action) => action.kind === "step") && rowActions(rowRef(row, index), buttons, "steps", false),
      (0, import_react6.createElement)(
        "div",
        { className: "cb-openButtons" },
        done && rowControls && (0, import_react6.createElement)(DoneBox, { row, index, done, rowControls, t, labelled: true }),
        buttons.some((action) => action.kind !== "step") && rowActions(rowRef(row, index), buttons, "buttons", false)
      )
    )
  );
}
function StatusCard({ data, live, locale, rowActions, ask, onOpenRow }) {
  const kit = useKit();
  return (0, import_react6.createElement)("ul", { className: "cb-rows" }, data.rows.map((row, i) => (0, import_react6.createElement)(Row, {
    key: row.key ?? i,
    index: i,
    row,
    rowActions,
    ask,
    onOpenRow,
    ...rowLive(live, row),
    className: "cb-statusRow",
    lead: row.icon ? (0, import_react6.createElement)(kit.Tile, { icon: row.icon, tone: row.tone, size: 28 }) : (0, import_react6.createElement)("span", { className: "cb-dotSlot" }, (0, import_react6.createElement)(import_dsh_client_ui_primitives.StateDot, { state: STATE_OF_TONE[row.tone] ?? "idle" })),
    title: row.label,
    sub: row.sub,
    spark: row.spark && (0, import_react6.createElement)("span", { className: "cb-statusSpark" }, (0, import_react6.createElement)(kit.Spark, { values: row.spark, tone: row.tone === "ok" ? "ok" : row.tone, height: 22 })),
    value: (0, import_react6.createElement)("span", { className: "cb-statusValue", style: row.tone === "bad" || row.tone === "warn" ? { color: kit.toneColor(row.tone) } : void 0 }, formatNumber(row.value, locale))
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
  return (0, import_react6.createElement)(
    "div",
    { className: "cb-summary" },
    (0, import_react6.createElement)("div", { className: "cb-summaryLine" }, (0, import_react6.createElement)(kit.Icon, { name: day.dark ? "moon" : "sun-medium", size: 14 }), (0, import_react6.createElement)("span", null, `${day.text} \xB7 ${card.title}`), wash && (0, import_react6.createElement)(kit.JustNow)),
    (0, import_react6.createElement)("p", { className: "cb-summaryText" }, card.data.text),
    card.data.chips?.length > 0 && (0, import_react6.createElement)("div", { className: "cb-chips" }, card.data.chips.map((chip, i) => (0, import_react6.createElement)(kit.Chip, { key: i, icon: chip.icon, tone: chip.tone ?? "muted", to: chip.to }, chip.text)))
  );
}
function CountdownBody({ card, locale }) {
  const kit = useKit();
  const now = kit.useNow();
  const data = card.data;
  const times = data.steps ? stepTimes(data.steps, locale) : [];
  const next = times.findIndex((step) => step.time > now);
  return (0, import_react6.createElement)(
    "div",
    { className: "cb-countdown" },
    (0, import_react6.createElement)(
      "div",
      { className: "cb-countdownHead" },
      data.icon && (0, import_react6.createElement)(kit.Tile, { icon: data.icon, tone: card.tone ?? "muted", size: 52, className: "cb-countdownTile" }),
      (0, import_react6.createElement)(kit.Countdown, { to: data.to }),
      (0, import_react6.createElement)(
        "div",
        { className: "cb-countdownText" },
        (0, import_react6.createElement)("div", null, data.label),
        data.sub && (0, import_react6.createElement)("div", { className: "cb-rowSub" }, data.sub)
      )
    ),
    times.length > 0 && (0, import_react6.createElement)("ol", { className: "cb-track" }, data.steps.map((step, i) => (0, import_react6.createElement)(
      "li",
      { key: i, "data-state": i === next ? "next" : times[i].time <= now ? "past" : "later" },
      (0, import_react6.createElement)("i", { "aria-hidden": true }),
      (0, import_react6.createElement)("b", null, times[i].text),
      (0, import_react6.createElement)("span", null, step.sub ? `${step.label} \xB7 ${step.sub}` : step.label)
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
var import_react7 = require("react");
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
  const subscribe = (0, import_react7.useCallback)((listener) => clientCtx.locale.subscribe(listener), []);
  const active = (0, import_react7.useSyncExternalStore)(subscribe, () => clientCtx.locale.getSnapshot().active);
  const [loaded, setLoaded] = (0, import_react7.useState)(null);
  const [attempt, setAttempt] = (0, import_react7.useState)(0);
  (0, import_react7.useEffect)(() => {
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
  return (0, import_react7.useMemo)(() => ({ active: loaded?.active ?? active, ready: loaded !== null, intl: intlTag(loaded?.active ?? active), t: translator(loaded?.messages ?? {}) }), [loaded, active]);
}

// src/client/detail.js
var import_react8 = require("react");
var CHARTS = { line: LineChart, bar: BarChart };
function DetailParts({ detail, locale, t }) {
  const kit = useKit();
  if (!detail) return null;
  const Chart = detail.chart && CHARTS[detail.chart.type];
  return (0, import_react8.createElement)(
    "div",
    { className: "cb-detail" },
    detail.text && (0, import_react8.createElement)("p", { className: "cb-detailText" }, detail.text),
    detail.facts?.length > 0 && (0, import_react8.createElement)("dl", { className: "cb-facts" }, detail.facts.map((fact, i) => [
      (0, import_react8.createElement)("dt", { key: `t${i}` }, fact.label),
      (0, import_react8.createElement)("dd", { key: `d${i}` }, typeof fact.value === "number" ? formatNumber(fact.value, locale) : fact.value)
    ])),
    Chart && (0, import_react8.createElement)("div", { className: "cb-detailChart" }, (0, import_react8.createElement)(Chart, { data: detail.chart.data, locale, height: 240 })),
    detail.history?.length > 0 && (0, import_react8.createElement)(
      "section",
      { className: "cb-detailHistory" },
      (0, import_react8.createElement)("h4", null, t("history")),
      (0, import_react8.createElement)(kit.History, { items: detail.history, max: 8, moreLabel: t("showMore", { n: "{n}" }) })
    )
  );
}

// src/client/arrange-ui.js
var import_react9 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
function ArrangeControls({ t, arrange }) {
  const [open, setOpen] = (0, import_react9.useState)(false);
  const items = [
    { id: "pin", label: t(arrange.pinned ? "arrange.unpin" : "arrange.pin"), icon: (0, import_react9.createElement)(import_dsh_client_ui_primitives2.IconPinOutlineRegular, { size: 14 }) },
    { id: "up", label: t("arrange.up"), icon: (0, import_react9.createElement)(import_dsh_client_ui_primitives2.IconChevronUpOutlineRegular, { size: 14 }), disabled: !arrange.canUp },
    { id: "down", label: t("arrange.down"), icon: (0, import_react9.createElement)(import_dsh_client_ui_primitives2.IconChevronDownOutlineRegular, { size: 14 }), disabled: !arrange.canDown }
  ];
  const choose = (id) => {
    setOpen(false);
    if (id === "pin") arrange.onPin();
    else arrange.onMove(id === "up" ? -1 : 1);
  };
  const onKeyDown = (event) => {
    if (!event.altKey || event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" ? -1 : 1;
    if (delta < 0 ? arrange.canUp : arrange.canDown) arrange.onMove(delta);
  };
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse") arrange.onGrip(event);
  };
  return [
    arrange.pinned && (0, import_react9.createElement)("span", { key: "pin", className: "cb-pinMark", role: "img", title: t("arrange.pinned"), "aria-label": t("arrange.pinned") }, (0, import_react9.createElement)(import_dsh_client_ui_primitives2.IconPinFillRegular, { size: 14 })),
    (0, import_react9.createElement)(import_dsh_client_ui_primitives2.Menu, {
      key: "menu",
      open,
      onClose: () => setOpen(false),
      onSelect: choose,
      items,
      align: "end",
      portal: true,
      compact: true,
      className: "cb-cardMenu",
      anchor: (0, import_react9.createElement)("button", { type: "button", className: `cb-cardLink cb-cardMore${open ? " cb-open" : ""}`, title: t("arrange.menu"), "aria-label": t("arrange.menu"), "aria-haspopup": "menu", "aria-expanded": open, onPointerDown, onClick: () => setOpen((value) => !value), onKeyDown }, (0, import_react9.createElement)(import_dsh_client_ui_primitives2.IconDragHandleOutlineRegular, { size: 14 }))
    })
  ];
}

// src/client/card.js
var CHART_HEIGHT = 150;
function useRowSpan() {
  const ref = (0, import_react10.useRef)(null);
  const [rows, setRows] = (0, import_react10.useState)(0);
  (0, import_react10.useLayoutEffect)(() => {
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
var CHARTS2 = { line: LineChart, bar: BarChart, donut: Donut, timeline: Timeline };
function statesOf(presses, row) {
  const states = {};
  for (const press of presses ?? []) if (press.row === row) states[press.id] = press.state;
  return states;
}
function latestOf(presses, row, id) {
  return (presses ?? []).findLast((press) => press.id === id && (row < 0 || press.row === row));
}
function Body({ card, live, wash, locale, t, rowActions, all, onOpenRow, rowControls }) {
  const data = card.data;
  switch (card.type) {
    case "stat":
      return (0, import_react10.createElement)(StatBlock, { data, locale, wash, tone: card.tone });
    case "list":
      return (0, import_react10.createElement)(ListCard, { data, live, locale, t, rowActions, ask: card.ask, all, onOpenRow, rowControls });
    case "status":
      return (0, import_react10.createElement)(StatusCard, { data, live, locale, rowActions, ask: card.ask, onOpenRow });
    case "countdown":
      return (0, import_react10.createElement)(CountdownBody, { card, locale });
    default: {
      const Chart = CHARTS2[card.type];
      if (Chart === void 0) return null;
      return (0, import_react10.createElement)(Chart, { data, locale, height: all ? card.type === "donut" ? 200 : 240 : card.type === "bar" ? 130 : card.type === "donut" ? 160 : CHART_HEIGHT });
    }
  }
}
function Card({ entry, live, boardId, assistant, tracks, active, locale, t, press, undo, kept, onOpen, sheet = false, row: openRow, arrange, raised = false, dragging = null, drop }) {
  const kit = useKit();
  const actions = useButtons();
  const now = kit.useNow();
  const wash = kit.useWash(live.wash, entry.id);
  const [ref, rows] = useRowSpan();
  const style = sheet ? void 0 : {
    gridColumn: `span ${spanOf(entry.card?.type, entry.size, tracks)}`,
    gridRowEnd: rows > 0 ? `span ${rows}` : void 0,
    ...dragging ? { transform: `translate(${dragging.dx}px, ${dragging.dy}px) scale(1.015)`, transition: "box-shadow var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)" } : {}
  };
  const placing = { "data-card": sheet ? void 0 : entry.id, "data-drop": drop, "data-axis": tracks === 1 ? "y" : "x" };
  if (!entry.card) {
    return (0, import_react10.createElement)(
      "section",
      { ref, className: `cb-card cb-cardError${dragging ? " cb-cardDragging" : ""}`, style, ...placing },
      (0, import_react10.createElement)("header", { className: "cb-cardHead" }, (0, import_react10.createElement)("h3", { title: entry.id }, entry.id)),
      (0, import_react10.createElement)("p", { className: "cb-errorText" }, t("cardError")),
      (0, import_react10.createElement)("ul", { className: "cb-problems" }, (entry.problems ?? []).map((p, i) => (0, import_react10.createElement)("li", { key: i }, p)))
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
  const indexOf = (row) => typeof row === "string" ? card.data.rows.findIndex((other) => other.key === row) : row;
  const rowLine = (row) => card.type === "status" ? statusRowLine(card.data.rows[indexOf(row)], locale) : listRowLine(card.data.rows[indexOf(row)]);
  const askName = assistant ? t("action.chatNamed", { name: assistant }) : void 0;
  const named = (list) => assistant ? list?.map((action) => action.kind === "chat" && action.label === void 0 ? { ...action, label: askName } : action) : list;
  const onPress = (target) => (action, extra) => {
    const index = target.row === void 0 ? -1 : indexOf(target.row);
    return press(action, extra, { card: entry.id, ...target }, index >= 0 ? { row: card.data.rows[index], index } : void 0);
  };
  const rowActions = actions && ((row, list, part2, compact = true) => (0, import_react10.createElement)(actions.ActionBar, {
    actions: named(list),
    part: part2,
    states: statesOf(entry.presses, row),
    compact,
    about: about(row, rowLine(row)),
    onPress: onPress({ row })
  }));
  const rowControls = {
    press: (row, action) => onPress({ row })(action),
    state: (row, id) => statesOf(entry.presses, row)[id],
    latest: (row, id) => latestOf(entry.presses, row, id),
    kept,
    undo: (pressId) => undo(pressId, entry.id)
  };
  const chat = actions && (0, import_react10.createElement)("span", { className: "cb-cardChat" }, (0, import_react10.createElement)(actions.ActionButton, { action: { kind: "chat", id: "_chat", label: askName }, compact: true, about: about() }));
  const others = card.actions?.filter((action) => action.kind !== "step") ?? [];
  const steps = card.actions?.some((action) => action.kind === "step") && (0, import_react10.createElement)(kit.Suggested, { actions: card.actions, about: about(), states: statesOf(entry.presses, void 0), onPress: onPress({}) });
  const footer = actions && others.length > 0 && (0, import_react10.createElement)("footer", { className: "cb-cardActions" }, (0, import_react10.createElement)(actions.ActionBar, {
    actions: named(others),
    part: "buttons",
    states: statesOf(entry.presses, void 0),
    about: about(),
    onPress: onPress({})
  }));
  const opened = sheet && actions && card.detail?.actions?.length > 0 && [
    card.detail.actions.some((action) => action.kind === "step") && (0, import_react10.createElement)(kit.Suggested, { key: "steps", actions: card.detail.actions, about: about(), states: statesOf(entry.presses, void 0), onPress: onPress({}) }),
    (0, import_react10.createElement)("footer", { key: "buttons", className: "cb-cardActions" }, (0, import_react10.createElement)(actions.ActionBar, {
      actions: named(card.detail.actions.filter((action) => action.kind !== "step")),
      part: "buttons",
      states: statesOf(entry.presses, void 0),
      about: about(),
      onPress: onPress({})
    }))
  ];
  const openable = !sheet && onOpen && card.type !== "summary";
  const className = ["cb-card", `cb-card-${card.type}`, stale && "cb-cardStale", openable && "cb-cardOpenable", sheet && "cb-cardInSheet", raised && "cb-cardRaised", dragging && "cb-cardDragging", wash].filter(Boolean).join(" ");
  const openOnTap = openable ? { onClick: (event) => {
    if (!onControl(event) && !event.target.closest?.("[data-opens]") && !window.getSelection?.()?.toString()) onOpen();
  } } : {};
  const onOpenRow = onOpen && ((key) => onOpen(key));
  if (sheet && openRow !== void 0) {
    const index = card.data.rows?.findIndex((r) => r.key === openRow) ?? -1;
    const target = index >= 0 ? card.data.rows[index] : null;
    if (!target) return (0, import_react10.createElement)("p", { className: "cb-muted" }, t("rowGone"));
    return (0, import_react10.createElement)(OpenedRow, {
      row: target,
      kind: card.type,
      index,
      live,
      locale,
      t,
      rowActions,
      ask: card.ask,
      rowControls,
      detail: (0, import_react10.createElement)(DetailParts, { detail: target.detail, locale, t })
    });
  }
  if (card.type === "summary") {
    return (0, import_react10.createElement)(
      "section",
      { ref, className, style, "data-type": card.type, ...placing },
      (0, import_react10.createElement)("div", { className: "cb-summaryMain" }, (0, import_react10.createElement)(SummaryBody, { card, locale, t, wash: wash !== "" }), steps, footer),
      (0, import_react10.createElement)("div", { className: "cb-summaryAside" }, live.fresh && (0, import_react10.createElement)(kit.NewDot), chat)
    );
  }
  const statBlock = card.stat && (0, import_react10.createElement)(StatBlock, { data: card.stat, locale, compact: true, wash: wash !== "", tone: card.tone });
  const body = (0, import_react10.createElement)(Body, { card, live, wash: wash !== "", locale, t, rowActions, all: sheet, onOpenRow, rowControls });
  return (0, import_react10.createElement)(
    "section",
    { ref, className, style, "data-type": card.type, ...placing, ...openOnTap },
    !sheet && (0, import_react10.createElement)(
      "header",
      { className: "cb-cardHead", ...arrange ? { onPointerDown: (event) => {
        if (event.pointerType !== "mouse" && !onControl(event)) arrange.onHold(event);
      } } : {} },
      card.icon && (0, import_react10.createElement)(kit.Tile, { icon: card.icon, tone: card.tone ?? "muted", size: 30 }),
      (0, import_react10.createElement)(Trunc, { as: "h3", text: card.title }),
      live.fresh && (0, import_react10.createElement)(kit.NewDot),
      raised && (0, import_react10.createElement)("span", { className: "cb-raisedCue", title: t("arrange.raisedWhy") }, (0, import_react10.createElement)(import_dsh_client_ui_primitives3.Tag, { tone: "info" }, card.raise?.label ?? t("arrange.raised"))),
      wash !== "" && card.type !== "stat" && !card.stat && (0, import_react10.createElement)(kit.JustNow),
      stale && (0, import_react10.createElement)(
        "span",
        { className: "cb-stale", title: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(updated) },
        (0, import_react10.createElement)(import_dsh_client_ui_primitives3.Tag, { tone: "warning" }, t("stale", { age: formatAge(age, locale) }))
      ),
      arrange && (0, import_react10.createElement)(ArrangeControls, { t, arrange }),
      card.link && (0, import_react10.createElement)("a", { className: "cb-cardLink", href: card.link, title: t("open"), "aria-label": t("open"), ...external ? { target: "_blank", rel: "noopener noreferrer" } : {} }, (0, import_react10.createElement)(import_dsh_client_ui_primitives3.IconRightUpOutlineRegular, { size: 14 })),
      openable && (0, import_react10.createElement)("button", { type: "button", className: "cb-cardLink cb-cardOpen", title: t("details"), "aria-label": t("details"), onClick: () => onOpen() }, (0, import_react10.createElement)(import_dsh_client_ui_primitives3.IconFullscreenOutlineRegular, { size: 14 })),
      chat
    ),
    statBlock && ["line", "bar", "donut"].includes(card.type) ? (0, import_react10.createElement)("div", { className: "cb-split" }, statBlock, (0, import_react10.createElement)("div", { className: "cb-cardBody" }, body)) : [statBlock && (0, import_react10.createElement)("div", { key: "stat" }, statBlock), (0, import_react10.createElement)("div", { key: "body", className: "cb-cardBody" }, body)],
    sheet && (0, import_react10.createElement)(DetailParts, { detail: card.detail, locale, t }),
    opened,
    steps,
    footer,
    sheet && chat && (0, import_react10.createElement)("div", { className: "cb-sheetChat" }, chat)
  );
}

// src/client/drag.js
var import_react11 = require("react");
var HOLD_MS = 380;
var SLOP = 8;
var PULL = 4;
var EDGE = 72;
function useCardDrag(onDrop) {
  const [drag, setDrag] = (0, import_react11.useState)(null);
  const dropRef = (0, import_react11.useRef)(onDrop);
  dropRef.current = onDrop;
  const stop = (0, import_react11.useRef)(() => {
  });
  (0, import_react11.useEffect)(() => () => stop.current(), []);
  const begin = (0, import_react11.useCallback)((event, id, hold) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stop.current();
    const el = event.currentTarget.closest("[data-card]");
    const scroller = el?.closest(".cb-page");
    if (!el || !scroller) return;
    const grid = el.parentElement;
    const origin = { x: event.clientX, y: event.clientY, scroll: scroller.scrollTop };
    const point = { x: origin.x, y: origin.y };
    let active = false;
    let hint = null;
    let timer = 0;
    let frame = 0;
    const single = () => getComputedStyle(grid).gridTemplateColumns.split(" ").length === 1;
    const update = () => {
      const under = document.elementsFromPoint(point.x, point.y).map((node) => node.closest?.("[data-card]")).find((card) => card && card.dataset.card !== id);
      if (under) hint = { target: under.dataset.card, after: dropAfter(under.getBoundingClientRect(), point.x, point.y, single()) };
      setDrag({ id, dx: point.x - origin.x, dy: point.y - origin.y + (scroller.scrollTop - origin.scroll), hint });
    };
    const scroll = () => {
      if (!active) return;
      const box = scroller.getBoundingClientRect();
      const near = point.y < box.top + EDGE ? (point.y - box.top - EDGE) / EDGE : point.y > box.bottom - EDGE ? (point.y - box.bottom + EDGE) / EDGE : 0;
      if (near !== 0) {
        const before = scroller.scrollTop;
        scroller.scrollTop += Math.round(Math.max(-1, Math.min(1, near)) * 16);
        if (scroller.scrollTop !== before) update();
      }
      frame = requestAnimationFrame(scroll);
    };
    const lift = () => {
      timer = 0;
      active = true;
      navigator.vibrate?.(10);
      document.body.style.cursor = "grabbing";
      update();
      scroll();
    };
    const onMove = (move) => {
      point.x = move.clientX;
      point.y = move.clientY;
      if (active) return update();
      const travel = Math.hypot(point.x - origin.x, point.y - origin.y);
      if (hold && travel > SLOP) finish(false);
      else if (!hold && travel > PULL) lift();
    };
    const onTouchMove = (move) => {
      if (active && move.cancelable) move.preventDefault();
    };
    const onKey = (key) => {
      if (key.key === "Escape") finish(false);
    };
    const onMenu = (menu) => {
      if (hold) menu.preventDefault();
    };
    function finish(drop) {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onMenu);
      document.body.style.cursor = "";
      stop.current = () => {
      };
      if (active) {
        const swallow = (click) => {
          click.stopPropagation();
          click.preventDefault();
        };
        window.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", swallow, true), 60);
        if (drop && hint) dropRef.current(id, hint.target, hint.after);
      }
      active = false;
      setDrag(null);
    }
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onMenu);
    if (hold) timer = setTimeout(lift, HOLD_MS);
    stop.current = () => finish(false);
  }, []);
  return { drag, begin };
}

// src/client/flip.js
var import_react12 = require("react");
var MS = 240;
function useGlide(gridRef, orderKey) {
  const spots = (0, import_react12.useRef)(/* @__PURE__ */ new Map());
  const lastKey = (0, import_react12.useRef)(orderKey);
  (0, import_react12.useLayoutEffect)(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const next = /* @__PURE__ */ new Map();
    const animate = lastKey.current !== orderKey && typeof matchMedia === "function" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const el of grid.children) {
      const id = el.dataset?.card;
      if (id === void 0) continue;
      const spot = { x: el.offsetLeft, y: el.offsetTop };
      const was = spots.current.get(id);
      if (animate && was && typeof el.animate === "function" && (Math.abs(was.x - spot.x) > 1 || Math.abs(was.y - spot.y) > 1)) {
        el.animate([{ transform: `translate(${was.x - spot.x}px, ${was.y - spot.y}px)` }, { transform: "none" }], { duration: MS, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
      next.set(id, spot);
    }
    spots.current = next;
    lastKey.current = orderKey;
  });
}

// src/client/raise.js
var import_react13 = require("react");
var MAX_WAIT_MS = 2 ** 31 - 1;
var SLACK_MS = 25;
function useRaised(entries) {
  const [now, setNow] = (0, import_react13.useState)(() => Date.now());
  const raises = entries.filter((entry) => entry.card?.raise).map((entry) => [entry.id, entry.card.raise]);
  const key = JSON.stringify(raises);
  (0, import_react13.useEffect)(() => {
    let timer;
    const arm = () => {
      clearTimeout(timer);
      const current = Date.now();
      setNow(current);
      const next = nextRaiseChange(raises.map(([, raise]) => raise), current);
      if (next !== void 0) timer = setTimeout(arm, Math.min(next - current + SLACK_MS, MAX_WAIT_MS));
    };
    const wake = () => {
      if (document.visibilityState === "visible") arm();
    };
    arm();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
    };
  }, [key]);
  return (0, import_react13.useMemo)(() => new Set(raises.filter(([, raise]) => isRaised(raise, now)).map(([id]) => id)), [key, now]);
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

// src/client/nav.js
var NAMES = ["board", "card", "row"];
function readNav(search) {
  const params = new URLSearchParams(search);
  const nav = {};
  for (const name of NAMES) {
    const value = params.get(name);
    if (value) nav[name] = value;
  }
  return nav;
}
function writeNav(search, nav) {
  const params = new URLSearchParams(search);
  for (const name of NAMES) params.delete(name);
  for (const name of NAMES) if (nav?.[name]) params.set(name, nav[name]);
  const query = params.toString();
  return query ? `?${query}` : "";
}
var hasNav = (search) => Boolean(readNav(search).card);

// src/client/sheet.js
var import_react14 = require("react");
var import_dsh_client_ui_primitives4 = require("@deepseek-ai/dsh-client-ui-primitives");
function Sheet({ open, onClose, title, closeLabel, children }) {
  return (0, import_react14.createElement)(import_dsh_client_ui_primitives4.Modal, { open, onClose, title, closeLabel, className: "cb-sheetModal", contentClassName: "cb-sheet" }, children);
}

// src/client/page.js
var STORE_KEY = "dsh-card-board:board";
var SEEN_AFTER_MS = 2500;
var UNDO_HOLD_MS = 7e3;
var TOAST_KEYS = { done: "toast.done", snooze: "toast.snooze" };
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
  const [boards, setBoards] = (0, import_react15.useState)(null);
  const [listError, setListError] = (0, import_react15.useState)(null);
  const [opened, setOpened] = (0, import_react15.useState)(() => typeof location === "undefined" ? {} : readNav(location.search));
  const pushed = (0, import_react15.useRef)(false);
  const [selected, setSelected] = (0, import_react15.useState)(() => {
    if (opened.board) return opened.board;
    try {
      return localStorage.getItem(STORE_KEY);
    } catch {
      return null;
    }
  });
  const [view, setView] = (0, import_react15.useState)({ board: null, live: {} });
  const [boardError, setBoardError] = (0, import_react15.useState)(null);
  const [pollSeconds, setPollSeconds] = (0, import_react15.useState)(30);
  const etag = (0, import_react15.useRef)(null);
  const currentRef = (0, import_react15.useRef)(null);
  const translateRef = (0, import_react15.useRef)(t);
  translateRef.current = t;
  const [kept, setKept] = (0, import_react15.useState)({});
  const [toast, setToast] = (0, import_react15.useState)(null);
  const toasts = (0, import_react15.useRef)(0);
  const board = view.board;
  const boardRef = (0, import_react15.useRef)(null);
  boardRef.current = board;
  const ids = (0, import_react15.useMemo)(() => board ? board.cards.map((entry) => entry.id) : [], [board]);
  const mine = (0, import_react15.useMemo)(() => arranged(ids, board?.arrangement), [ids, board?.arrangement]);
  const raised = useRaised(board?.cards ?? []);
  const order = (0, import_react15.useMemo)(() => visibleOrder(mine, raised), [mine, raised]);
  const shown = (0, import_react15.useMemo)(() => {
    const byId = new Map((board?.cards ?? []).map((entry) => [entry.id, entry]));
    return order.map((id) => byId.get(id)).filter(Boolean);
  }, [board, order]);
  const gridRef = (0, import_react15.useRef)(null);
  const [contentRef, tracks] = useTracks();
  useGlide(gridRef, order.join("\n"));
  const [said, setSaid] = (0, import_react15.useState)("");
  const show = (0, import_react15.useCallback)((next) => setView((prev) => ({
    board: next,
    live: next === null ? {} : nextLive(prev.board?.id === next.id ? prev.board : null, next, prev.board?.id === next.id ? prev.live : {})
  })), []);
  const loadList = (0, import_react15.useCallback)(async () => {
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
  const loadBoard = (0, import_react15.useCallback)(async (id, fresh) => {
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
  const loadCard = (0, import_react15.useCallback)(async (boardId, id) => {
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
  const onEvent = (0, import_react15.useCallback)((message) => {
    const id = currentRef.current;
    if (!id) return;
    if (message.type === "card") loadCard(id, message.id);
    else if (message.type === "board" || message.type === "hello" || message.type === "arrange") loadBoard(id, false);
    else if (message.type === "gone") {
      show(null);
      setBoardError(requestError(403));
      loadList();
    }
  }, [loadBoard, loadCard, loadList, show]);
  const status = kit.useEventStream(current ? `api/card-board/events?board=${encodeURIComponent(current)}` : null, onEvent);
  const post = (0, import_react15.useCallback)(async (body) => {
    const response = await fetch(api("action"), {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ board: currentRef.current, ...body })
    });
    const answer = await response.json().catch(() => null);
    if (!response.ok) throw new Error(errorText(requestError(response.status, answer), translateRef.current));
    loadBoard(currentRef.current, false);
    return answer;
  }, [loadBoard]);
  const showToast = (0, import_react15.useCallback)((next) => setToast({ seq: ++toasts.current, ...next }), []);
  const keepArrangement = (0, import_react15.useCallback)(async (next, board2) => {
    setView((prev) => prev.board?.id === board2 ? { ...prev, board: { ...prev.board, arrangement: next ?? void 0 } } : prev);
    try {
      const response = await fetch(api("arrange"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next === null ? { board: board2, reset: true } : { board: board2, ...next })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      showToast({ text: "arrange.failed" });
      loadBoard(board2, true);
    }
  }, [loadBoard, showToast]);
  const undo = (0, import_react15.useCallback)(async (pressId, card) => {
    try {
      await post({ card, undo: pressId });
      showToast({ text: "toast.undone" });
    } catch {
      showToast({ text: "toast.undoFailed" });
    }
  }, [post, showToast]);
  const press = (0, import_react15.useCallback)(async (action, extra, target, at2) => {
    const answer = await post({ ...target, id: action.id, ...extra });
    if (answer?.undoable) {
      showToast({ text: TOAST_KEYS[action.kind] ?? "toast.event", undo: () => undo(answer.press, target.card) });
      const keep = action.kind === "done" && at2 !== void 0 ? keepOf(at2.row, at2.index) : void 0;
      if (keep) setKept((prev) => ({ ...prev, [target.card]: withKept(prev[target.card], keep) }));
    }
    return answer;
  }, [post, showToast, undo]);
  (0, import_react15.useEffect)(() => {
    loadList();
  }, [loadList]);
  (0, import_react15.useEffect)(() => {
    currentRef.current = current;
    if (!current) return;
    etag.current = null;
    setKept({});
    setToast(null);
    setView((prev) => prev.board?.id === current ? prev : { board: null, live: {} });
    loadBoard(current, true);
  }, [current, loadBoard]);
  const waiting = board?.cards.some((entry) => entry.presses?.some((p) => p.state === "pending")) === true;
  (0, import_react15.useEffect)(() => {
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
  const reported = (0, import_react15.useRef)("");
  (0, import_react15.useEffect)(() => {
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
  (0, import_react15.useEffect)(() => {
    const onPop = () => {
      pushed.current = false;
      setOpened(readNav(location.search));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const openCard = (0, import_react15.useCallback)((boardId, card, row) => {
    const nav = { board: boardId, card, ...row === void 0 ? {} : { row } };
    window.history[pushed.current ? "replaceState" : "pushState"](window.history.state, "", `${location.pathname}${writeNav(location.search, nav)}${location.hash}`);
    pushed.current = true;
    setOpened(nav);
  }, []);
  const closeCard = (0, import_react15.useCallback)(() => {
    setOpened({});
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else window.history.replaceState(window.history.state, "", `${location.pathname}${writeNav(location.search, {})}${location.hash}`);
  }, []);
  const rearrange = (next, id, saying) => {
    if (board === null) return;
    keepArrangement(next, board.id);
    const title = pickText(boardRef.current?.cards.find((entry) => entry.id === id)?.card?.title, active) ?? id;
    const place = [...visibleOrder(next, raised)].indexOf(id) + 1;
    setSaid(t(saying, { title, n: place, total: ids.length }));
  };
  const { drag, begin } = useCardDrag((id, target, after) => rearrange(dropCard(mine, id, target, after), id, "arrange.moved"));
  const arrangeOf = (id) => ({
    pinned: mine.pinned.includes(id),
    canUp: canShift(mine, id, -1),
    canDown: canShift(mine, id, 1),
    onPin: () => mine.pinned.includes(id) ? rearrange(unpinCard(mine, id), id, "arrange.unpinnedDone") : rearrange(pinCard(mine, id), id, "arrange.pinnedDone"),
    onMove: (delta) => rearrange(shiftCard(mine, id, delta), id, "arrange.moved"),
    onGrip: (event) => {
      event.preventDefault();
      begin(event, id, false);
    },
    onHold: (event) => begin(event, id, true)
  });
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
  if (!ready) return (0, import_react15.createElement)("div", { className: "cb-page" });
  let content;
  if (listError) content = (0, import_react15.createElement)("p", { className: "cb-notice" }, errorText(listError, t));
  else if (boards === null) content = (0, import_react15.createElement)("p", { className: "cb-muted" }, t("loading"));
  else if (boards.length === 0) content = (0, import_react15.createElement)("div", { className: "cb-empty" }, (0, import_react15.createElement)("p", { className: "cb-emptyTitle" }, t("emptyTitle")), (0, import_react15.createElement)("p", { className: "cb-muted" }, t("emptyHint")));
  else if (boardError) content = (0, import_react15.createElement)("p", { className: "cb-notice" }, errorText(boardError, t));
  else if (!board) content = (0, import_react15.createElement)("p", { className: "cb-muted" }, t("loading"));
  else content = (0, import_react15.createElement)(
    import_react15.Fragment,
    null,
    board.problems?.length > 0 && (0, import_react15.createElement)("div", { className: "cb-notice" }, t("boardProblems"), (0, import_react15.createElement)("ul", { className: "cb-problems" }, board.problems.map((p, i) => (0, import_react15.createElement)("li", { key: i }, p)))),
    board.cards.length === 0 && (0, import_react15.createElement)("p", { className: "cb-muted" }, t("noCards")),
    (0, import_react15.createElement)(
      "div",
      { className: "cb-grid", ref: gridRef, style: { gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))`, gridAutoRows: `${ROW}px`, columnGap: GAP } },
      shown.map((entry) => (0, import_react15.createElement)(Card, {
        key: entry.id,
        entry,
        live: liveOf(view.live, entry.id),
        boardId: board.id,
        assistant: board.assistant,
        tracks,
        active,
        locale,
        t,
        press,
        undo,
        kept: kept[entry.id],
        onOpen: (row) => openCard(board.id, entry.id, row),
        raised: raised.has(entry.id),
        dragging: drag?.id === entry.id ? drag : null,
        drop: drag?.hint?.target === entry.id ? drag.hint.after ? "after" : "before" : void 0,
        arrange: entry.card && arrangeOf(entry.id)
      }))
    )
  );
  const openEntry = opened.card && board && (!opened.board || opened.board === board.id) ? board.cards.find((entry) => entry.id === opened.card && entry.card) : void 0;
  const openCardData = openEntry && pickCard(openEntry.card, active);
  const openRow = openCardData && opened.row !== void 0 ? openCardData.data.rows?.find((r) => r.key === opened.row) : void 0;
  const sheet = (0, import_react15.createElement)(Sheet, {
    open: Boolean(openEntry),
    onClose: closeCard,
    title: openRow ? openRow.title ?? openRow.label : openCardData?.title,
    closeLabel: t("close")
  }, openEntry && (0, import_react15.createElement)(Card, { entry: openEntry, live: liveOf(view.live, openEntry.id), boardId: board.id, assistant: board.assistant, tracks: 1, active, locale, t, press, undo, kept: kept[openEntry.id], sheet: true, row: opened.row }));
  return (0, import_react15.createElement)(
    "div",
    { className: "cb-page" },
    (0, import_react15.createElement)(
      "div",
      { className: "cb-content", ref: contentRef },
      (0, import_react15.createElement)(
        "div",
        { className: "cb-heading" },
        (0, import_react15.createElement)("h1", null, boards?.length === 1 ? titleOf(boards[0]) : t("title")),
        board && (0, import_react15.createElement)(
          "div",
          { className: "cb-sub" },
          (0, import_react15.createElement)(kit.LiveStatus, { status, updatedAt: newest || void 0 }),
          board.readOnly && (0, import_react15.createElement)("span", { className: "cb-readOnly", title: t("readOnly.hint") }, t("readOnly")),
          board.arrangement && (0, import_react15.createElement)(import_dsh_client_ui_primitives5.Button, { variant: "ghost", size: "sm", className: "cb-reset", title: t("arrange.resetHint"), onClick: () => {
            keepArrangement(null, board.id);
            setSaid(t("arrange.resetDone"));
          } }, t("arrange.reset"))
        )
      ),
      boards && boards.length > 1 && (0, import_react15.createElement)("div", { className: "cb-tabs", role: "tablist" }, boards.map((b) => (0, import_react15.createElement)(import_dsh_client_ui_primitives5.Pill, { key: b.id, active: b.id === current, role: "tab", "aria-selected": b.id === current, title: titleOf(b), onClick: () => choose(b.id) }, titleOf(b)))),
      content
    ),
    board && sheet,
    (0, import_react15.createElement)("div", { className: "cb-sr", role: "status", "aria-live": "polite" }, said),
    toast && (0, import_react15.createElement)(import_dsh_client_ui_primitives5.Toast, {
      key: toast.seq,
      text: t(toast.text),
      tone: "success",
      ...toast.undo ? { holdMs: UNDO_HOLD_MS, actions: [{ label: (0, import_react15.createElement)("span", { className: "cb-toastUndo" }, t("undo")), onClick: () => {
        setToast(null);
        toast.undo();
      } }] } : {},
      onDone: () => setToast(null)
    })
  );
}

// src/client/index.js
var NS = "dsh-card-board";
var PANEL = "dsh-card-board";
function SidebarIcon({ size }) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  return (0, import_react16.createElement)(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true, focusable: "false" },
    (0, import_react16.createElement)("rect", { x: 1.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    (0, import_react16.createElement)("rect", { x: 8.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    (0, import_react16.createElement)("rect", { x: 1.75, y: 8.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
    (0, import_react16.createElement)("path", { d: "M9 13.5l1.6-2 1.4 1 2-2.8", ...stroke })
  );
}
function Page() {
  return useKit() === null ? (0, import_react16.createElement)("div", { className: "cb-page" }) : (0, import_react16.createElement)(BoardsPage);
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
  ctx.effect(() => {
    if (typeof location === "undefined" || !hasNav(location.search)) return () => {
    };
    let tries = 0;
    const timer = setInterval(() => {
      const layout = ctx.get("layout");
      try {
        layout?.selectPanel(PANEL);
        if (layout) clearInterval(timer);
      } catch {
      }
      if (++tries > 50) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, "card-board: card link");
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
