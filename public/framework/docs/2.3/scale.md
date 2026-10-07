# Scale

Scale the whole interface from one screen modifier by changing the UI scale factor. Use it to match content density to viewing distance or user preference.

### Basic Usage

Apply scale modifiers to the `screen` element to scale all interface elements proportionally. The scale affects fonts, spacing, dimensions, and other UI elements that use the `--ui-scale` CSS variable. Scale is available on 4bit devices.

#### Available Scale Levels

The framework provides six predefined scale levels:

| Class | Scale Factor | Use Case |
| --- | --- | --- |
| `screen--scale-xsmall` | 0.75 (75%) | Maximum content density |
| `screen--scale-small` | 0.875 (87.5%) | Increased content density |
| `screen--scale-regular` | 1.0 (100%) | Default scale, no scaling applied |
| `screen--scale-large` | 1.125 (112.5%) | Increased size for better readability |
| `screen--scale-xlarge` | 1.25 (125%) | Large scale for increased readability |
| `screen--scale-xxlarge` | 1.5 (150%) | Maximum scale for accessibility needs |

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

The scale system works by modifying the `--ui-scale` CSS variable, which is used throughout the framework to calculate sizes.

#### Affected Properties

When you apply a scale modifier, it scales the following properties:

- Font sizes (all text elements)
- Line heights
- Component dimensions (title bar height, progress bar sizes, etc.)
- Spacing that uses the ui-scale multiplier
- Any custom properties that reference `var(--ui-scale)`

**Note:** The scale utility only affects elements that use the `--ui-scale` variable in their calculations. Fixed pixel values and screen dimensions remain unchanged.

### Combining with Device Configurations

Scale modifiers can be combined with device-specific classes to override the default UI scale for particular devices.

| Class Combination | Description |
| --- | --- |
| `screen screen--v2` | Uses device default scale |
| `screen screen--v2 screen--scale-small` | Overrides to 87.5% scale |
| `screen screen--amazon_kindle_2024 screen--scale-large` | Overrides to 112.5% scale |

```
<!-- Use device default UI scale -->
<div class="screen screen--v2">
  <!-- Content -->
</div>

<!-- Override device scale with scale modifier -->
<div class="screen screen--v2 screen--scale-small">
  <!-- Content at 87.5% scale -->
</div>

<!-- Combine with any device configuration -->
<div class="screen screen--amazon_kindle_2024 screen--scale-large">
  <!-- Kindle device with 112.5% scale -->
</div>
```

 Previous  [ 

## Text Stroke

Legible text when displayed on shaded backgrounds

 ](/framework/docs/2.3/text_stroke)

 Next  [ 

## Overflow

Handle column items overflow

 ](/framework/docs/2.3/overflow)

