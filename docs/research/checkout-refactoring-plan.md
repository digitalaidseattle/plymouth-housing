# CheckoutPage Refactoring Plan

**Ticket:** PIT-402
**Branch:** `maarten/402-refactor-checkout-page`
**Goal:** Reduce `CheckoutPage.tsx` from ~711 lines to ~120–150 lines of pure orchestration by extracting custom hooks and components.

---

## Current State

`CheckoutPage.tsx` violates the single-responsibility principle by handling:

- Data fetching (categorized items, buildings)
- Cart state and operations
- Resident checkout history
- Dialog visibility management
- Navigation on checkout success
- All rendering

**14+ `useState` declarations** make state changes hard to trace and test. Two near-identical `CategorySection` render loops (one for welcome basket, one for general items) violate DRY. The `Appliance Miscellaneous` special-case appears twice in identical inline lambdas.

**Note:** `useSnackbar` already exists in `src/hooks/` but `CheckoutPage` re-implements it manually — a quick win.

---

## Target State

```
CheckoutPage.tsx          ~120–150 lines  (orchestration only)
useCheckoutData.ts         ~80 lines
useCheckoutHistory.ts      ~50 lines
useCartOperations.ts       ~70 lines
CheckoutPageHeader.tsx     ~60 lines
CategoryList.tsx           ~80 lines
```

---

## Implementation Phases

### Phase 1 — Custom Hooks
All hooks live in `src/hooks/`. Follow the existing `useHistoryData` style: typed props interface, `useEffect` with mounted guard, named return object.

#### 1a. Use the existing `useSnackbar` hook
**File:** `src/pages/checkout/CheckoutPage.tsx`
Replace the manual `snackbarState` / `setSnackbarState` / `handleSnackbarClose` / `handleCheckoutError` block with a call to `useSnackbar()` from `src/hooks/useSnackbar.ts`.
This is a self-contained change with zero risk — good first PR.

---

#### 1b. `useCheckoutData`
**New file:** `src/hooks/useCheckoutData.ts`

Extracts:
- `fetchData` (`useCallback`) — fetches `ENDPOINTS.CATEGORIZED_ITEMS`, populates `data`, `welcomeBasketData`, and the empty-skeleton `checkoutItems`
- `fetchBuildings` (`useCallback`) — calls `getBuildings`
- State: `data`, `welcomeBasketData`, `buildings`, `unitNumberValues`
- The `useEffect` that calls both fetches on mount

Returns:
```ts
{
  data,
  welcomeBasketData,
  filteredData,        // memoised: data minus 'Welcome Basket'
  buildings,
  unitNumberValues,
  setUnitNumberValues,
  checkoutItems,
  setCheckoutItems,
  fetchData,           // exposed so CheckoutDialog can call it after success
}
```

Props: `{ user, checkoutType, onError }` — where `onError` comes from `useSnackbar`.

---

#### 1c. `useCheckoutHistory`
**New file:** `src/hooks/useCheckoutHistory.ts`

Extracts the `useEffect` block at lines 102–161 of `CheckoutPage.tsx`.

Props: `{ user, residentId, residentInfoIsMissing }`
Returns: `{ checkoutHistory }`

The APPLIANCE_MISC deduplication logic stays in this hook — it is history-processing logic, not UI logic.

---

#### 1d. `useCartOperations`
**New file:** `src/hooks/useCartOperations.ts`

Extracts `addItemToCart`, `removeItemFromCart`, and `activeSection` state.

Props: `{ checkoutItems, setCheckoutItems }`
Returns: `{ activeSection, setActiveSection, addItemToCart, removeItemFromCart }`

---

### Phase 2 — New Components

#### 2a. `<CheckoutPageHeader>`
**New file:** `src/components/Checkout/CheckoutPageHeader.tsx`

Extracts the outer sticky `<Box>` block (lines 443–487 in current `CheckoutPage.tsx`):
- Resident info / missing info `<Button>`
- `<SearchBar>`
- `<Navbar>` (shown only when not searching and `checkoutType === 'general'`)

Props:
```ts
{
  residentInfo: ResidentInfo;
  residentInfoIsMissing: boolean;
  checkoutType: CheckoutType;
  searchActive: boolean;
  data: CategoryProps[];
  navbarData: CategoryProps[];
  setSearchData: (d: CategoryProps[]) => void;
  setSearchActive: (a: boolean) => void;
  onResidentInfoClick: () => void;
}
```

---

#### 2b. `<CategoryList>`
**New file:** `src/components/Checkout/CategoryList.tsx`

