# Transaction Data Model: Schema and Procedure History

This document records the evolution of transaction, resident, unit, and building relationships in the Plymouth Housing inventory application. It explains why the `Transactions` table contains a `building_id` column even though checkout history has historically obtained building information through a resident's current unit.

**Scope:** Architecture and historical context, not instructions for applying schema changes. For database setup and deployment procedures, see [Database Setup](database-setup.md) and [Schema Migration](schema-migration.md).

## Data relationships

The resident-based checkout history design uses the following relationship:

```text
Transactions.resident_id
    -> Residents.id
         -> Residents.unit_id
              -> Units.id
                   -> Units.building_id
                        -> Buildings.id
```

- `Transactions.resident_id` associates a checkout record with a resident.
- `Residents.unit_id` identifies the resident's **current recorded unit**.
- `Units.building_id` identifies the building containing that unit.
- `Transactions.building_id` is a separate, nullable column retained from an earlier transaction design. Its presence does not mean it is populated for every transaction or used by checkout history queries.

This relationship provides a way to retrieve a resident's *current* location. It does not, on its own, preserve the resident's location at the time of each transaction.

## Evolution of the schema and procedures

### January 21, 2025: Building associated with checkout transactions

**Commit:** [`026f6332` — Add Building to transactions schema](https://github.com/digitalaidseattle/plymouth-housing/commit/026f6332)

The change added a required `building_id` column to `Transactions`:

```sql
building_id INT NOT NULL
```

At the time, `ProcessCheckout` accepted a `@building_code` parameter, resolved it to `Buildings.id`, and passed that ID to `LogTransaction`:

```sql
SELECT @building_id = id
FROM Buildings
WHERE code = @building_code;

-- During the checkout transaction logging call:
@building_id = @building_id
```

`LogTransaction` then inserted the supplied ID into `Transactions.building_id`. The transaction therefore carried the building associated with the **checkout request**, rather than deriving it from a resident relationship. The original logging procedure did not yet use the later `resident_id` parameter.

The stored building may have been useful for building-scoped transaction records, but it should not automatically be interpreted as a resident's historical home building; those are different concepts.

### July 16, 2025: Transition to resident-linked transactions

**Commit:** [`cc83eaa1` — Implement appliance tracker](https://github.com/digitalaidseattle/plymouth-housing/commit/cc83eaa1)

As part of the resident and appliance-tracking implementation, the schema changed to reference a resident directly:

```diff
 CREATE TABLE Transactions (
     id UNIQUEIDENTIFIER PRIMARY KEY,
     user_id INT NOT NULL,
+    resident_id INT,
     transaction_type INT NOT NULL,
     transaction_date DATETIME DEFAULT GETDATE() NOT NULL,
     building_id INT,
-    unit_number NVARCHAR(10),
-    resident_name NVARCHAR(50),
 );
```

The same commit changed `LogTransaction` from accepting separate location and resident-name fields to accepting a resident ID:

```diff
-@building_id INT = NULL,
-@unit_number NVARCHAR(10) = NULL,
-@resident_name NVARCHAR(50) = NULL,
+@resident_id INT,
```

Its insert statement was changed accordingly to write `resident_id` instead of `building_id`, `unit_number`, and `resident_name`.

**Outcome:** Transaction logging became resident-linked. The schema **retained** the nullable `Transactions.building_id` column, but that version of `LogTransaction` no longer populated it. The Git diff establishes what changed, not why the existing building column was retained.

### Later resident-based checkout history behavior

In the checkout history implementation reviewed after that refactor, procedures resolve a transaction's displayed unit and building by joining through the resident's current unit.

For example, the history query joins along these lines:

```sql
INNER JOIN Residents
    ON Transactions.resident_id = Residents.id
INNER JOIN Units
    ON Residents.unit_id = Units.id
INNER JOIN Buildings
    ON Units.building_id = Buildings.id
```

The relevant procedures include:

- [`GetCheckoutHistory`](../database/procedures/get_checkout_history.sql): derives the building returned with checkout history from `Units.building_id`.
- [`GetTransaction`](../database/procedures/get_transaction.sql): obtains unit and building details through the resident relationship.
- [`GetCheckoutItemTotals`](../database/procedures/get_checkout_item_totals.sql): uses a resident-linked building relationship for building-scoped reporting.
- [`LogTransaction`](../database/procedures/log_transaction.sql): in the resident-linked baseline reviewed, recorded the resident ID without explicitly inserting a building ID.

The frontend can receive and filter on a response field named `building_id` without that value originating from the physical `Transactions.building_id` column. For example, `Buildings.id AS building_id` in a stored procedure returns the ID from the joined `Buildings` table.

These observations describe the inspected checkout path. They do **not** establish that `Transactions.building_id` is unused by every possible database operation or historical dataset.

## Current location versus historical location

Consider this example:

1. A resident checks out supplies while assigned to Unit 101 in Building A.
2. The resident's `Residents.unit_id` is later updated to Unit 205 in Building B.
3. A checkout-history query that joins through `Residents.unit_id` now returns Unit 205 and Building B for that resident's earlier checkout.

This is expected from a model that resolves location through the **current resident record**. The earlier transaction still references the same resident, but the joined location is not an immutable historical record.

Three concepts should be kept distinct:

| Concept | Meaning | Possible data source |
| --- | --- | --- |
| Current residential location | Where the resident is presently recorded as living | `Residents.unit_id` and `Units.building_id` |
| Checkout-associated building | Which building was supplied for the checkout event | Earlier `Transactions.building_id` logging design |
| Historical residential location | Where the resident lived when an earlier event occurred | A separately maintained resident history or an explicitly designed historical snapshot |

Those locations may coincide, but they are not necessarily interchangeable.

## Design considerations for future changes

The existing resident-linked model is appropriate when the inventory application needs to associate a transaction with a resident and display that resident's current recorded location. Historical resident-location tracking is handled separately from this inventory application's transaction data.

If a future requirement calls for historically accurate location *within transaction reports*, the team should first define **which** location it needs (checkout-associated building or historical residence). Possible implementations include:

- **Transaction-level snapshot:** Save location identifiers when logging the transaction. This captures an event-time value but requires coordinated insert logic and a strategy for existing records with missing snapshots.
- **Effective-dated resident location history:** Store resident location assignments with date ranges and resolve location as of the transaction date. This centralizes historical location information but requires reliable change history and more complex queries.

These are architectural options, **not** existing guarantees of the resident-linked history query. Do not infer accurate historical locations for legacy transactions solely from a resident's current unit.

Before removing or repurposing `Transactions.building_id`, review all procedures, related API consumers, non-checkout transaction paths, indexes, and existing data. The column originated in a different checkout model and may still have dependencies beyond the history queries examined here.

## Source references

**Git history**

- [`026f6332`: Add Building to transactions schema (January 21, 2025)](https://github.com/digitalaidseattle/plymouth-housing/commit/026f6332)
- [`cc83eaa1`: Implement appliance tracker (July 16, 2025)](https://github.com/digitalaidseattle/plymouth-housing/commit/cc83eaa1)

**Repository files**

- [`database/tables/transaction.sql`](../database/tables/transaction.sql)
- [`database/procedures/log_transaction.sql`](../database/procedures/log_transaction.sql)
- [`database/procedures/process_checkout.sql`](../database/procedures/process_checkout.sql)
- [`database/procedures/process_welcome_basket_checkout.sql`](../database/procedures/process_welcome_basket_checkout.sql)
- [`database/procedures/get_checkout_history.sql`](../database/procedures/get_checkout_history.sql)
- [`database/procedures/get_transaction.sql`](../database/procedures/get_transaction.sql)
- [`database/procedures/get_checkout_item_totals.sql`](../database/procedures/get_checkout_item_totals.sql)

> **Note:** File links point to their locations in the repository. Their contents may evolve; use the linked commits to inspect the exact historical implementations.