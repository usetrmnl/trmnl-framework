# Responsive Test

This page tests responsive utilities by comparing SCSS mixins with CSS classes across different screen conditions. Each test row shows an element styled with SCSS mixins alongside the same element styled with CSS utility classes. Both columns should look identical when the conditions are met, demonstrating that mixins and classes produce equivalent results.

### Utilities

#### Background

Test Case

SCSS Mixin Result

CSS Class Result

md:bg--gray-50

@include screen.screen('md')

Gray bg on md+ screens

portrait:bg--gray-50

@include screen.screen('portrait')

Gray bg in portrait

2bit:bg--gray-50

@include screen.screen('2bit')

Gray bg on 2-bit screens

md:portrait:bg--gray-50

@include screen.screen('md', 'portrait')

Gray bg on md+ portrait

md:2bit:bg--gray-50

@include screen.screen('md', '2bit')

Gray bg on md+ 2-bit

portrait:2bit:bg--gray-50

@include screen.screen('portrait', '2bit')

Gray bg on portrait 2-bit

md:portrait:2bit:bg--gray-50

@include screen.screen('md', 'portrait', '2bit')

Gray bg on md+ portrait 2-bit

#### Visibility

Test Case

SCSS Mixin Result

CSS Class Result

sm:hidden

@include screen.screen('sm')

Hidden on sm+ screens

portrait:hidden

@include screen.screen('portrait')

Hidden on portrait screens

4bit:hidden

@include screen.screen('4bit')

Hidden on 4-bit screens

md:portrait:hidden

@include screen.screen('md', 'portrait')

Hidden on md+ portrait screens

lg:2bit:hidden

@include screen.screen('lg', '2bit')

Hidden on lg+ 2-bit screens

portrait:4bit:hidden

@include screen.screen('portrait', '4bit')

Hidden on portrait 4-bit screens

md:portrait:2bit:hidden

@include screen.screen('md', 'portrait', '2bit')

Hidden on md+ portrait 2-bit screens

#### Text

Test Case

SCSS Mixin Result

CSS Class Result

lg:text--center

@include screen.screen('lg')

Centered text on lg+ screens

Aa

Aa

portrait:text--center

@include screen.screen('portrait')

Centered text in portrait

Aa

Aa

2bit:text--center

@include screen.screen('2bit')

Centered text on 2-bit screens

Aa

Aa

md:portrait:text--center

@include screen.screen('md', 'portrait')

Centered on md+ portrait

Aa

Aa

lg:4bit:text--center

@include screen.screen('lg', '4bit')

Centered on lg+ 4-bit screens

Aa

Aa

portrait:2bit:text--center

@include screen.screen('portrait', '2bit')

Centered on portrait 2-bit screens

Aa

Aa

md:portrait:2bit:text--right

@include screen.screen('md', 'portrait', '2bit')

Right-aligned on md+ portrait 2-bit

Aa

Aa

#### Flex

Test Case

SCSS Mixin Result

CSS Class Result

md:flex--center

@include screen.screen('md')

Centered on md+ screens

portrait:flex--col

@include screen.screen('portrait')

Column layout in portrait

lg:portrait:flex--center

@include screen.screen('lg', 'portrait')

Centered on lg+ portrait

#### Spacing

Test Case

SCSS Mixin Result

CSS Class Result

md:p--24

@include screen.screen('md')

Padding 24 on md+ screens

portrait:mx--20

@include screen.screen('portrait')

Horizontal margin 20 in portrait

#### Gap

Test Case

SCSS Mixin Result

CSS Class Result

lg:gap--xlarge

@include screen.screen('lg')

Gap xlarge on lg+ screens

portrait:gap--large

@include screen.screen('portrait')

Large gap in portrait

#### Size

Test Case

SCSS Mixin Result

CSS Class Result

md:w--36

@include screen.screen('md')

Large width on md+ screens

#### Rounded

Test Case

SCSS Mixin Result

CSS Class Result

md:rounded--xlarge

@include screen.screen('md')

Rounded xlarge on md+ screens

#### Grid

Test Case

SCSS Mixin Result

CSS Class Result

md:grid--cols-3

@include screen.screen('md')

3 columns on md+ screens

### Base

#### Layout

Test Case

SCSS Mixin Result

CSS Class Result

md:layout--col

@include screen.screen('md')

Column layout on md+ screens

portrait:layout--bottom

@include screen.screen('portrait')

Bottom alignment in portrait

lg:portrait:layout--bottom

@include screen.screen('lg', 'portrait')

Bottom alignment on lg+ portrait

### Elements

#### Value

Test Case

SCSS Mixin Result

CSS Class Result

md:value--large

Large value on md+ screens

Aa

portrait:value--large

Large value in portrait

Aa

4bit:value--large

Large value on 4-bit screens

Aa

lg:portrait:value--large

Large value on lg+ portrait

Aa

md:2bit:value--large

Large value on md+ 2-bit screens

Aa

portrait:4bit:value--large

Large value on portrait 4-bit

Aa

lg:portrait:4bit:value--xlarge

XLarge on lg+ portrait 4-bit

Aa

#### Label

Test Case

SCSS Mixin Result

CSS Class Result

md:label--small

Small label on md+ screens

Label

portrait:label--outline

Outlined label in portrait

Label

2bit:label--inverted

Inverted label on 2-bit screens

Label

md:portrait:label--underline

Underlined label on md+ portrait

Label

md:2bit:label--gray

Gray label on md+ 2-bit

Label

portrait:2bit:label--small

Small label on portrait 2-bit

Label

md:portrait:2bit:label--inverted

Inverted label on md+ portrait 2-bit

Label

### Components

No component tests have been implemented yet

 Previous  [ 

## Responsive

Adapt styles to the device's size class, orientation, and bit depth using variant prefixes

 ](/framework/docs/3.0/responsive)

 Next  [ 

## Visibility

Control element visibility based on display bit depth

 ](/framework/docs/3.0/visibility)

