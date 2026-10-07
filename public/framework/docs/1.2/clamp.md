# Clamp

The Clamp system provides a way to truncate text content with ellipsis after a specified number of lines. Using classes from `clamp--1` to `clamp--35`, you can precisely control how many lines of text to display before truncating.

### Text Clamping Options

Text can be clamped to either a single line or multiple lines, depending on your layout needs. The clamp system uses CSS line-clamp properties to ensure consistent truncation across browsers.

#### Single Line Clamp

The `clamp--1` class truncates text to a single line, adding an ellipsis when content overflows.

Clamp 1 This text is clamped to a single line. Any overflow will be truncated with an ellipsis. 

Clamp 1 This text is clamped to a single line. Any overflow will be truncated with an ellipsis. 

Clamp 1 This text is clamped to a single line. Any overflow will be truncated with an ellipsis. 

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Single Line ClampDesign System

```
<span class="description clamp--1">
  This text is clamped to a single line. Any overflow will be truncated with an ellipsis.
</span>
```

#### Multi-line Clamp

The `clamp--{n}` classes (where n is any number from 1 to 35) allow you to control exactly how many lines of text to display before truncating with an ellipsis. This gives you precise control over text display while maintaining layout consistency.

Clamp 3 This text is clamped to three lines. It will show up to three lines of text before truncating with an ellipsis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 

Clamp 3 This text is clamped to three lines. It will show up to three lines of text before truncating with an ellipsis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 

Clamp 3 This text is clamped to three lines. It will show up to three lines of text before truncating with an ellipsis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Multi-line ClampDesign System

```
<span class="description clamp--3">
  This text is clamped to three lines. It will show up to three lines of text before truncating with an ellipsis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</span>
```

### Removing Text Clamping

The `clamp--none` class allows you to remove any clamping applied to an element, restoring normal text flow and word wrapping behavior. This will reset text overflow handling, remove line clamping, and allow text to break naturally at word boundaries.

```
<span class="description clamp--none">
  This text has all clamping removed. It will display naturally without any truncation or ellipsis, regardless of length.
</span>
```

 Previous  [ 

## Overflow

Handle column items overflow

 ](/framework/docs/1.2/overflow)

 Next  [ 

## Format Value

Format numbers and values with consistent styling

 ](/framework/docs/1.2/format_value)

