# Inverse

The Inverse utility flips one element and its children to the opposite color scheme: light content on a dark surface, or the reverse. Use it to make one element stand out, an active item or a selected row, without touching its siblings.

### Usage

Add `inverse` to a container to flip it and everything inside.

```
<div class="item inverse">
  <div class="content">
    <span class="title">Active item</span>
  </div>
</div>
```

### Active Collection Rows

Invert individual rows so the active ones stand out in a longer list. The row's background, text, and other framework paint change together.

Desk M1

Occupied

Booked with TRMNL · 7:00 - 15:00

Desk M2

Occupied

laura@example.com · Booked for the day

Desk M3

Available

Desk M4

Available

Desk S1

Available

Until 8:30

Desk S2

Available

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Bookable desks

```
<!-- Active row -->
<div class="item inverse item--emphasis-3 rounded--xsmall">
  <div class="meta"></div>
  <div class="content">
    <span class="title title--small">Desk M1</span>
    <span class="description">Occupied</span>
  </div>
</div>

<!-- Inactive sibling -->
<div class="item bg--white rounded--xsmall">
  <div class="meta"></div>
  <div class="content">
    <span class="title title--small">Desk M3</span>
    <span class="description">Available</span>
  </div>
</div>
```

### Active Collection Cards

Use inverse cards when several resources share the same grid and only some need attention. The stronger surface separates the occupied rooms from the available ones.

Auxiliary meeting room

Available

&nbsp;

Board room

Marketing Sync

11:00 - 12:30

Huddle Space Alpha

Occupied

11:15 - 11:45

Huddle Space Beta

Available

&nbsp;

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Meeting rooms

```
<div class="grid grid--cols-2 gap--small">
  <div class="bg--white rounded--xsmall p--3">
    <div class="title">Available</div>
  </div>

  <div class="inverse rounded--xsmall p--3">
    <div class="title">Marketing Sync</div>
    <div class="description">11:00 - 12:30</div>
  </div>
</div>
```

### State Transitions

Apply inverse to a whole surface when a state change should recolor everything on it. An occupied meeting room, for example, inverts its schedule, dividers, and attendee details as one.

11:00 - 12:30

Marketing Sync

laura@example.com & 5 more

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Board room20 seats

```
<div class="view view--full">
  <div class="layout layout--col gap--large p--16 inverse rounded">
    <div class="flex flex--col flex--center gap--large h--full">
      <div class="text--large font--regular">11:00 - 12:30</div>
      <div class="divider w--full"></div>
      <div class="text--mega font--bold text--center">Marketing Sync</div>
      <div class="divider w--full"></div>
      <div class="text--large font--regular">laura@example.com &amp; 5 more</div>
    </div>
  </div>
</div>
```

### What Inverse Flips

Inverse flips everything the framework paints inside the element: backgrounds, text, borders, strokes, icons, and chart colors.

Anything you set directly on the element wins over the inverse defaults, and a theme can style its own inverse with `.screen--theme-<id> .inverse`. See [Theme Slots](/framework/docs/3.4/theme_slots) and [Themes](/framework/docs/3.4/themes) .

Inverse is not the `invert` image filter: it changes what the framework paints instead of flipping pixels. It also does not turn on `dark:` utilities; those still need `screen--dark-mode`.

 Previous  [ 

## Scale

Scale interface to affect content density and readability

 ](/framework/docs/3.4/scale)

 Next  [ 

## Font Family

Switch between Classic and TRMNL font bundles per device

 ](/framework/docs/3.4/font_family)