Unifies the two near-identical `CategorySection` render loops. The key differences between welcome basket and general are:
- The `section` string passed to `addItemToCart` (`'welcomeBasket'` vs `'general'`)
- General items intercept Appliance Miscellaneous and past-checkout items; welcome basket does not

Props:
```ts
{
  categories: CategoryProps[];
  checkoutItems: CategoryProps[];
  sectionType: 'welcomeBasket' | 'general';
  activeSection: string;
  checkoutHistory: CheckoutHistoryItem[];
  searchActive: boolean;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string, section: string) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  onApplianceMiscClick: (item: CheckoutItemProp) => void;
  onPastCheckoutClick: (item: CheckoutItemProp) => void;
}
```

The Appliance Miscellaneous intercept and past-checkout intercept move into this component's `addItemToCart` wrapper, eliminating the duplicate lambdas on lines 527–553 and 637–654.

---

### Phase 3 — Simplify `CheckoutPage`

After Phases 1 and 2, `CheckoutPage.tsx` becomes:

1. Call the three custom hooks
2. Compute derived values (`residentInfoIsMissing`, `navbarData`)
3. Manage: `residentInfo`, `showResidentDetailDialog`, `showAdditionalNotesDialog`, `showPastCheckoutDialog`, `selectedItem`, `openSummary` — these 6 remain in the component as pure UI state
4. Render: dialogs → `<CheckoutPageHeader>` → `<CategoryList>` (search results) → `<CategoryList>` (main) → `<CheckoutFooter>` → `<CheckoutDialog>` → `<SnackbarAlert>`

---

### Phase 4 — Tests

- **Existing tests in `CheckoutPage.test.tsx` must continue to pass** after every phase. Run `npm run test:unit` between phases.
- Add unit tests for each new hook using `renderHook` from `@testing-library/react`.
- Add a focused test for `<CategoryList>` covering the Appliance Miscellaneous intercept.
- Tests for `<CheckoutPageHeader>` are optional but recommended for the resident info button state.

---

## Task Breakdown (parallelisable)

| # | Task | Depends on | Effort |
|---|------|-----------|--------|
| 1 | Swap manual snackbar for `useSnackbar` | — | XS |
| 2 | Implement `useCheckoutData` | — | S |
| 3 | Implement `useCheckoutHistory` | — | S |
| 4 | Implement `useCartOperations` | — | S |
| 5 | Integrate hooks 2–4 into CheckoutPage, verify tests pass | 2, 3, 4 | M |
| 6 | Implement `<CheckoutPageHeader>` | 5 | S |
| 7 | Implement `<CategoryList>` | 5 | M |
| 8 | Integrate components 6–7, verify tests pass | 6, 7 | S |
| 9 | Write hook unit tests | 2, 3, 4 | S |

---

## Lessons & Rules for the Codebase

These patterns emerged from analysing this refactoring and apply broadly.

### 1. The "5+ `useState`" smell
When a component has 5 or more `useState` declarations, ask: do any group into a coherent concern? If yes, extract a custom hook. A hook boundary is a good place to put `useEffect` dependencies too — they stay co-located with the state they affect.

### 2. Near-identical render blocks → data-driven component
Two `.map()` blocks that differ only by a prop value (like `'welcomeBasket'` vs `'general'`) should become one component with a `sectionType` prop. Inline conditionals inside render are harder to test than a small prop.

### 3. Use hooks you already have
Before writing `useState` + a handler, check `src/hooks/`. `useSnackbar`, `useAuthorization`, `usePersistentState`, and `useInactivityTimer` are all general-purpose. Using them shrinks components and prevents logic drift between implementations.

### 4. Intercepts belong in the layer that owns the interaction
The Appliance Miscellaneous dialog intercept lives today in two inline lambdas passed as `addItemToCart` props. Because `CategoryList` will own the cart-add interaction, the intercept belongs in `CategoryList` — not scattered across call sites.

### 5. Keep the container thin
`CheckoutPageContainer` is a good pattern: it reads routing state and passes it down. `CheckoutPage` should be the same — an orchestrator that composes hooks and components, not a place where logic lives. Target: no business logic in a page component, only wiring.

### 6. Constants first, magic values never
`SPECIAL_ITEMS.APPLIANCE_MISC` and `WELCOME_BASKET_ITEMS` already exist in `src/types/constants.ts`. Any new magic number or string should go there before it appears in more than one file. The string literals `'welcomeBasket'` and `'general'` are candidates: consider a `CHECKOUT_SECTION` constant object or a TypeScript union type.
