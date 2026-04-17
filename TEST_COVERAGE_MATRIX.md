# Test Coverage Matrix

This matrix maps the QA Automation Playground routes/components to the current Playwright coverage layers.

Legend:
- `Render`: isolated route/component render coverage in `tests/component-isolation.spec.js`
- `Action`: isolated single-behavior coverage in `tests/component-actions.spec.js`
- `Flow`: broader grouped or end-to-end coverage in the existing scenario specs
- `Gaps`: highest-signal remaining areas that are not yet explicitly asserted

## Overview and Core

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/` | Home shell, nav, badges | Via `navigation.spec.js` | n/a | `navigation.spec.js` | No dedicated home-content assertions beyond shell |
| `/admin` | Mode toggles, reset | Yes | Yes | `core-components.spec.js` | No explicit reset-button side-effect test beyond helper usage |
| `/coverage-index` | Coverage table | Yes | n/a | `navigation.spec.js`, `async-layout.spec.js` | No row-count assertion |
| `/ab-testing` | Variant card, rebucket button | Yes | Covered in parity flow | `heroku-parity.spec.js` | No explicit flaky-mode variant drift test |
| `/basic-elements` | Inputs, submit/reset | Yes | Yes | `core-components.spec.js` | No explicit disabled/readonly negative edit assertion |
| `/selection-controls` | checkboxes, radios, dropdowns | Yes | Yes | `core-components.spec.js` | No explicit multi-select content assertion |
| `/buttons` | click, double-click, long-press, hover, add/remove, context menu | Yes | Yes | `core-components.spec.js` | Context-menu menu-item click not isolated yet |
| `/dialogs` | alert, confirm, prompt, modal, nested modal, toast | Yes | Yes | `core-components.spec.js` | Exit-intent modal not directly asserted |

## Forms

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/forms/login` | Login form | Yes | Success + failure | `forms-and-data.spec.js` | No browser-native validation assertions |
| `/forms/register` | Registration validation | Yes | Success + mismatch negative | `forms-and-data.spec.js` | No duplicate-username rejection test |
| `/forms/forgot-password` | Reset email submit | Yes | Yes | `forms-and-data.spec.js` | No invalid-email client-validation assertion |

## Tables

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/tables/static` | Static table | Yes | n/a | `forms-and-data.spec.js` | No row-count assertion |
| `/tables/sortable` | Sortable table | Yes | Yes | `forms-and-data.spec.js` | No descending-sort assertion |
| `/tables/paginated` | Pagination controls | Yes | Yes | `forms-and-data.spec.js` | No previous-page assertion |
| `/tables/editable` | Inline quantity editing | Yes | Yes | `forms-and-data.spec.js` | No zero/negative value guard assertion |

## Dynamic

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/dynamic/loading` | Loading spinner/content | Yes | Yes | `async-layout.spec.js` | No slow-network variant assertion |
| `/dynamic/content` | Rotating content cards | Yes | Covered in parity flow | `heroku-parity.spec.js` | No multiple-refresh rotation assertion |
| `/dynamic/delayed-content` | Delayed reveal | Yes | Yes | `async-layout.spec.js` | No flaky-mode timing assertion |
| `/dynamic/controls` | Enable/disable controls | Yes | Enable action | `async-layout.spec.js` | No disable-after-enable assertion |
| `/dynamic/disappearing` | Vanishing chip | Yes | Yes | `async-layout.spec.js` | Restore path not isolated |

## Frames and Windows

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/frames/editor` | WYSIWYG iframe | Yes | Via grouped frame edit | `async-layout.spec.js` | No output/state assertion for edited text |
| `/frames/nested` | Nested frames | Yes | Via grouped frame traversal | `async-layout.spec.js` | No inner-frame content mutation test |
| `/windows` | New tab, redirect | Yes | Via grouped actions | `async-layout.spec.js` | No navigation-history list assertion |

## Interactions

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/interactions/drag-drop` | Drag/drop target | Yes | Yes | `async-layout.spec.js` | No repeated-drag assertion |
| `/interactions/hover` | Hover reveal actions | Yes | Covered via buttons route and grouped suite | `async-layout.spec.js` | Route-local reveal click not isolated |
| `/interactions/slider` | Range slider | Yes | Yes | `async-layout.spec.js` | No keyboard-driven slider assertion |
| `/interactions/menu` | Multi-level menu | Yes | Yes | `async-layout.spec.js` | No alternate menu item assertions |

