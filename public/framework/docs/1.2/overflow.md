# Overflow

The Overflow Management system provides a way to handle layouts that exceed a specified height limit. It automatically hides excess items and provides a visual indicator for hidden content.

### Basic Usage

To enable overflow management on a list, add the `data-list-limit="true"` attribute. Specify a custom maximum height of the container using `data-list-max-height` expressed in pixel values.

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

3

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

And 6 more

1

Team MeetingWeekly team sync-up
9:00 AM - 10:00 AMConfirmed

2

Client PresentationQuarterly review with XYZ Corp
2:00 PM - 3:30 PMTentative

3

Project DeadlineSubmit final deliverables for Project Alpha
11:59 PMImportant

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Overflow ManagementWith Hidden Count

```
<div class="column"
     data-list-limit="true"
     data-list-max-height="340"
     data-list-hidden-count="true"
     data-list-max-columns="3">
  <!-- Items go here -->
</div>
```

### Configuration Options

The overflow management system can be customized using various data attributes to control its behavior.

#### Height Limit

Use `data-list-max-height` to set a custom maximum height (in pixels). If not specified, it defaults to 320px.

#### Hidden Count Indicator

Set `data-list-hidden-count="true"` to display an "And X more" message showing how many items are hidden.

#### Multiple Columns

Use `data-list-max-columns` to automatically wrap items across multiple columns when necessary. If not specified, it defaults to 1 column.

 Previous  [ 

## Border

Draw horizontal and vertical rules on the same shade scale as backgrounds

 ](/framework/docs/1.2/border)

 Next  [ 

## Clamp

Manage text overflow with single and multi-line truncation

 ](/framework/docs/1.2/clamp)

