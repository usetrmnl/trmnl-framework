# Clamp

The Clamp engine truncates text to a specified number of lines using word-based ellipsis. It preserves the original text, measures available width, and re-applies clamping whenever layouts change.

### Basic usage

Add `data-clamp="N"` to any text element to clamp it to N lines. The engine preserves the original text and re-applies clamping when layouts change.

1

Scranton Strategy Alignment & Cross-Department Fire Drill PostmortemWeekly alignment where Michael brings a whiteboard titled 'Vision Board' and Dwight brings a megaphone. We cover priorities (sell paper), blockers (also sell paper), and stakeholder comms (Jan keeps emailing 'no'). Includes a risk roundtable about candles near plasma TVs.
9:00 AM - 10:00 AMConfirmed

2

Client Presentation: 'Threat Level Midnight' Business CutMarquee client session featuring tasteful charts by Pam, heartfelt narration by Agent Michael Scarn, and exactly one confetti pop. Feedback collected, dignity mostly preserved.
2:00 PM - 3:30 PMTentative

3

Café Disco Launch & Dundies Seating ChartTurn in every form, tape down every extension cord, and finalize seating so no one sits near the speaker labelled 'BASS.' Creed volunteers to be DJ and then vanishes.
11:59 PMImportant

4

Complaint Box Sorting & Schrute Compliance SweepSort grievances ('too much jazz,' 'too little jazz'), verify stapler locations, and initial the 'identity theft = not a joke' acknowledgement sheet.
3:30 PM - 4:30 PMHigh Priority

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ClampStandalone: Descriptions 1 to 4 lines

```
<span class="description" data-clamp="2">Example description text that will be clamped to two lines</span>
```

### Responsive

Use the same size and orientation modifiers as other framework components. Specificity (most specific first): size + orientation (e.g. `data-clamp-md-portrait`), size only (`data-clamp-sm`, `-md`, `-lg`), orientation only (`data-clamp-portrait`), then base `data-clamp`.

```
<span class="description" data-clamp="2" data-clamp-md="4" data-clamp-portrait="1">Clamp to 2 lines by default, 4 on medium+ screens, 1 in portrait</span>
```

### Backward Compatibility

Legacy class tokens are supported and mapped to the Clamp engine automatically: `clamp--none` disables clamping, and `clamp--1` through `clamp--50` request N lines.

1

Scranton Strategy Alignment & Cross-Department Fire Drill PostmortemWeekly alignment where Michael brings a whiteboard titled 'Vision Board' and Dwight brings a megaphone. We cover priorities (sell paper), blockers (also sell paper), and stakeholder comms (Jan keeps emailing 'no'). Includes a risk roundtable about candles near plasma TVs.
9:00 AM - 10:00 AMConfirmed

2

Client Presentation: 'Threat Level Midnight' Business CutMarquee client session featuring tasteful charts by Pam, heartfelt narration by Agent Michael Scarn, and exactly one confetti pop. Feedback collected, dignity mostly preserved.
2:00 PM - 3:30 PMTentative

3

Café Disco Launch & Dundies Seating ChartTurn in every form, tape down every extension cord, and finalize seating so no one sits near the speaker labelled 'BASS.' Creed volunteers to be DJ and then vanishes.
11:59 PMImportant

4

Complaint Box Sorting & Schrute Compliance SweepSort grievances ('too much jazz,' 'too little jazz'), verify stapler locations, and initial the 'identity theft = not a joke' acknowledgement sheet.
3:30 PM - 4:30 PMHigh Priority

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Clamp (Legacy)Descriptions: clamp--1, clamp--2, clamp--3, clamp--none

```
<span class="description clamp--2">Example description with legacy class clamped to two lines of text</span>
```

 Previous  [ 

## Table Overflow

Handle table rows overflow

 ](/framework/docs/3.4/table_overflow)

 Next  [ 

## Format Value

Format numbers and values with consistent styling

 ](/framework/docs/3.4/format_value)

