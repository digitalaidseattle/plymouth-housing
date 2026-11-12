# Checkout and history E2E selector contract (PIT-524)

These attributes identify controls independently of translated labels, HTML
heading levels, Material UI classes, and sibling order. They are test contracts:
preserve their names when changing the UI. Existing IDs and testids remain valid.

## Checkout summary

| Attribute | Owner | Contract |
| --- | --- | --- |
| `data-testid="checkout-summary-dialog"` | `src/components/Checkout/CheckoutDialog.tsx` | Summary dialog root. Scope all summary searches here; the catalogue remains mounted behind it. |
| `data-edit-mode` | Same dialog root | Exposes the existing `isEditMode` state as `"true"` / `"false"`; it does not change that state. |
| `data-testid="checkout-summary-title"` | Same component, summary title | Present in the summary view. Combine with `data-edit-mode="true"` when waiting for editing mode. |
| `data-testid="checkout-dialog-confirm-btn"` | Same component, Confirm button | Normal checkout confirmation. Existing ID is retained. |
| `data-testid="checkout-dialog-save-btn"` | Same component, save button | Same hook for No changes, Save changes, and Working states. Inspect `is_enabled()` for availability. Existing ID is retained. |
| `data-testid="checkout-dialog-cancel-edit-btn"` | Same component, edit Cancel button | Cancels edits. Existing ID and handler are retained. |
| `data-testid="checkout-item-row"` | `src/components/Checkout/CheckoutCard.tsx` | Repeated once per rendered item card, in both catalogue and summary. Always scope it to the summary for summary operations. |
| `data-item-id` / `data-item-name` | Same item card | Item identity, separate from the testid. ID is preferred when the caller has it. Existing page-object methods accept a name, so use an exact `data-item-name` predicate without changing those methods' interfaces. Names must be unambiguous within the fixture's cart. |
| `data-testid="checkout-item-increase"` | `src/components/Checkout/ItemQuantityButton.tsx` | Increase button within one selected item card. |
| `data-testid="checkout-item-decrease"` | Same component | Decrease button within one selected item card; only present when the item is in the cart, matching existing behavior. |
| `data-testid="test-id-quantity"` | Same component | Existing quantity hook, retained unchanged. Do not rename it or assume its HTML tag is `p`. |

Testids are constant strings. Item names and IDs are data attributes, never part
of a generated testid. The same item can appear in the catalogue and summary;
root scoping is mandatory even when using its ID.

The over-limit view shares the checkout dialog shell. Its separate confirmation
button is not the normal summary Confirm button. Existing over-limit IDs and
behavior are unchanged by this work.

## Transaction details

`src/components/DialogTemplate.tsx` already supplies `dialog`, `dialog-close-btn`,
and `dialog-submit-btn`. This shared component and its props remain unchanged.

| Attribute | Owner | Contract |
| --- | --- | --- |
| `data-testid="transaction-details-content"` | `src/components/History/TransactionDetails.tsx` | Identifies the details content, on the existing loading or loaded Stack. These branches are mutually exclusive. This is a content marker, not a new dialog wrapper. |
| `data-testid="dialog"` | Existing `DialogTemplate` root | Select the root that contains `transaction-details-content`; a bare `dialog` selector can match a different modal. |
| `data-testid="dialog-close-btn"` | Existing template close button | Resolve inside that transaction dialog. |
| `data-testid="dialog-submit-btn"` | Existing template action button | Resolves Edit inside transaction details when editing is available. The existing render condition is preserved. |
| `data-testid="transaction-details-history"` | `TransactionDetails.tsx`, `AccordionSummary` | Clickable History accordion control, scoped to the transaction dialog. Its existing parent ID is retained. |

The transaction dialog locator intentionally uses attribute-based XPath:

```xpath
//*[@data-testid='dialog'][.//*[@data-testid='transaction-details-content']]
```

This selects the existing template root including its title, content, and
actions, without changing template props or colliding with another dialog.
XPath itself is not the problem: visible-text matching and unscoped searches
were the fragile parts.

## E2E integration

- `tests/utilities/locators.py`: summary title, editing title, confirmation,
  save/cancel, transaction dialog, close, Edit and History selectors consume
  the hooks above.
- `tests/pages/checkout_page.py`: existing summary-row and quantity methods
  use hooks and an exact item-name attribute instead of tag, MUI class or
  sibling-position selectors. Signatures, waits and actions are unchanged.
- `tests/pages/history_page.py`: already consumes the central locator
  constants, so it requires no code change.

Deploy the application hooks to staging before running the updated E2E suite
against that environment. Existing UI tests must not be skipped, weakened, or
automatically redirected to production to make this change appear green.

## Review of the remaining supplied locator groups

| Class / area | Finding and disposition |
| --- | --- |
| `CommonLocators` | Menu headings and General / Welcome Basket submenu labels depend on tags and text. The href predicates reduce ambiguity but the shared `/checkout` href alone cannot distinguish submenus. Leave for a navigation ticket. |
| `HistoryPageLocators` outside dialogs | History heading, count label and empty-state message depend on text; the heading may collide with navigation. `checkout-card-<transaction_id>` is already an explicit ID contract; preserve it. Count/loading behavior is separate from PIT-524. |
| `HomePageLocators` | Preserve `section-checkout` and `section-inventory`. Admin home href is explicit. Email, organization name, greeting and logout locators depend on rendered tags/text. A dedicated logout hook can be a separate scoped change. |
| `LoginPageLocators` | Preserve the app login href, volunteer autocomplete hook, checkout-section hook and four PIN IDs. Microsoft login inputs/buttons are external DOM; this application cannot add hooks to them. Yes depends on English text and shares a stateful Microsoft control ID. App Continue, database message and global option list can be scoped in a later auth ticket. |
| `LogoutPageLocators` | Post-logout text is wording-dependent. Out of this ticket's checkout/history scope. |
| `InventoryPageLocators` | Table rows, Add/Cancel, quantity text, MUI classes and the clear SVG are broad. Welcome Basket targets a native input rather than an option. Dynamic option/item locators interpolate strings without escaping; the inventory cell uses positional `td[5]`. Verify these against the inventory DOM in a separate change. |
| `CheckoutPageLocators` outside the summary | Preserve building/unit/resident IDs and scoped listbox IDs. The inline-style visibility check, generic Continue/search/text/warning/loading locators and hardcoded sheet-set button remain fragile. The catalogue add locator depends on `p`, an aria-label and MUI layout. These are separate from the summary selectors changed here. |
| `AddItemPageLocators` | Submit, close and success-heading selectors require modal scoping and/or dedicated hooks. `name="quantity"` is useful when scoped to its form. Leave for the inventory/add-item ticket. |

This work does not fix the previously reported missing
`CheckOutPage.open_welcome_basket()` method, BDD navigation sequence, history
record-count failure or login timeout. Those need separate root-cause fixes.

## Validation and acceptance

Run the unchanged unit suite and application build. Verify that the frontend
diff adds only `data-*` attributes and preserves existing IDs, testids, handlers,
conditions, component props, styling and element structure.

On staging, run the existing smoke suite and checkout/history edit scenarios.
In particular, confirm that quantity changes affect the chosen summary row,
the background catalogue is never the click target, another open dialog does
not supply the Edit/Close controls, and Save remains disabled without edits.
Check cancellation and the native discard confirmation as before.

The supplied earlier E2E run's 7 failures and 1 setup error are baseline evidence,
not evidence that this selector change passes staging. Report staging results
separately from local unit, build and selector checks.
