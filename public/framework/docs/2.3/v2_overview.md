# V2 Overview

Welcome to Framework v2 - the first open-source ePaper adaptive front-end framework. This release introduces support for multiple devices, orientations, and bit-depths, while making layouts and utilities smarter and more automatic. The overview highlights the key improvements, new features, and breaking changes, and points you to detailed guides for upgrading and getting the most out of v2.

### Highlights

- **Adaptive in Context:** the framework automatically adapts to the current bit-depth, size, and orientation. Layouts adjust with automatic enhancement on richer devices and graceful degradation on limited ones.
- **Expanded palette:** from 1-bit (2 shades) to 4-bit (16 shades).
- **Dynamic Engines:** engines like [Overflow](/framework/docs/2.3/overflow) and [Clamp](/framework/docs/2.3/clamp) are now smart enough to calculate available space themselves. No more hard-coded pixel values required.
- **Backwards compatibility:** existing code continues to work, enhancing automatically when displayed on more capable devices.

### What's New

- **New utilities:** [Scale](/framework/docs/2.3/scale) , [Visibility](/framework/docs/2.3/visibility) , [Aspect Ratio](/framework/docs/2.3/aspect_ratio) , [Rounded](/framework/docs/2.3/rounded) .
- **New element:** [Divider](/framework/docs/2.3/divider) .
- **New component:** [Progress](/framework/docs/2.3/progress) bar.
- **Table overflow engine:** [Table Overflow](/framework/docs/2.3/table_overflow) - new engine for tables, automatically handling row overflows and adding an “and X more” row.
- **Extended utilities:** [Text](/framework/docs/2.3/text) , [Border](/framework/docs/2.3/border) , and [Background](/framework/docs/2.3/background) are now adaptive across bit-depths and contexts.

### What's Enhanced

- **Clamp engine:** [Clamp](/framework/docs/2.3/clamp) rebuilt as a true JavaScript DOM engine, integrated with other engines like [Overflow](/framework/docs/2.3/overflow) .
- **Overflow engine:** [Overflow](/framework/docs/2.3/overflow) adds smarter features like smart columns, clamp-aware distribution, group headers, and harmonious group columns.
- **Content limiter engine:** [Content Limiter](/framework/docs/2.3/content_limiter) enhanced to drop fixed values and calculate available space dynamically.
- **Item component:** [Item](/framework/docs/2.3/item) adds new meta-emphasis classes to emphasise items.
- **Table component:** [Table](/framework/docs/2.3/table) adds new style variants, including small tables, large tables, and index tables.

### What's Changed

- **Border utility:** [Border](/framework/docs/2.3/border) expanded from 1-bit only → now works across 1, 2, and 4-bit spaces. Requires new class names.
- **Clamping:** [Title](/framework/docs/2.3/title) , [Label](/framework/docs/2.3/label) , and [Description](/framework/docs/2.3/description) are now unclamped by default. Developers must explicitly clamp if needed.

### Start Here

- Upgrading from v1? → [V2 Upgrade Guide](/framework/docs/2.3/upgrade_guide) .
- Looking to take advantage of new features? → [V2 Enhancement Guide](/framework/docs/2.3/enhancement_guide) .

 Next  [ 

## V2 Upgrade Guide

Steps to upgrade your plugins to Framework v2

 ](/framework/docs/2.3/upgrade_guide)

