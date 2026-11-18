/**
 * The page's layout. Colours only through DSH theme tokens, so light and dark follow the app; DSH's own components and
 * the kit's pieces bring their own look.
 */

export const STYLE_ID = 'dsh-card-board-style'

export const CSS = `
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
`
