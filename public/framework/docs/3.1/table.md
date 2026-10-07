# Table

Tabular data with optional row indexes. Five size variants, and the Overflow and Clamp engines drop rows and truncate cells that do not fit the space available.

### Base Structure

Tables are built using standard HTML table elements with additional classes for styling. The base structure includes headers and data cells with consistent spacing and typography.

#### Default Table

The `table` class provides the standard table styling with comfortable spacing and clear visual hierarchy.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableRegular

```
<table class="table" data-table-limit="true">
        <thead>
          <tr>
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

#### Indexed Table

Add an opt-in index column by placing a meta block in the cells you want indexed: `td .meta > span.index`. Add `table--indexed` to dock the meta block to the left and add padding for that column.

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

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableIndexed

```
<table class="table table--indexed" data-table-limit="true">
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
      <td><span class="meta"><span class="index">1</span></span></td>
      <td><span class="label">Pam Beesly</span></td>
      <td><span class="label label--small">Receptionist</span></td>
      <td><span class="label label--small">3</span></td>
      <td><span class="label label--small">$0</span></td>
      <td><span class="label label--small">0.00</span></td>
      <td><span class="label label--small" data-clamp="1">Loves drawing</span></td>
    </tr>
  </tbody>
</table>
```

### Size Variants

Tables support five sizes: Base, Large, XLarge, Small, and XSmall. Use modifier classes to change row heights. Size and orientation prefixes both apply, so `lg:portrait:table--xlarge` raises the row height only on large portrait screens (see the [Responsive](/framework/docs/3.1/responsive) docs).

#### Base

The `table` class without size modifiers and the `table--base` class both produce the same visual result, providing the standard table styling with comfortable spacing and clear visual hierarchy. Use `table--base` when you need to explicitly set the base size in responsive contexts, such as `table--small lg:table--base`.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableBase

```
<table class="table table--base" data-table-limit="true">
        <thead>
          <tr>
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

#### Large

Use `table--large` to increase row heights for more spacious tables.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableLarge

```
<table class="table table--large" data-table-limit="true">
        <thead>
          <tr>
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

#### XLarge

Use `table--xlarge` for larger screens. Pairs well with larger font-sizes.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableXLarge

```
<table class="table table--xlarge" data-table-limit="true">
        <thead>
          <tr>
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

#### Small

Use `table--small` for a compact table with reduced row heights. The older `table--condensed` class remains supported as a backward-compatible alias.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableSmall

```
<table class="table table--small" data-table-limit="true">
        <thead>
          <tr>
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

#### XSmall

Use `table--xsmall` for the most compact row heights.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableXSmall

```
<table class="table table--xsmall" data-table-limit="true">
        <thead>
          <tr>
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
            <td><span class="label label--small">Row 1, Cell 2</span></td>
            <td><span class="label label--small">Row 1, Cell 3</span></td>
          </tr>
        </tbody>
      </table>
```

### Overflow Engine

Demonstrates the Overflow behavior [Table Overflow](/framework/docs/3.1/table_overflow) and trailing "and X more" row when content exceeds the height budget.

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableOverflow

```
<table class="table" data-table-limit="true">
        <thead>
          <tr>
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

### Clamp Engine

Apply `data-clamp`[Clamp](/framework/docs/3.1/clamp) to each cell's content to ensure consistent single-line truncation with ellipsis. This works with the Table Overflow behavior [Table Overflow](/framework/docs/3.1/table_overflow) .

| Employee | Role | Pranks | Sales | Score | Fun Fact |
| --- | --- | --- | --- | --- | --- |
| Dwight Schrute | Assistant to the Regional Manager | 24 | 44 | 12.91 | Owns a beet farm |
| Jim Halpert | Sales Rep | 42 | 21 | 8.69 | Dwight hates him |
| Stanley Hudson | Sales Rep | 0 | 28 | 5.83 | Only smiles on Pretzel Day |
| Phyllis Vance | Sales Rep | 0 | 18 | 3.79 | Married to Bob Vance |
| Andy Bernard | Sales Rep | 2 | 14 | 3.18 | Cornell graduate |
| Creed Bratton | Quality Assurance | ??? | ??? | ??? | ??? |
| Karen Filippelli | Sales / Utica Manager | 0 | 12 | 2.57 | Jim’s ex from Stamford |
| Michael Scott | Regional Manager | 15 | 0 | 1.65 | World’s Best Boss mug |
| Todd Packer | Traveling Salesman | 0 | 6 | 1.34 | Terrible human being |
| Ryan Howard | Temp / VP / Janitor | 1 | 2 | 0.63 | Pitched the Sabre Pyramid |
| Pam Beesly | Receptionist / Office Admin | 3 | 0 | 0.43 | Art school dreamer |
| Meredith Palmer | Supplier Relations | 0 | 1 | 0.32 | Exchanged paper for steak |
| Holly Flax | HR (Nashua) | 2 | 0 | 0.32 | Michael’s soulmate |
| Darryl Philbin | Warehouse Foreman | 1 | 0 | 0.22 | Started a band |
| Kevin Malone | Accountant | 1 | 0 | 0.22 | Spilled the chili |
| Erin Hannon | Receptionist | 1 | 0 | 0.22 | Dates Gabe, then Andy |
| Kelly Kapoor | Customer Service | 0 | 0 | 0.00 | Obsessed with Ryan |
| Angela Martin | Accountant | 0 | 0 | 0.00 | Owns 12 cats |
| Oscar Martinez | Accountant | 0 | 0 | 0.00 | “Actually...” guy |
| Roy Anderson | Warehouse | 0 | 0 | 0.00 | Pam’s ex-fiancé |
| Toby Flenderson | HR | 0 | 0 | 0.00 | Michael hates him |
| Jan Levinson | Corporate | 0 | 0 | 0.00 | Serenity by Jan |
| David Wallace | CFO | 0 | 0 | 0.00 | Invented “Suck It” |
| Robert California | CEO | 0 | 0 | 0.00 | The Lizard King |
| Nellie Bertram | Special Projects Manager | 0 | 0 | 0.00 | Took Andy’s job |
| Deangelo Vickers | Regional Manager | 0 | 0 | 0.00 | Juggled invisible balls |
| Charles Miner | Corporate VP | 0 | 0 | 0.00 | Hated Jim’s pranks |
| Gabe Lewis | Sabre Liaison | 0 | 0 | 0.00 | Tall, awkward, hates horror movies |
| Clark Green | Sales | 0 | 0 | 0.00 | Mini Dwight |
| Pete Miller | Sales | 0 | 0 | 0.00 | Nickname: Plop |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableClamp: 1 line

```
<table class="table" data-table-limit="true">
        <thead>
          <tr>
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
            <td><span class="label label--small" data-clamp="1">Row 1, Cell 1</span></td>
            <td><span class="label" data-clamp="1">Row 1, Cell 2</span></td>
            <td><span class="label label--small" data-clamp="1">Row 1, Cell 3</span></td>
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

## Item

Build standardized list items and content blocks

 ](/framework/docs/3.1/item)

 Next  [ 

## Chart

Visualize data with charts that adapt to the device and theme

 ](/framework/docs/3.1/chart)

