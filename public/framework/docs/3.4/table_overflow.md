# Table Overflow

When a table has more rows than can fit within the available vertical space, it constrains its height and appends a trailing "and X more" row to indicate the hidden entries.

### Basic usage

To enable table overflow handling, add `data-table-limit="true"` to your `<table>`[Table](/framework/docs/3.4/table) . Control the maximum height with `data-table-max-height` using a pixel value (for example, `240`) or set `auto` to inherit from the parent container. When rows exceed the available height, a trailing "and X more" row is added automatically.

| Attribute | Default | Description |
| --- | --- | --- |
| `data-table-limit="true"` | - | Enable overflow handling and trailing "and X more" row |
| `data-table-max-height` | auto | Maximum table height (px). Use `auto` to inherit from parent |
| `data-table-overflow-counter` | true | Set to `false` to hide the "and X more" counter row while still clipping overflow rows |

```
<table class="table" data-table-limit="true" data-table-max-height="auto">...</table>
```

### Table Overflow

A regular-sized table demonstrating the overflow behavior within a fixed height budget.

| | Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| 2 | Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| 3 | Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| 4 | Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| 5 | Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| 6 | Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| 7 | Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| 8 | Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| 9 | Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| 10 | Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| 11 | Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| 12 | Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| 13 | Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| 14 | Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| 15 | Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| 16 | Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| 17 | Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| 18 | Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| 19 | Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| 20 | Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| 21 | Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| 22 | Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| 23 | David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| 24 | Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| 25 | Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| 26 | Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| 27 | Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| 28 | Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| 29 | Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| 30 | Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Table OverflowRegular • Auto height

```
<table class="table" data-table-limit="true">
        <thead>
          <tr>
            <th><span class="title"></span></th>
            <th><span class="title">Employee</span></th>
            <th><span class="title">Role</span></th>
            <th><span class="title">Pranks</span></th>
            <th><span class="title">Sales</span></th>
            <th><span class="title">Score</span></th>
            <th><span class="title">Fun Fact</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="label label--small">Row 1, Cell 1</span></td>
            <td><span class="label">Row 1, Cell 2</span></td>
            <td><span class="label label--small">Row 1, Cell 3</span></td>
          </tr>
        </tbody>
      </table>
```

### Small table overflow

When a table uses `table--small` or `table--xsmall`, the "and X more" counter row automatically scales to match using a smaller label style.

| | Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| 2 | Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| 3 | Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| 4 | Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| 5 | Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| 6 | Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| 7 | Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| 8 | Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| 9 | Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| 10 | Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| 11 | Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| 12 | Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| 13 | Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| 14 | Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| 15 | Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| 16 | Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| 17 | Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| 18 | Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| 19 | Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| 20 | Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| 21 | Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| 22 | Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| 23 | David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| 24 | Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| 25 | Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| 26 | Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| 27 | Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| 28 | Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| 29 | Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| 30 | Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Table OverflowSmall • Auto height

```
<table class="table table--small" data-table-limit="true">
        <thead>
          <tr>
            <th><span class="title title--small"></span></th>
            <th><span class="title title--small">Employee</span></th>
            <th><span class="title title--small">Role</span></th>
            <th><span class="title title--small">Pranks</span></th>
            <th><span class="title title--small">Sales</span></th>
            <th><span class="title title--small">Score</span></th>
            <th><span class="title title--small">Fun Fact</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="label label--small">Row 1, Cell 1</span></td>
            <td><span class="label">Row 1, Cell 2</span></td>
            <td><span class="label label--small">Row 1, Cell 3</span></td>
          </tr>
        </tbody>
      </table>
```

### Hidden counter

Use `data-table-overflow-counter="false"` to clip the table at its height budget without showing the "and X more" row. The legacy `table-overflow-counter` attribute still works for existing plugins, but the `data-` prefixed form is valid HTML and preferred.

| | Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| 2 | Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| 3 | Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| 4 | Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| 5 | Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| 6 | Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| 7 | Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| 8 | Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| 9 | Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| 10 | Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| 11 | Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| 12 | Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| 13 | Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| 14 | Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| 15 | Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| 16 | Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| 17 | Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| 18 | Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| 19 | Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| 20 | Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| 21 | Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| 22 | Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| 23 | David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| 24 | Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| 25 | Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| 26 | Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| 27 | Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| 28 | Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| 29 | Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| 30 | Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Table OverflowRegular • Counter hidden

```
<table class="table" data-table-limit="true" data-table-overflow-counter="false">
        <thead>
          <tr>
            <th><span class="title"></span></th>
            <th><span class="title">Employee</span></th>
            <th><span class="title">Role</span></th>
            <th><span class="title">Pranks</span></th>
            <th><span class="title">Sales</span></th>
            <th><span class="title">Score</span></th>
            <th><span class="title">Fun Fact</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="label label--small">Row 1, Cell 1</span></td>
            <td><span class="label">Row 1, Cell 2</span></td>
            <td><span class="label label--small">Row 1, Cell 3</span></td>
          </tr>
        </tbody>
      </table>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--table-tbody-height` | calc(46px \* var(--ui-scale)) | - | - | - |
| `--table-thead-height` | calc(36px \* var(--ui-scale)) | - | - | - |
| Xsmall |
| `--table-xsmall-tbody-height` | calc(22px \* var(--ui-scale)) | - | - | - |
| `--table-xsmall-thead-height` | calc(18px \* var(--ui-scale)) | - | - | - |
| Small |
| `--table-small-tbody-height` | calc(31px \* var(--ui-scale)) | - | - | - |
| `--table-small-thead-height` | calc(24px \* var(--ui-scale)) | - | - | - |
| Large |
| `--table-large-tbody-height` | calc(56px \* var(--ui-scale)) | - | - | - |
| `--table-large-thead-height` | calc(44px \* var(--ui-scale)) | - | - | - |
| Xlarge |
| `--table-xlarge-tbody-height` | calc(72px \* var(--ui-scale)) | - | - | - |
| `--table-xlarge-thead-height` | calc(56px \* var(--ui-scale)) | - | - | - |

 Previous  [ 

## Overflow

Handle column items overflow

 ](/framework/docs/3.4/overflow)

 Next  [ 

## Clamp

Manage text overflow with single and multi-line truncation

 ](/framework/docs/3.4/clamp)

