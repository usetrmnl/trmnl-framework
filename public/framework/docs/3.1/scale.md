# Scale

Scale the whole interface from one screen modifier by changing the UI scale factor. Use it to match content density to viewing distance or user preference.

### Basic Usage

Apply scale modifiers to the `screen` element to scale all interface elements proportionally. The selected scale changes typography, component dimensions, gaps, and pixel-based utilities while leaving screen dimensions and relative units unchanged. Scale is available on 4bit devices.

#### Available Scale Levels

The framework provides seven predefined scale levels:

| Class | Scale Factor | Use Case |
| --- | --- | --- |
| `screen--scale-xxsmall` | 0.66 (66%) | Dynamic mashup content density |
| `screen--scale-xsmall` | 0.75 (75%) | Maximum content density |
| `screen--scale-small` | 0.875 (87.5%) | Increased content density |
| `screen--scale-regular` | 1.0 (100%) | Default scale, no scaling applied |
| `screen--scale-large` | 1.125 (112.5%) | Increased size for better readability |
| `screen--scale-xlarge` | 1.25 (125%) | Large scale for increased readability |
| `screen--scale-xxlarge` | 1.5 (150%) | Maximum scale for accessibility needs |

### Scale Typography Separately

Use [Text Scale](/framework/docs/3.1/text_scale) when typography needs an additional factor without applying it to the rest of the interface.

### Scale Examples

The following examples demonstrate how scale levels affect the same content layout. Notice how all elements scale proportionally.

#### Extra Small Scale (75%)

Maximum content density - useful when viewing up close or when you need to fit more information on screen.

Today

1

Morning Meeting: Threat Level Check-inTeam sync and updates
9:00 AM - 9:30 AMDaily

2

Identity Theft WatchReview suspicious 'Jim' behaviours
10:30 AM - 11:30 AMReview

3

Lunch Break: Pretzel Day PrepTeam lunch at downtown
12:30 PM - 1:30 PMBreak

4

Client Call with JanWeekly check-in with stakeholders
2:00 PM - 3:00 PMClient

5

Complaint Sorting: Product RecallPrioritize reported issues
3:30 PM - 4:30 PMComplaints

6

Bulletin Board Update: DundiesUpdate nominations and categories
4:30 PM - 5:30 PMDocs

7

End of Day Sync: Café DiscoReview progress and blockers
5:30 PM - 6:00 PMSync

Tomorrow

1

Beach Games Roll-CallConfirm capacity without hot coals
10:00 AM - 12:00 PMPlanning

2

Stakeholder Presentation: Threat Level MidnightTasteful metrics, minimal fireworks
2:00 PM - 3:30 PMPresentation

3

Oscar’s Index Intervention (Of Spreadsheets)Deep dive into the budget tabs
9:00 AM - 11:00 AMNumbers

4

Parkour QA Gauntlet (Very Gentle)Functionality verified: walking
1:00 PM - 3:00 PMQA-ish

5

Campaign Analysis: WUPHF Without The WUPHFLess shouting, more smiling
4:00 PM - 5:30 PMMarketing

This Week

1

Warehouse to Cloud (No Forklifts)Move boxes, label feelings
WednesdayInfrastructure-ish

2

Customer Satisfaction Review: 'Did I Stutter?'Improve smiles per hour
ThursdayCustomer Success

3

Benihana to Back Office CoordinationWe will know who is who
FridayIntegration-ish

4

Data Deep Dive: Boom, Roasted (With Charts)Roasts limited to pie charts
MondayAnalytics

5

Accessibility: Conference Room B UpgradesLess squinting, more seeing
TuesdayAccessibility

6

Respect the Dashboard (Of Feelings)Set baselines for vibes
WednesdayMonitoring

7

The Dundies of GrowthSkills, mentoring, zero karaoke tears
FridayDevelopment

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Scale LevelExtra Small (75%)

```
<div class="screen screen--scale-xsmall">
  <!-- Your content here -->
</div>
```

#### Small Scale (87.5%)

Reduced scale for fitting more content while maintaining good readability.

Today

1

Morning Meeting: Threat Level Check-inTeam sync and updates
9:00 AM - 9:30 AMDaily

2

Identity Theft WatchReview suspicious 'Jim' behaviours
10:30 AM - 11:30 AMReview

3

Lunch Break: Pretzel Day PrepTeam lunch at downtown
12:30 PM - 1:30 PMBreak

4

Client Call with JanWeekly check-in with stakeholders
2:00 PM - 3:00 PMClient

5

Complaint Sorting: Product RecallPrioritize reported issues
3:30 PM - 4:30 PMComplaints

6

Bulletin Board Update: DundiesUpdate nominations and categories
4:30 PM - 5:30 PMDocs

