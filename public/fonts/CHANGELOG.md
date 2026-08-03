# TRMNL pixel fonts — CHANGELOG

## v1.002 (2026-07-24) — licensing metadata correction

Applied identically to all six fonts (ttf/woff/woff2 regenerated from the
corrected TTFs). **No outline, metric, kerning, or cmap data changed** —
glyf/hmtx/GPOS/cmap/loca table checksums are byte-identical to v1.001
(machine-verified).

- name ID 13 (license description): Heavyweight's retail EULA text (shipped
  in error — it contradicted the commissioning agreement, which licenses the
  fonts under SIL OFL 1.1) replaced with the standard OFL notice:
  "This Font Software is licensed under the SIL Open Font License, Version 1.1…"
- name ID 14 (license URL): http://heavyweight-type.com/information →
  https://openfontlicense.org
- name ID 7 (trademark): removed — the shipped record read "Clin is a
  trademark of Heavyweight Digital Type Foundry", template debris from a
  different (retail) typeface; no trademark claim belongs in these files.
- name ID 0 (copyright): UNCHANGED — © 2026 Heavyweight Digital Type Foundry
  s.r.o. Heavyweight remains the copyright holder; OFL preserves that.
- OS/2 fsType: 8 (editable embedding) → 0 (installable) to match the OFL's
  unrestricted terms; the shipped value contradicted the embedded license text.
- name ID 5 / ID 3 / head.fontRevision: 1.001 → 1.002.

v1.001 (below) remains the record of the metric/name-table repairs.
Design decisions D1–D10 from the audit report still await Heavyweight's
sign-off; the values shipped here are TRMNL's documented choices.

---

# TRMNL pixel fonts v1.001 — grid-alignment fix changelog

Generated 2026-07-24 from the v1.000 bundle (zip SHA-256 991eb3b935b1290b9d924f8eaf83de8434b2b7a88fd058008c2dbc259ea0e6be).

## TRMNL12-Regular

| table | item | old | new | old px | new px | why |
|---|---|---|---|---|---|---|
| DSIG | table | present | removed | - | - | legacy digital-signature table invalidated by any edit; removal is standard practice (OpenType spec deprecates DSIG) |
| hmtx | uni2002 | 500 | 516 | 5.814px | 6px | en space := 1/2 em (6px); shipped raw UPM-1000 default |
| hmtx | uni2003 | 1000 | 1032 | 11.628px | 12px | em space := 1 em (12px); shipped raw UPM-1000 default |
| hmtx | uni2007 | 600 | 602 | 6.977px | 7px | figure space := width of digit zero (7px) |
| hmtx | uni2008 | 152 | 258 | 1.767px | 3px | punctuation space := width of period (3px) |
| hmtx | uni2009 | 102 | 172 | 1.186px | 2px | thin space := 1/5 em -> 2px |
| hmtx | uni200A | 51 | 86 | 0.593px | 1px | hair space := 1/10 em -> 1px minimum |
| hmtx | uni202F | 102 | 172 | 1.186px | 2px | narrow no-break space := thin space (2px) |
| hmtx | uni205F | 152 | 258 | 1.767px | 3px | medium math space := 4/18 em -> 3px |
| glyf | plus.case component plus offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | minus.case component minus offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | multiply.case component multiply offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | divide.case component divide offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | equal.case component equal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | notequal.case component notequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | greater.case component greater offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | less.case component less offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | greaterequal.case component greaterequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | lessequal.case component lessequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | plusminus.case component plusminus offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | approxequal.case component approxequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| GPOS | kern class [ae|aeacute|b...] -> [T|Tbar|Tcaron...] | -79 | -86 | -0.919px | -1px | kern value rounded to whole pixels |
| name | ID1 | 'TRMNL12 .' | 'TRMNL12' | - | - | placeholder '.' style name made unique per weight |
| name | ID3 | '1.000;HWTF;TRMNL12-.' | '1.001;HWTF;TRMNL12-Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID4 | 'TRMNL12 .' | 'TRMNL12 Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID6 | 'TRMNL12-.' | 'TRMNL12-Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID16 | 'TRMNL12' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| name | ID17 | '.' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| head/name | version | 1.000 | 1.001 | - | - | version bump so fixed builds are distinguishable |

## TRMNL12-Bold

