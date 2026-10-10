# M18E-C1 Flags learning library expansion

## Coverage

Added 45 hooks to the original 20, for **65 of 195 countries (33.33%)**. The remaining 130 canonical countries have no hook and continue to return `undefined`.

| Region | Countries | With hooks | Coverage |
| --- | ---: | ---: | ---: |
| Europe | 44 | 16 | 36.36% |
| Asia | 48 | 18 | 37.50% |
| Africa | 54 | 11 | 20.37% |
| Americas | 35 | 14 | 40.00% |
| Oceania | 14 | 6 | 42.86% |
| **Total** | **195** | **65** | **33.33%** |

Hook categories: 44 visual, 17 symbol, 3 comparison, and 1 country.

New IDs: `fr de it es pt cz no se dk fi pl ua cn pk bd lk th vn id my sg ph tr ke ng gh et ma eg ug tz us cl co pe uy cu bb bs ni au nz pg ws to`.

## Editorial and sources

Hooks are short, plain-English recognition cues focused on visible layouts, colours, stars, crosses, animals, or emblems. The new entries cite their country-specific Flags of the World page. Each cited page was checked during research; each selected local SVG was parsed as XML and its design elements and colours were checked against the written cue. No uncertain colour meanings or unsupported historical claims were added. Existing entries were preserved unchanged.

The comparison hooks distinguish Indonesia’s longer red-over-white rectangle from Monaco’s and New Zealand’s red Southern Cross stars from Australia’s. The existing Mexico/Italy comparison remains unchanged. Comparison entries include both sources and canonical related-country IDs.

## Bundle and verification

The main JavaScript chunk is **578.21 kB**, compared with the brief’s prior 571.58 kB: an increase of **6.63 kB (about 1.16%)**. No dependency, network request, SVG embedding, or gameplay change was added.

- `npm test`: passed, 190 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; existing chunk-size advisory (>500 kB) and stale Browserslist data notice remain.
- `git diff --check`: passed; Git emitted line-ending conversion warnings for pre-existing modified files.

## Countries without hooks

The following canonical IDs remain uncovered:

- Europe: `ad at by be ba bg hr ee hu is ie lv li lt lu mt mc me nl mk md ro ru sm rs sk si va`
- Asia: `af am az bh bn kh cy kp ge ir iq il jo kw kg la lb mv mn mm om qa sy tj tl tm ae uz ye ps`
- Africa: `dz ao bj bw bf bi cv cm cf td km cg ci cd dj gq er sz ga gm gn gw ls lr ly mg mw ml mr mu mz na ne rw st sn sl so ss sd tg tn zw`
- Americas: `ag bz bo cr dm do ec sv gd gt gy ht hn pa py kn lc vc sr tt ve`
- Oceania: `ki mh fm nr pw sb tv vu`

## Suggested M18E-C2 scope

Continue in curated batches of roughly 25–35 hooks, prioritising under-covered Africa and Europe while maintaining source-per-claim review and local SVG checks. Keep the same schema and missing-hook fallback; do not introduce progress tracking or gameplay weighting.