7

End of Day Sync: Café DiscoReview progress and blockers
5:30 PM - 6:00 PMSync

Tomorrow

1

Beach Games Roll-CallConfirm capacity without hot coals
10:00 AM - 12:00 PMPlanning

2

Stakeholder Presentation: Threat Level MidnightTasteful metrics, minimal fireworks
2:00 PM - 3:30 PMPresentation

3

Oscar’s Index Intervention (Of Spreadsheets)Deep dive into the budget tabs
9:00 AM - 11:00 AMNumbers

4

Parkour QA Gauntlet (Very Gentle)Functionality verified: walking
1:00 PM - 3:00 PMQA-ish

5

Campaign Analysis: WUPHF Without The WUPHFLess shouting, more smiling
4:00 PM - 5:30 PMMarketing

This Week

1

Warehouse to Cloud (No Forklifts)Move boxes, label feelings
WednesdayInfrastructure-ish

2

Customer Satisfaction Review: 'Did I Stutter?'Improve smiles per hour
ThursdayCustomer Success

3

Benihana to Back Office CoordinationWe will know who is who
FridayIntegration-ish

4

Data Deep Dive: Boom, Roasted (With Charts)Roasts limited to pie charts
MondayAnalytics

5

Accessibility: Conference Room B UpgradesLess squinting, more seeing
TuesdayAccessibility

6

Respect the Dashboard (Of Feelings)Set baselines for vibes
WednesdayMonitoring

7

The Dundies of GrowthSkills, mentoring, zero karaoke tears
FridayDevelopment

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Scale LevelSmall (87.5%)

```
<div class="screen screen--scale-small">
  <!-- Your content here -->
</div>
```

#### Regular Scale (100%)

Default scale - this is the baseline that all other scale levels are relative to.

Today

1

Morning Meeting: Threat Level Check-inTeam sync and updates
9:00 AM - 9:30 AMDaily

2

Identity Theft WatchReview suspicious 'Jim' behaviours
10:30 AM - 11:30 AMReview

3

Lunch Break: Pretzel Day PrepTeam lunch at downtown
12:30 PM - 1:30 PMBreak

4

Client Call with JanWeekly check-in with stakeholders
2:00 PM - 3:00 PMClient

5

Complaint Sorting: Product RecallPrioritize reported issues
3:30 PM - 4:30 PMComplaints

6

Bulletin Board Update: DundiesUpdate nominations and categories
4:30 PM - 5:30 PMDocs

7

End of Day Sync: Café DiscoReview progress and blockers
5:30 PM - 6:00 PMSync

Tomorrow

1

Beach Games Roll-CallConfirm capacity without hot coals
10:00 AM - 12:00 PMPlanning

2

Stakeholder Presentation: Threat Level MidnightTasteful metrics, minimal fireworks
2:00 PM - 3:30 PMPresentation

3

Oscar’s Index Intervention (Of Spreadsheets)Deep dive into the budget tabs
9:00 AM - 11:00 AMNumbers

4

Parkour QA Gauntlet (Very Gentle)Functionality verified: walking
1:00 PM - 3:00 PMQA-ish

5

Campaign Analysis: WUPHF Without The WUPHFLess shouting, more smiling
4:00 PM - 5:30 PMMarketing

This Week

1

Warehouse to Cloud (No Forklifts)Move boxes, label feelings
WednesdayInfrastructure-ish

2

Customer Satisfaction Review: 'Did I Stutter?'Improve smiles per hour
ThursdayCustomer Success

3

Benihana to Back Office CoordinationWe will know who is who
FridayIntegration-ish

4

Data Deep Dive: Boom, Roasted (With Charts)Roasts limited to pie charts
MondayAnalytics

5

Accessibility: Conference Room B UpgradesLess squinting, more seeing
TuesdayAccessibility

6

Respect the Dashboard (Of Feelings)Set baselines for vibes
WednesdayMonitoring

7

The Dundies of GrowthSkills, mentoring, zero karaoke tears
FridayDevelopment

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Scale LevelRegular (100%)

```
<div class="screen screen--scale-regular">
  <!-- Your content here -->
</div>
```

#### Large Scale (112.5%)

Increased size for better readability

Today

1

Morning Meeting: Threat Level Check-inTeam sync and updates
9:00 AM - 9:30 AMDaily

2

Identity Theft WatchReview suspicious 'Jim' behaviours
10:30 AM - 11:30 AMReview

3

Lunch Break: Pretzel Day PrepTeam lunch at downtown
12:30 PM - 1:30 PMBreak

4

Client Call with JanWeekly check-in with stakeholders
2:00 PM - 3:00 PMClient

5

Complaint Sorting: Product RecallPrioritize reported issues
3:30 PM - 4:30 PMComplaints