| table | item | old | new | old px | new px | why |
|---|---|---|---|---|---|---|
| DSIG | table | present | removed | - | - | legacy digital-signature table invalidated by any edit; removal is standard practice (OpenType spec deprecates DSIG) |
| hmtx | .notdef | 600 | 602 | 6.977px | 7px | match Regular's .notdef (7px); 600 is a UPM-1000 leftover |
| hmtx | NULL | 600 | 0 | 6.977px | 0px | control glyph must be zero-width (Regular is 0) |
| hmtx | uni200B | 600 | 0 | 6.977px | 0px | ZERO WIDTH SPACE must be zero-width (Regular is 0) |
| hmtx | asciitilde | 674 | 688 | 7.837px | 8px | snap to 8px, restores 1px right sidebearing (outline also repaired) |
| hmtx | uni2002 | 600 | 516 | 6.977px | 6px | en space := 1/2 em (6px); shipped placeholder 600 |
| hmtx | uni2003 | 600 | 1032 | 6.977px | 12px | em space := 1 em (12px); shipped placeholder 600 |
| hmtx | uni2007 | 600 | 602 | 6.977px | 7px | figure space := width of digit zero (7px) |
| hmtx | uni2008 | 600 | 344 | 6.977px | 4px | punctuation space := width of period (4px) |
| hmtx | uni2009 | 600 | 172 | 6.977px | 2px | thin space := 1/5 em -> 2px |
| hmtx | uni200A | 600 | 86 | 6.977px | 1px | hair space := 1/10 em -> 1px |
| hmtx | uni202F | 600 | 172 | 6.977px | 2px | narrow no-break space := thin space (2px) |
| hmtx | uni205F | 600 | 258 | 6.977px | 3px | medium math space := 4/18 em -> 3px |
| glyf | plus.case component plus offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | minus.case component minus offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | multiply.case component multiply offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | divide.case component divide offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | equal.case component equal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | notequal.case component notequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | greater.case component greater offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | less.case component less offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | greaterequal.case component greaterequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | lessequal.case component lessequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | plusminus.case component plusminus offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | approxequal.case component approxequal offset | (0,65) | (0,86) | 0.000,0.756px | 0,1px | composite component offset snapped to pixel grid |
| glyf | asciitilde outline | 8 off-grid points | all points on grid | - | - | outline points snapped to pixel grid (pure translation, shape preserved) |
| glyf | uni1ED9 component dotbelowcomb offset | (179,-86) | (172,-86) | 2.081,-1.000px | 2,-1px | composite component offset snapped to pixel grid |
| glyf | uni1ECD component dotbelowcomb offset | (179,-86) | (172,-86) | 2.081,-1.000px | 2,-1px | composite component offset snapped to pixel grid |
| name | ID1 | 'TRMNL12 .' | 'TRMNL12' | - | - | placeholder '.' style name made unique per weight |
| name | ID3 | '1.000;HWTF;TRMNL12-.' | '1.001;HWTF;TRMNL12-Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID4 | 'TRMNL12 .' | 'TRMNL12 Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID6 | 'TRMNL12-.' | 'TRMNL12-Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID16 | 'TRMNL12' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| name | ID17 | '.' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| head/name | version | 1.000 | 1.001 | - | - | version bump so fixed builds are distinguishable |

## TRMNL16-Regular

| table | item | old | new | old px | new px | why |
|---|---|---|---|---|---|---|
| DSIG | table | present | removed | - | - | legacy digital-signature table invalidated by any edit; removal is standard practice (OpenType spec deprecates DSIG) |
| hmtx | space | 392 | 384 | 6.125px | 6px | THE REPORTED BUG: 6.125px -> 6px; kills cumulative word drift |
| hmtx | uni00A0 | 456 | 384 | 7.125px | 6px | no-break space := space width (was 7.125px, off-grid AND != space) |
| hmtx | commaaccentbelowcmb | 600 | 0 | 9.375px | 0px | combining mark must be zero-width like every other mark |
| hmtx | uni2002 | 500 | 512 | 7.812px | 8px | en space := 1/2 em (8px); shipped raw UPM-1000 default |
| hmtx | uni2003 | 1000 | 1024 | 15.625px | 16px | em space := 1 em (16px); shipped raw UPM-1000 default |
| hmtx | uni2007 | 600 | 576 | 9.375px | 9px | figure space := width of digit zero (9px) |
| hmtx | uni2008 | 152 | 192 | 2.375px | 3px | punctuation space := width of period (3px) |
| hmtx | uni2009 | 102 | 192 | 1.594px | 3px | thin space := 1/5 em -> 3px |
| hmtx | uni200A | 51 | 128 | 0.797px | 2px | hair space := 1/10 em -> 2px |
| hmtx | uni202F | 102 | 192 | 1.594px | 3px | narrow no-break space := thin space (3px) |
| hmtx | uni205F | 152 | 256 | 2.375px | 4px | medium math space := 4/18 em -> 4px |
| GPOS | kern class [h|hbar|uni1E2B...] -> [backslash...] | -88 | -64 | -1.375px | -1px | kern value rounded to whole pixels |
| GPOS | kern class [uni2C73...] -> [uni0251|c|cacute...] | -8 | 0 | -0.125px | +0px | kern value rounded to whole pixels |
| name | ID1 | 'TRMNL16 .' | 'TRMNL16' | - | - | placeholder '.' style name made unique per weight |
| name | ID3 | '1.000;HWTF;TRMNL16-.' | '1.001;HWTF;TRMNL16-Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID4 | 'TRMNL16 .' | 'TRMNL16 Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID6 | 'TRMNL16-.' | 'TRMNL16-Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID16 | 'TRMNL16' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| name | ID17 | '.' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| head/name | version | 1.000 | 1.001 | - | - | version bump so fixed builds are distinguishable |

