# Item

A row for lists, schedules, and other repeating content, with optional meta text, an index, or an icon. Stack items in a Layout and let the Overflow engine handle the ones that do not fit.

### Item Variants

Items can be displayed in four variants: with meta and index, with meta only, with meta emphasis levels, or in a simple format. Each variant provides different levels of visual hierarchy and information density.

#### With Meta

This variant includes a meta section without an index, providing space for optional metadata while maintaining a clean appearance.

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

Code ReviewReview pull requests for Project Beta
3:30 PM - 4:30 PMHigh Priority

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ItemWith Meta

```
<div class="item">
  <div class="meta"></div>
  <div class="content">
    <span class="title title--small">Team Meeting</span>
    <span class="description">Weekly team sync-up</span>
    <div class="flex gap--small">
      <span class="label label--small label--underline">9:00 AM - 10:00 AM</span>
      <span class="label label--small label--underline">Confirmed</span>
    </div>
  </div>
</div>
```

#### With Meta Emphasis

Items support three emphasis levels: default, emphasis-2, and emphasis-3. Apply `item--emphasis-2` or `item--emphasis-3` to progressively darken the meta bar and draw attention.

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ItemEmphasis Levels

```
<div class="item">
  <div class="meta"></div>
  <div class="content">
    <span class="title title--small">Team Meeting</span>
    <span class="description">Weekly team sync-up</span>
    <div class="flex gap--small">
      <span class="label label--small label--underline">9:00 AM - 10:00 AM</span>
      <span class="label label--small label--underline">Confirmed</span>
    </div>
  </div>
</div>

<div class="item item--emphasis-2">
  <div class="meta"></div>
  <div class="content">
    <span class="title title--small">Client Presentation</span>
    <span class="description">Quarterly review with XYZ Corp</span>
    <div class="flex gap--small">
      <span class="label label--small label--underline">2:00 PM - 3:30 PM</span>
      <span class="label label--small label--underline">Tentative</span>
    </div>
  </div>
</div>

<div class="item item--emphasis-3">
  <div class="meta"></div>
  <div class="content">
    <span class="title title--small">Project Deadline</span>
    <span class="description">Submit final deliverables for Project Alpha</span>
    <div class="flex gap--small">
      <span class="label label--small label--underline">11:59 PM</span>
      <span class="label label--small label--underline">Important</span>
    </div>
  </div>
</div>
```

#### With Meta and Index

The most detailed variant includes both a meta section and an index number, useful for ordered lists or when additional context is needed.

1

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

2

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

3

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

4

Code ReviewReview pull requests for Project Beta
3:30 PM - 4:30 PMHigh Priority

1

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

2

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

3

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ItemWith Meta and Index

```
<div class="item">
  <div class="meta">
    <span class="index">1</span>
  </div>
  <div class="content">
    <span class="title title--small">Team Meeting</span>
    <span class="description">Weekly team sync-up</span>
    <div class="flex gap--small">
      <span class="label label--small label--underline">9:00 AM - 10:00 AM</span>
      <span class="label label--small label--underline">Confirmed</span>
    </div>
  </div>
</div>
```

#### Simple

The simplest variant focuses purely on content, ideal for basic lists or when metadata isn't needed.

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

Code ReviewReview pull requests for Project Beta
3:30 PM - 4:30 PMHigh Priority

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ItemSimple

```
<div class="item">
  <div class="content">
    <span class="title title--small">Team Meeting</span>
    <span class="description">Weekly team sync-up</span>
    <div class="flex gap--small">
      <span class="label label--small label--underline">9:00 AM - 10:00 AM</span>
      <span class="label label--small label--underline">Confirmed</span>
    </div>
  </div>
</div>
```

#### With Icon

Add an `icon` div between meta and content to display an icon alongside the item. Give monochrome icons the `image--adaptive` class so they follow the screen's semantic text-primary paint across Raw/Preview, themes, and dark mode (see [Image](/framework/docs/3.4/image) ).

 ![](/images/plugins/weather/wi-thermometer.svg)

72°Temperature

 ![](/images/plugins/weather/wi-strong-wind.svg)

12 mphWind Speed

 ![](/images/plugins/weather/wi-hot.svg)

6UV Index

 ![](/images/plugins/weather/wi-day-sunny.svg)

SunnyToday

 ![](/images/plugins/weather/wi-day-cloudy.svg)

Partly CloudyTomorrow

 ![](/images/plugins/weather/wi-rain.svg)

RainyWednesday

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ItemWith Icon

```
<div class="layout">
  <div class="item">
    <div class="meta"></div>
    <div class="icon">
      <img src="path/to/icon.svg" class="image--adaptive w--[6cqw] h--[6cqh] portrait:w--[10cqw] portrait:h--[10cqh]" />
    </div>
    <div class="content">
      <span class="value value--small">72°</span>
      <span class="label">Temperature</span>
    </div>
  </div>
</div>
```

### Filling Spare Space

An item sizes to its content. Add `item--shrink` to make it flexible instead: it grows into the container's spare space along the main axis and gives that space back when the container runs tight.

Use it for the one item that should absorb the leftover room, such as the body row above a fixed footer row. Applying it to every item in a container splits the space between them.

```
<div class="flex flex--col h--36">
  <div class="item item--shrink">
    <div class="meta"></div>
    <div class="content">
      <span class="value value--small">72°</span>
      <span class="label">Temperature</span>
    </div>
  </div>
  <div class="item">
    <div class="meta"></div>
    <div class="content">
      <span class="label label--small">Updated 4 min ago</span>
    </div>
  </div>
</div>
```

### List component (deprecated)

The `.list` class is deprecated. Prefer a column component, flex column, grid column, or a layout wrapper with a [Gap](/framework/docs/3.4/gap) utility instead. The [Overflow](/framework/docs/3.4/overflow) engine still supports legacy `.list` for backward compatibility.

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--item-index-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--item-index-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--item-index-font-smoothing` | none | none | auto | - |
| `--item-index-font-weight` | 400 | 400 | clamp(100, calc(600 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--item-index-line-height` | 1 | 1 | 1 | - |
| `--item-meta-width` | calc(10px \* var(--ui-scale)) | calc(10px \* var(--ui-scale)) | - | calc(10px \* var(--ui-scale)) |

### Related APIs

#### Theming the item

A theme can re-point the item's paint through its named slots (`item-meta`, `item-meta-emphasis-2`, `item-meta-emphasis-3`) without touching geometry. Slots take palette token references, so the surface still resolves through the device mode at render time. See [Theme Slots](/framework/docs/3.4/theme_slots) for every slot and mixin.

```
@include theme-slots.text-slot("item-meta", "black");
```

 Previous  [ 

## Rich Text

Display formatted paragraphs with alignment and size variants

 ](/framework/docs/3.4/rich_text)

 Next  [ 

## Table

Create data tables optimized for 1-bit rendering

 ](/framework/docs/3.4/table)