6

Bulletin Board Update: DundiesUpdate nominations and categories
4:30 PM - 5:30 PMDocs

7

End of Day Sync: Café DiscoReview progress and blockers
5:30 PM - 6:00 PMSync

Tomorrow

1

Beach Games Roll-CallConfirm capacity without hot coals
10:00 AM - 12:00 PMPlanning

2

Stakeholder Presentation: Threat Level MidnightTasteful metrics, minimal fireworks
2:00 PM - 3:30 PMPresentation

3

Oscar’s Index Intervention (Of Spreadsheets)Deep dive into the budget tabs
9:00 AM - 11:00 AMNumbers

4

Parkour QA Gauntlet (Very Gentle)Functionality verified: walking
1:00 PM - 3:00 PMQA-ish

5

Campaign Analysis: WUPHF Without The WUPHFLess shouting, more smiling
4:00 PM - 5:30 PMMarketing

This Week

1

Warehouse to Cloud (No Forklifts)Move boxes, label feelings
WednesdayInfrastructure-ish

2

Customer Satisfaction Review: 'Did I Stutter?'Improve smiles per hour
ThursdayCustomer Success

3

Benihana to Back Office CoordinationWe will know who is who
FridayIntegration-ish

4

Data Deep Dive: Boom, Roasted (With Charts)Roasts limited to pie charts
MondayAnalytics

5

Accessibility: Conference Room B UpgradesLess squinting, more seeing
TuesdayAccessibility

6

Respect the Dashboard (Of Feelings)Set baselines for vibes
WednesdayMonitoring

7

The Dundies of GrowthSkills, mentoring, zero karaoke tears
FridayDevelopment

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Scale LevelLarge (112.5%)

```
<div class="screen screen--scale-large">
  <!-- Your content here -->
</div>
```

#### Extra Large Scale (125%)

Large scale for increased readability

Today

1

Morning Meeting: Threat Level Check-inTeam sync and updates
9:00 AM - 9:30 AMDaily

2

Identity Theft WatchReview suspicious 'Jim' behaviours
10:30 AM - 11:30 AMReview

3

Lunch Break: Pretzel Day PrepTeam lunch at downtown
12:30 PM - 1:30 PMBreak

4

Client Call with JanWeekly check-in with stakeholders
2:00 PM - 3:00 PMClient

5

Complaint Sorting: Product RecallPrioritize reported issues
3:30 PM - 4:30 PMComplaints

6

Bulletin Board Update: DundiesUpdate nominations and categories
4:30 PM - 5:30 PMDocs

7

End of Day Sync: Café DiscoReview progress and blockers
5:30 PM - 6:00 PMSync

Tomorrow

1

Beach Games Roll-CallConfirm capacity without hot coals
10:00 AM - 12:00 PMPlanning

2

Stakeholder Presentation: Threat Level MidnightTasteful metrics, minimal fireworks
2:00 PM - 3:30 PMPresentation

3

Oscar’s Index Intervention (Of Spreadsheets)Deep dive into the budget tabs
9:00 AM - 11:00 AMNumbers

4

Parkour QA Gauntlet (Very Gentle)Functionality verified: walking
1:00 PM - 3:00 PMQA-ish

5

Campaign Analysis: WUPHF Without The WUPHFLess shouting, more smiling
4:00 PM - 5:30 PMMarketing

This Week

1

Warehouse to Cloud (No Forklifts)Move boxes, label feelings
WednesdayInfrastructure-ish

2

Customer Satisfaction Review: 'Did I Stutter?'Improve smiles per hour
ThursdayCustomer Success

3

Benihana to Back Office CoordinationWe will know who is who
FridayIntegration-ish

4

Data Deep Dive: Boom, Roasted (With Charts)Roasts limited to pie charts
MondayAnalytics

5

Accessibility: Conference Room B UpgradesLess squinting, more seeing
TuesdayAccessibility

6

Respect the Dashboard (Of Feelings)Set baselines for vibes
WednesdayMonitoring

7

The Dundies of GrowthSkills, mentoring, zero karaoke tears
FridayDevelopment

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Scale LevelExtra Large (125%)

```
<div class="screen screen--scale-xlarge">
  <!-- Your content here -->
</div>
```

#### Extra Extra Large Scale (150%)

Maximum scale for accessibility needs

Today

1

Morning Meeting: Threat Level Check-inTeam sync and updates
9:00 AM - 9:30 AMDaily

2

Identity Theft WatchReview suspicious 'Jim' behaviours
10:30 AM - 11:30 AMReview

3

Lunch Break: Pretzel Day PrepTeam lunch at downtown
12:30 PM - 1:30 PMBreak

4