## TRMNL16-Bold

| table | item | old | new | old px | new px | why |
|---|---|---|---|---|---|---|
| DSIG | table | present | removed | - | - | legacy digital-signature table invalidated by any edit; removal is standard practice (OpenType spec deprecates DSIG) |
| hmtx | space | 392 | 384 | 6.125px | 6px | THE REPORTED BUG: 6.125px -> 6px; kills cumulative word drift |
| hmtx | uni00A0 | 456 | 384 | 7.125px | 6px | no-break space := space width (was 7.125px, off-grid AND != space) |
| hmtx | NULL | 600 | 0 | 9.375px | 0px | control glyph must be zero-width (Regular is 0) |
| hmtx | uni200B | 600 | 0 | 9.375px | 0px | ZERO WIDTH SPACE must be zero-width (Regular is 0) |
| hmtx | commaaccentbelowcmb | 600 | 0 | 9.375px | 0px | combining mark must be zero-width like every other mark |
| hmtx | uni2002 | 600 | 512 | 9.375px | 8px | en space := 1/2 em (8px); shipped placeholder 600 |
| hmtx | uni2003 | 600 | 1024 | 9.375px | 16px | em space := 1 em (16px); shipped placeholder 600 |
| hmtx | uni2007 | 600 | 576 | 9.375px | 9px | figure space := width of digit zero (9px) |
| hmtx | uni2008 | 600 | 256 | 9.375px | 4px | punctuation space := width of period (4px) |
| hmtx | uni2009 | 600 | 192 | 9.375px | 3px | thin space := 1/5 em -> 3px |
| hmtx | uni200A | 600 | 128 | 9.375px | 2px | hair space := 1/10 em -> 2px |
| hmtx | uni202F | 600 | 192 | 9.375px | 3px | narrow no-break space := thin space (3px) |
| hmtx | uni205F | 600 | 256 | 9.375px | 4px | medium math space := 4/18 em -> 4px |
| name | ID1 | 'TRMNL16 .' | 'TRMNL16' | - | - | placeholder '.' style name made unique per weight |
| name | ID3 | '1.000;HWTF;TRMNL16-.' | '1.001;HWTF;TRMNL16-Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID4 | 'TRMNL16 .' | 'TRMNL16 Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID6 | 'TRMNL16-.' | 'TRMNL16-Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID16 | 'TRMNL16' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| name | ID17 | '.' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| head/name | version | 1.000 | 1.001 | - | - | version bump so fixed builds are distinguishable |

## TRMNL21-Regular

| table | item | old | new | old px | new px | why |
|---|---|---|---|---|---|---|
| DSIG | table | present | removed | - | - | legacy digital-signature table invalidated by any edit; removal is standard practice (OpenType spec deprecates DSIG) |
| hmtx | uni00A0 | 510 | 288 | 10.625px | 6px | no-break space := space width (was 10.625px vs 6px space!) |
| hmtx | uni200B | 68 | 0 | 1.417px | 0px | ZERO WIDTH SPACE must be zero-width |
| hmtx | commaaccentbelowcmb | 600 | 0 | 12.500px | 0px | combining mark must be zero-width like every other mark |
| hmtx | uni02BC | 374 | 384 | 7.792px | 8px | EMPTY spacing glyph, snap 7.792px -> 8px (needs drawing, see notes) |
| hmtx | uni02BB | 374 | 384 | 7.792px | 8px | EMPTY spacing glyph, snap 7.792px -> 8px (needs drawing, see notes) |
| hmtx | uni02B9 | 272 | 288 | 5.667px | 6px | EMPTY spacing glyph, snap 5.667px -> 6px (needs drawing, see notes) |
| hmtx | uni02C8 | 272 | 288 | 5.667px | 6px | EMPTY spacing glyph, snap 5.667px -> 6px (needs drawing, see notes) |
| hmtx | squareblack.case | 832 | 816 | 17.333px | 17px | EMPTY glyph carrying the 16px-master advance; snap 17.333px -> 17px |
| hmtx | squarewhite.case | 832 | 816 | 17.333px | 17px | EMPTY glyph carrying the 16px-master advance; snap 17.333px -> 17px |
| hmtx | uni2002 | 578 | 528 | 12.042px | 11px | en space := 1/2 em (10.5px -> 11px, rounded up) |
| hmtx | uni2003 | 1054 | 1008 | 21.958px | 21px | em space := 1 em (21px); shipped 21.958px |
| hmtx | uni2007 | 680 | 576 | 14.167px | 12px | figure space := width of digit zero (12px) |
| hmtx | uni2008 | 204 | 240 | 4.250px | 5px | punctuation space := width of period (5px) |
| hmtx | uni2009 | 170 | 192 | 3.542px | 4px | thin space := 1/5 em -> 4px |
| hmtx | uni200A | 136 | 96 | 2.833px | 2px | hair space := 1/10 em -> 2px |
| hmtx | uni202F | 170 | 192 | 3.542px | 4px | narrow no-break space := thin space (4px) |
| hmtx | uni205F | 204 | 240 | 4.250px | 5px | medium math space := 4/18 em -> 5px |
| name | ID1 | 'TRMNL21 .' | 'TRMNL21' | - | - | placeholder '.' style name made unique per weight |
| name | ID3 | '1.000;HWTF;TRMNL21-.' | '1.001;HWTF;TRMNL21-Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID4 | 'TRMNL21 .' | 'TRMNL21 Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID6 | 'TRMNL21-.' | 'TRMNL21-Regular' | - | - | placeholder '.' style name made unique per weight |
| name | ID16 | 'TRMNL21' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| name | ID17 | '.' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| head/name | version | 1.000 | 1.001 | - | - | version bump so fixed builds are distinguishable |

