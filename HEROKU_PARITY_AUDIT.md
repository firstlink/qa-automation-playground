# Heroku Parity Audit

Compared on April 20, 2026 against the live catalog at [the-internet.herokuapp.com](https://the-internet.herokuapp.com/).

Method:
- Verified the live Heroku example list from the homepage.
- Spot-checked live Heroku behavior for pages where parity often differs: Context Menu, Form Authentication, Entry Ad, and JQuery UI Menus.
- Compared those examples to the current implementation in this repo by route, behavior, and current Playwright coverage.

Verdicts:
- `Near-match`: behavior is very close to the Heroku example, even if the layout is modernized.
- `Adapted`: the learning goal is covered, but the implementation is intentionally broader or different.

## Route-by-Route Comparison

| Heroku Example | Heroku URL | Local Route | Verdict | Notes |
| --- | --- | --- | --- | --- |
| A/B Testing | `/abtest` | `/ab-testing` | Adapted | Same idea of variant-driven copy, but presented in a more explicit trainer-friendly card. |
| Add/Remove Elements | `/add_remove_elements/` | `/buttons` | Near-match | Same button-creation/removal concept, grouped into the broader buttons module. |
| Basic Auth | `/basic_auth` | `/auth/basic` | Adapted | Covers auth gating, but not the browser-native HTTP basic-auth prompt. |
| Broken Images | `/broken_images` | `/status` | Near-match | Broken-image behavior is present and observable in the status module. |
| Challenging DOM | `/challenging_dom` | `/advanced-locators/challenging-dom` | Near-match | Same automation challenge: unstable controls, repeated labels, and row-relative targeting. |
| Checkboxes | `/checkboxes` | `/selection-controls` | Near-match | Checkbox behavior is covered directly. |
| Context Menu | `/context_menu` | `/buttons` | Adapted | Right-click behavior exists, but the local app uses a custom menu/toast flow instead of a simple JavaScript alert. |
| Digest Authentication | `/digest_auth` | `/auth/digest` | Adapted | Covers digest-style challenge behavior, but as an app simulation instead of a native challenge dialog. |
| Disappearing Elements | `/disappearing_elements` | `/dynamic/disappearing` | Near-match | Same disappearing-element challenge. |
| Drag and Drop | `/drag_and_drop` | `/interactions/drag-drop` | Near-match | Same drag source and drop target training goal. |
| Dropdown | `/dropdown` | `/selection-controls` | Near-match | Same select-option practice, with extra delayed-dropdown coverage added. |
| Dynamic Content | `/dynamic_content` | `/dynamic/content` | Near-match | Same rotating-content learning goal, with explicit refresh-driven variation. |
| Dynamic Controls | `/dynamic_controls` | `/dynamic/controls` | Near-match | Same enable/disable and async-control challenge. |
| Dynamic Loading | `/dynamic_loading` | `/dynamic/loading` | Near-match | Same loading-spinner / delayed-content concept. |
| Entry Ad | `/entry_ad` | `/dialogs` | Adapted | Same modal-on-entry behavior, but grouped into the dialogs module. |
| Exit Intent | `/exit_intent` | `/dialogs` | Adapted | Same concept is present, but folded into the dialogs lesson instead of a standalone page. |
| File Download | `/download` | `/files/download` | Near-match | Same download automation goal, with multiple file types exposed. |
| File Upload | `/upload` | `/files/upload` | Near-match | Same upload workflow. |
| Floating Menu | `/floating_menu` | `/scrolling/floating-menu` | Near-match | Same sticky/floating menu behavior. |
| Forgot Password | `/forgot_password` | `/forms/forgot-password` | Near-match | Same email-reset submission flow. |
| Form Authentication | `/login` | `/forms/login` | Adapted | Same login-success/login-failure teaching goal, but with local seeded credentials instead of `tomsmith / SuperSecretPassword!`. |
| Frames | `/frames` | `/frames/editor` | Near-match | Same WYSIWYG/editor frame challenge. |
| Geolocation | `/geolocation` | `/geolocation` | Near-match | Same location-access practice, with a deterministic preset option for training. |
| Horizontal Slider | `/horizontal_slider` | `/interactions/slider` | Near-match | Same slider interaction. |
| Hovers | `/hovers` | `/interactions/hover` | Near-match | Same hover-reveal training goal. |
| Infinite Scroll | `/infinite_scroll` | `/scrolling/infinite` | Near-match | Same infinite-scroll behavior, with an extra trainer-friendly load-more control. |
| Inputs | `/inputs` | `/basic-elements` | Near-match | Numeric/text input handling is covered, along with extra input types beyond Heroku. |
| JQuery UI Menus | `/jqueryui/menu` | `/interactions/menu` | Adapted | Covers hierarchical menu interaction, but the local version is simpler than the original jQuery UI menu tree. |
| JavaScript Alerts | `/javascript_alerts` | `/dialogs` | Near-match | Alert, confirm, and prompt are all covered. |
| JavaScript onload event error | `/javascript_error` | `/page-events/onload-error` | Near-match | Same onload-error observability concept. |
| Key Presses | `/key_presses` | `/keyboard` | Near-match | Same key-event practice. |
| Large & Deep DOM | `/large` | `/advanced-locators` | Adapted | Covers deep-DOM targeting and difficult locator structure, but merged with Shadow DOM and duplicate-label training. |
| Multiple Windows | `/windows` | `/windows` | Near-match | Same new-tab / multiple-window practice. |
| Nested Frames | `/nested_frames` | `/frames/nested` | Near-match | Same nested-frame access pattern. |
| Notification Messages | `/notification_message_rendered` | `/page-events/notifications` | Near-match | Same changing notification-banner behavior. |
| Redirect Link | `/redirector` | `/windows` | Adapted | Redirect behavior is present, but bundled into the windows/navigation lesson. |
| Secure File Download | `/download_secure` | `/files/secure-download` | Adapted | Same protected-download concept, but unlocked through local app auth state rather than Heroku’s exact auth chain. |
| Shadow DOM | `/shadowdom` | `/advanced-locators` | Near-match | Shadow DOM access is covered directly. |
| Shifting Content | `/shifting_content` | `/advanced-locators/shifting-content` | Near-match | Same layout-shift challenge. |
| Slow Resources | `/slow` | `/status` | Adapted | Slow-loading behavior exists, but is folded into the status/performance conversation instead of a single dedicated page. |
| Sortable Data Tables | `/tables` | `/tables/sortable` | Near-match | Same sortable-table practice. |
| Status Codes | `/status_codes` | `/status` | Near-match | Same 200/404/500 testing goal, grouped into a richer status page. |
| Typos | `/typos` | `/flaky/typos` | Near-match | Same typo-drift idea, moved into the flaky module. |
| WYSIWYG Editor | `/iframe` | `/frames/editor` | Near-match | Same editable iframe behavior. |

## Summary

- No Heroku homepage example is outright missing from the current app.
- The biggest intentional differences are in:
  - Basic and digest auth
  - Context Menu
  - Entry Ad and Exit Intent
  - Form Authentication
  - JQuery UI Menus
  - Large & Deep DOM
  - Redirect Link
  - Secure File Download
  - Slow Resources
- Those are not gaps in coverage so much as product decisions: the local app combines some Heroku examples into broader trainer-led modules.

## Recommendation

If the goal is strict Heroku mirroring, the next best changes would be:
- add a browser-native-style basic-auth challenge flow
- split Context Menu into its own page with the exact alert behavior
- split Entry Ad and Exit Intent into standalone routes
- expand JQuery UI Menus to the deeper Downloads -> PDF/CSV/Excel structure
- add a dedicated Slow Resources page instead of only covering that behavior inside `/status`
