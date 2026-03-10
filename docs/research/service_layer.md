# Service Layer for API Calls

## Objective

API calls (`fetch`) are scattered across components, modals, and pages throughout the codebase.
This makes it hard to maintain consistent error handling, retry logic, and auth headers, and means
changes to endpoints or request structure require hunting across many files.

The goal is to consolidate all `fetch` calls into a dedicated service layer under `src/services/`,
one file per domain.

## Approach

### Current state

The following files currently call `fetch` directly:

| File | What it calls |
|---|---|
| `src/services/CheckoutAPICalls.ts` | Checkout, residents, buildings |
| `src/components/History/HistoryAPICalls.ts` | Transaction history |
| `src/components/utils/fetchCategorizedItems.ts` | Categorized items |
| `src/components/inventory/AddItemModal.tsx` | POST inventory change |
| `src/components/inventory/AdjustQuantityModal.tsx` | PUT reset quantity |
| `src/components/inventory/UpdateItemModal.tsx` | POST/PATCH items |
| `src/components/AddVolunteerModal/AddVolunteerModal.tsx` | POST user |
| `src/pages/inventory/index.tsx` | GET items, GET categories |
| `src/pages/VolunteerHome/index.tsx` | GET items |
| `src/pages/checkout/CheckoutPage.tsx` | GET categorized items |
| `src/pages/people/useUsers.ts` | GET users |
| `src/pages/authentication/EnterPinPage.tsx` | POST PIN verify, GET user by ID |
| `src/layout/MainLayout/index.tsx` | GET `/.auth/me`, GET/PATCH/POST user |

Note: `src/services/fetchWithRetry.ts` exists as a resilient wrapper but is bypassed by most of the above.

### Target state

One service file per domain, all under `src/services/`:

```
src/services/
├── authService.ts        # /.auth/me, PIN verification
├── userService.ts        # User CRUD (volunteers, admins)
├── itemService.ts        # Items and categories catalog
├── inventoryService.ts   # Stock adjustments and resets
├── checkoutService.ts    # Checkout flow, residents, buildings
└── historyService.ts     # Transaction history
```

Each file exports plain async functions. Hooks and components call service functions;
they never call `fetch` directly. All service functions route through `fetchWithRetry`.

### Domain breakdown

**`authService.ts`**
- `/.auth/me` (get current Azure Static Web Apps identity)
- `POST` PIN verification

**`userService.ts`**
- GET all users
- GET user by ID
- POST create user
- PATCH update user

**`itemService.ts`**
- GET items (expanded, paginated)
- GET categories
- GET categorized items
- POST create item
- PATCH update item

**`inventoryService.ts`**
- POST inventory change (add stock)
- PUT reset quantity

**`checkoutService.ts`**
- Already largely covered by `CheckoutAPICalls.ts` — absorb and rename

**`historyService.ts`**
- Already largely covered by `HistoryAPICalls.ts` — move to `src/services/` and rename

## Results

Not yet implemented. The `maarten/manage-inventory` branch has taken a first step by extracting
`Items.ts` and `Categories.ts`. These would fold into `itemService.ts`.

## Next Steps

1. Merge `maarten/manage-inventory` first to avoid conflicts with `Items.ts`/`Categories.ts`
2. Move `HistoryAPICalls.ts` → `src/services/historyService.ts`
3. Extract `userService.ts` from `MainLayout`, `EnterPinPage`, `useUsers`, `AddVolunteerModal`
4. Extract `inventoryService.ts` from the three inventory modals and `pages/inventory/index.tsx`
5. Extract `authService.ts` from `MainLayout`
6. Move `fetchCategorizedItems.ts` into `itemService.ts`
7. Ensure all service functions use `fetchWithRetry` instead of bare `fetch`
8. Delete `src/components/utils/fetchCategorizedItems.ts` once absorbed