Client Call with JanWeekly check-in with stakeholders
2:00 PM - 3:00 PMClient

5

Complaint Sorting: Product RecallPrioritize reported issues
3:30 PM - 4:30 PMComplaints

6

Bulletin Board Update: DundiesUpdate nominations and categories
4:30 PM - 5:30 PMDocs

7

End of Day Sync: Café DiscoReview progress and blockers
5:30 PM - 6:00 PMSync

Tomorrow

1

Beach Games Roll-CallConfirm capacity without hot coals
10:00 AM - 12:00 PMPlanning

2

Stakeholder Presentation: Threat Level MidnightTasteful metrics, minimal fireworks
2:00 PM - 3:30 PMPresentation

3

Oscar’s Index Intervention (Of Spreadsheets)Deep dive into the budget tabs
9:00 AM - 11:00 AMNumbers

4

Parkour QA Gauntlet (Very Gentle)Functionality verified: walking
1:00 PM - 3:00 PMQA-ish

5

Campaign Analysis: WUPHF Without The WUPHFLess shouting, more smiling
4:00 PM - 5:30 PMMarketing

This Week

1

Warehouse to Cloud (No Forklifts)Move boxes, label feelings
WednesdayInfrastructure-ish

2

Customer Satisfaction Review: 'Did I Stutter?'Improve smiles per hour
ThursdayCustomer Success

3

Benihana to Back Office CoordinationWe will know who is who
FridayIntegration-ish

4

Data Deep Dive: Boom, Roasted (With Charts)Roasts limited to pie charts
MondayAnalytics

5

Accessibility: Conference Room B UpgradesLess squinting, more seeing
TuesdayAccessibility

6

Respect the Dashboard (Of Feelings)Set baselines for vibes
WednesdayMonitoring

7

The Dundies of GrowthSkills, mentoring, zero karaoke tears
FridayDevelopment

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Scale LevelExtra Extra Large (150%)

```
<div class="screen screen--scale-xxlarge">
  <!-- Your content here -->
</div>
```

### How It Works

Scale modifiers set `--modifier-scale`. The screen composes it with `--device-ui-scale` for component typography and geometry, while `--content-scale` applies the modifier to plugin content.

#### Affected Properties

When you apply a scale modifier, it scales the following properties:

- Font sizes (all text elements)
- Line heights
- Component dimensions such as title bars and progress indicators
- Framework gaps and pixel-based spacing utilities
- Framework radii, text strokes, and image strokes
- Any custom properties that reference `var(--ui-scale)` or `var(--content-scale)`

**Note:** Screen dimensions, percentages, container units, and physical one-pixel rails remain unchanged. Fixed pixel values emitted by framework utilities follow the selected content scale.

### Combining with Device Configurations

Scale modifiers multiply the device's native UI scale instead of replacing it. Plugin content follows the selected modifier, while framework components also retain the device density adjustment. Every modifier except Regular also resolves typography to Inter Variable on low-density displays, because pixel bundles only render correctly at their native sizes.

| Class Combination | Description |
| --- | --- |
| `screen screen--v2` | Uses device default scale |
| `screen screen--v2 screen--scale-small` | Uses 87.5% content scale and 87.5% of the device UI scale |
| `screen screen--amazon_kindle_2024 screen--scale-large` | Uses 112.5% content scale and 112.5% of the device UI scale |

```
<!-- Use device default UI scale -->
<div class="screen screen--v2">
  <!-- Content -->
</div>

<!-- Multiply the device scale with a modifier -->
<div class="screen screen--v2 screen--scale-small">
  <!-- Content at 87.5% scale -->
</div>

<!-- Combine with any device configuration -->
<div class="screen screen--amazon_kindle_2024 screen--scale-large">
  <!-- Kindle content at 112.5%, with its native UI scale preserved -->
</div>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--content-scale` | 1 | - | - | - |
| `--device-ui-scale` | 1 | - | - | - |
| `--gap-large` | 20px | - | - | - |
| `--gap-medium` | 16px | - | - | - |
| `--gap-scale` | 1 | - | - | - |
| `--gap-small` | 7px | - | - | - |
| `--gap-xlarge` | 30px | - | - | - |
| `--gap-xsmall` | 5px | - | - | - |
| `--gap-xxlarge` | 40px | - | - | - |
| `--list-gap-small` | 8px | - | - | - |
| `--modifier-scale` | 1 | - | - | - |
| `--ui-scale` | 1 | - | - | - |

 Previous  [ 

## Image Stroke

Legible images when displayed on shaded backgrounds

 ](/framework/docs/3.1/image_stroke)

 Next  [ 

## Colors

Complete palette definition: grayscale, chromatic hues, and semantic roles

 ](/framework/docs/3.1/colors)

