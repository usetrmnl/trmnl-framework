# Item

The Item component provides a flexible container for displaying content with optional metadata and indexing. It's commonly used for lists, schedules, and other content that needs consistent formatting.

### Item Variants

Items can be displayed in three different variants: with meta and index, with meta only, or in a simple format. Each variant provides different levels of visual hierarchy and information density.

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

 Previous  [ 

## Rich Text

Display formatted paragraphs with alignment and size variants

 ](/framework/docs/1.2/rich_text)

 Next  [ 

## Table

Create data tables optimized for 1-bit rendering

 ](/framework/docs/1.2/table)

