# Big icons beside numbers

Status: decided for 0.13.0.

## The need

A card's head has one small tile, which says what the card is about. A card whose content is a few numbers (a balance, a temperature, a count of trophies) still reads as a block of figures: the eye has to read every label to find the one it wants. A picture next to each number lets a glance land on it.

## What others do

- **Home Assistant's tile card** puts the entity's icon on a tinted round shape at the left, with the name and the state stacked beside it. The tint follows the entity's colour or state; the shape is the visual anchor of the tile ([tile card](https://www.home-assistant.io/dashboards/tile/)).
- **Apple's widgets** use one descriptive icon or a strong background colour per widget to make it recognisable, and keep a fixed, consistent layout, with a "large text" layout for content that is mainly a number ([Design widgets for the Smart Stack, WWDC23](https://developer.apple.com/videos/play/wwdc2023/10309/)). Activity and Fitness pair each figure with its own coloured glyph.
- **Grafana's stat panel** has no icons: it carries meaning with colour (value or background by threshold) and a sparkline behind the number.

## Decisions

1. **The icon belongs to the number, not the card.** A stat item takes `icon`; it draws on a tinted tile beside the label and the number, the Home Assistant arrangement, because our stat items already flow side by side and a tile on the left keeps each one compact. Delta, progress and sub-lines sit under the words; a strip of hours takes the full width.
2. **The same tile as everywhere else, bigger.** It is dsh-ui-kit's `Tile`, the shape the card head and rows use, at 48 px (44 above a chart or rows, 40–42 on a phone), so the board keeps one visual language and light and dark come from the theme tokens.
3. **Its tint is the item's, then the card's.** `iconTone` when the picture wants a colour the number shouldn't have (a gold coin beside a plain balance), else the item's `tone`, else the card's, so a card stays one colour unless the data says otherwise.
4. **A countdown takes the same tile before its big number** (`data.icon`), since its number is the whole card.
5. **No icon on cards made of rows.** List and status rows already have their own tiles; a big one on top would only add noise. Producers give icons to the numbers a glance should find, not to every item.