## TRMNL21-Bold

| table | item | old | new | old px | new px | why |
|---|---|---|---|---|---|---|
| DSIG | table | present | removed | - | - | legacy digital-signature table invalidated by any edit; removal is standard practice (OpenType spec deprecates DSIG) |
| hmtx | NULL | 600 | 0 | 12.500px | 0px | control glyph must be zero-width (Regular is 0) |
| hmtx | uni00A0 | 456 | 336 | 9.500px | 7px | no-break space := space width (was 9.5px vs 7px space) |
| hmtx | uni200B | 600 | 0 | 12.500px | 0px | ZERO WIDTH SPACE must be zero-width |
| hmtx | commaaccentbelowcmb | 600 | 0 | 12.500px | 0px | combining mark must be zero-width like every other mark |
| hmtx | uni02BC | 320 | 336 | 6.667px | 7px | EMPTY spacing glyph, snap 6.667px -> 7px (needs drawing, see notes) |
| hmtx | uni02BB | 320 | 336 | 6.667px | 7px | EMPTY spacing glyph, snap 6.667px -> 7px (needs drawing, see notes) |
| hmtx | uni02B9 | 256 | 240 | 5.333px | 5px | EMPTY spacing glyph, snap 5.333px -> 5px (needs drawing, see notes) |
| hmtx | uni02C8 | 256 | 240 | 5.333px | 5px | EMPTY spacing glyph, snap 5.333px -> 5px (needs drawing, see notes) |
| hmtx | squareblack.case | 832 | 816 | 17.333px | 17px | EMPTY glyph carrying the 16px-master advance; snap 17.333px -> 17px |
| hmtx | squarewhite.case | 832 | 816 | 17.333px | 17px | EMPTY glyph carrying the 16px-master advance; snap 17.333px -> 17px |
| hmtx | uni2002 | 600 | 528 | 12.500px | 11px | en space := 1/2 em (10.5px -> 11px, rounded up) |
| hmtx | uni2003 | 600 | 1008 | 12.500px | 21px | em space := 1 em (21px); shipped placeholder 600 |
| hmtx | uni2007 | 600 | 624 | 12.500px | 13px | figure space := width of digit zero (13px) |
| hmtx | uni2008 | 600 | 288 | 12.500px | 6px | punctuation space := width of period (6px) |
| hmtx | uni2009 | 600 | 192 | 12.500px | 4px | thin space := 1/5 em -> 4px |
| hmtx | uni200A | 600 | 96 | 12.500px | 2px | hair space := 1/10 em -> 2px |
| hmtx | uni202F | 600 | 192 | 12.500px | 4px | narrow no-break space := thin space (4px) |
| hmtx | uni205F | 600 | 240 | 12.500px | 5px | medium math space := 4/18 em -> 5px |
| name | ID3 | '1.000;HWTF;TRMNL21-.' | '1.001;HWTF;TRMNL21-Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID4 | 'TRMNL21 .' | 'TRMNL21 Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID6 | 'TRMNL21-.' | 'TRMNL21-Bold' | - | - | placeholder '.' style name made unique per weight |
| name | ID16 | 'TRMNL21' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| name | ID17 | '.' | removed | - | - | typographic family/style records are redundant for a 2-weight RIBBI family; the shipped style was the '.' placeholder |
| head/name | version | 1.000 | 1.001 | - | - | version bump so fixed builds are distinguishable |