## Files

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/files/upload` | Upload input | Yes | Yes | `async-layout.spec.js` | No multi-file assertion |
| `/files/download` | Plain downloads | Yes | Yes | `async-layout.spec.js` | CSV/JSON download variants not isolated |
| `/files/secure-download` | Auth-gated downloads | Yes | Locked negative | `heroku-parity.spec.js` | No session-login unlock path isolated outside parity flow |

## Locators

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/advanced-locators` | Shadow DOM, deep DOM, duplicate labels | Yes | n/a | `async-layout.spec.js` | Duplicate-label disambiguation not explicitly asserted |
| `/advanced-locators/challenging-dom` | Repeated row actions | Yes | Covered in parity flow | `heroku-parity.spec.js` | Delete-row action not isolated |
| `/advanced-locators/shifting-content` | Shifted nav/media layout | Yes | Covered in parity flow | `heroku-parity.spec.js` | Reset-after-shift assertion absent |

## Auth

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/auth/basic` | Basic auth simulation | Yes | Negative covered | `forms-and-data.spec.js` | Success path not yet isolated as its own atomic test |
| `/auth/digest` | Digest auth simulation | Yes | Success + failure | `heroku-parity.spec.js` | No nonce-specific assertion |
| `/auth/session` | Session login | Yes | Success | `forms-and-data.spec.js` | Logout path not isolated |
| `/auth/protected` | Protected content gate | Yes | Negative covered | `forms-and-data.spec.js` | No positive isolated assertion after login helper |

## Scrolling

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/scrolling/infinite` | Infinite feed | Yes | Yes | `async-layout.spec.js` | Scroll-triggered auto-load path not isolated, only button path |
| `/scrolling/lazy-images` | Lazy-loaded images | Yes | n/a | `async-layout.spec.js` | No explicit post-intersection src-change timing assertion |
| `/scrolling/floating-menu` | Sticky menu anchors | Yes | Covered in grouped suite | `async-layout.spec.js` | Other anchors not isolated |

## API and Flaky

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/api-ui` | Fetch, error, mutation | Yes | Fetch success + error | `api-flaky-shop.spec.js` | Mutation isolated action not split from fetch in atomic suite |
| `/flaky/delayed-button` | Delayed enablement | Yes | Covered in grouped suite | `api-flaky-shop.spec.js` | Pre-ready disabled assertion not isolated |
| `/flaky/race-condition` | Race winner output | Yes | Covered in grouped suite | `api-flaky-shop.spec.js` | Flaky-mode alternate winner not asserted |
| `/flaky/re-render` | DOM rerender versioning | Yes | Covered in grouped suite | `api-flaky-shop.spec.js` | Dynamic-ID mutation under rerender not asserted |
| `/flaky/random-toast` | Random toast | Yes | Covered in grouped suite | `api-flaky-shop.spec.js` | Multiple-message distribution not asserted |
| `/flaky/typos` | Copy drift | Yes | n/a | `api-flaky-shop.spec.js` | Flaky-mode typo variant not isolated |

## Shop

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/shop/login` | Shop auth | Yes | Success + failure | `api-flaky-shop.spec.js` | No invalid-toast text exact match |
| `/shop/products` | Product list/add to cart | Yes | Indirect via flow | `api-flaky-shop.spec.js` | Add-to-cart atomic assertion not split yet |
| `/shop/cart` | Cart table/update/remove | Yes | Indirect via flow | `api-flaky-shop.spec.js` | Quantity update/remove actions not isolated |
| `/shop/checkout` | Checkout form/place order | Yes | Empty-cart negative | `api-flaky-shop.spec.js` | Positive place-order atomic test not split from full flow |
| `/shop/confirmation` | Order confirmation | Yes | Indirect via flow | `api-flaky-shop.spec.js` | No order-field atomic assertions beyond flow |

## Status and Events

| Route | Major Component(s) | Render | Action | Flow | Gaps |
| --- | --- | --- | --- | --- | --- |
| `/status` | status codes, broken image, slow load | Yes | 404 + 500 | `async-layout.spec.js` | 200 and slow-load actions not isolated |
| `/keyboard` | key/input events | Yes | Yes | `async-layout.spec.js` | Non-text keys not isolated |
| `/page-events` | notification + delayed redirect | Yes | Notification action only | `async-layout.spec.js` | Delayed redirect path not isolated |
| `/page-events/notifications` | rotating notification banner | Yes | Yes | `heroku-parity.spec.js` | No full message cycle assertion |
| `/page-events/onload-error` | simulated onload error | Yes | Covered via render/parity | `heroku-parity.spec.js` | Retrigger button not isolated |
| `/geolocation` | preset/browser geo actions | Yes | Preset action | `async-layout.spec.js` | Browser geolocation path not asserted |

## Current Remaining High-Value Gaps

- Route-local context-menu action selection on `/buttons`
- Duplicate-label disambiguation assertions on `/advanced-locators`
- Logout behavior on `/auth/session`
- Cart quantity update/remove atomic tests on `/shop/cart`
- Positive secure-download unlock via session/basic/digest in a dedicated atomic test
- Delayed redirect assertion on `/page-events`
- Slow-load `status-slow` and `status-200` isolated tests
- Browser-geolocation path if test environment geolocation mocking is introduced
