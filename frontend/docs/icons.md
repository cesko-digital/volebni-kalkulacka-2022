# Icons

Design system uses mix of [Material Design icons](https://materialdesignicons.com) and custom ones.

## How to use icons

First, you need to import the icons you need. Use camelCased name of the icon prefixed either with `mdi` for Material Design icons or `vki` for custom icons:

```js
// import Material Design icon
import { mdiArrowLeft } from '@mdi/js';
// import custom icon
import { vkiLogoInFavour } from '@/components/design-system/icons';
```

Second, you need to import the icon component and provide it with the icon:

```js
import IconComponent from '@/components/design-system/icons/IconComponent.vue';
<IconComponent :icon="vkiLogoInFavour" />
```

### Customization

#### Size

Icons are based on 24 × 24 px grid (default) and can be sized to either 16 px (small) or 32 px (large):

```js
<IconComponent :icon="vkiLogoInFavour" size="small" />
<IconComponent :icon="vkiLogoInFavour" size="large" />
```

#### Color

By default, icons inherits the current text color (`fill: currentColor;`). To change the color, provide it using CSS color:

```js
<IconComponent :icon="vkiLogoInFavour" color="rgb(var(--color-primary-fg))" />
```

#### Title

In case the icon is not only a visual enhancement (for example supplementary to a label) but has a meaning, you should add title for accessibility:

```js
<IconComponent :icon="vkiLogoInFavour" title="I'm in favour" />
```

## How to add icons

To add a new icon, be sure to adhere to the 24 × 24 px grid and simplify the icon to contain only one SVG path using [SVGO](https://jakearchibald.github.io/svgomg).

Then add a new file to `@components/icons/vkiYourNewIcon.ts` with the path string:

```js
export default 'M3.5 20.5V3.5H20.5V20.5H3.5ZM5 19H19V5H5V19Z';
```

and don't forget to add export in `@components/icons/index.ts`.
