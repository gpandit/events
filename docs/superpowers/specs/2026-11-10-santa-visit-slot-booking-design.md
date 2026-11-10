# Santa Visit slot booking — design

## Goal

Let parents at the Christmas Festive Fair book a Santa Grotto visit for their children in a 5-minute slot on 10 Dec 2026 (18:00–22:00 by default). Staff can also block a slot for a family and hand over a QR ticket.

Built on existing recurring events: one occurrence per slot, free ticket, QR ticket, existing check-in. No payments.

## Components

### 1. Slot generator (staff)

Staff action on a recurring event: "Generate time slots".

| Input | Default | Rules |
|---|---|---|
| Date | 2026-12-10 | Required |
| Start time | 18:00 | HH:MM |
| End time | 22:00 | After start |
| Slot length (minutes) | 5 | 1–240, must divide the window exactly |
| Children per slot | 1 | 1–50 |

- Times are interpreted in the event timezone.
- Creates one occurrence per slot (48 with defaults), each with capacity = children per slot.
- Idempotent: an occurrence already starting at the same time is skipped, not duplicated.
- Invalid input throws a custom `InvalidSlotConfigurationException`, converted to a validation error in the action.
- Ensures the event has one free "Santa Visit" product (no payment step) with max per order = children per slot.
- Per-slot capacity remains editable in the existing occurrence editor.
- New `SlotGeneratorService` in `Services/Domain/EventOccurrence`, called from a handler; occurrences are written through the existing repository.

### 2. Parent booking (logged-in customers only)

- Booking requires an authenticated customer (existing organizer-scoped customer login/register). Anonymous visitors are shown the sign-in/register prompt in place of the slot picker, and the order endpoint rejects unauthenticated requests for Santa Visit events with 401.
- Parent picks an available slot and a number of children (up to remaining capacity and the product limit), and enters a child name for each child (required product question).
- Full slots are shown as sold out.
- Confirmation email carries the QR ticket (existing order email).

### 3. One active slot per parent

- A customer may hold at most one active (COMPLETED, not cancelled) Santa Visit order per event, matched by customer email.
- Booking when one exists requires an explicit "replace my booking" confirmation. The server then, in a single DB transaction: locks the event's slots, cancels the previous order (releasing its capacity), checks the new slot still has room, and creates the new order. If the new slot is full or anything fails, the transaction rolls back and the original booking is kept.
- Without the replace flag, the server rejects the second booking with a clear error naming the existing slot.
- Parents can also cancel their slot from their order page (existing self-service cancel), which frees it.
- Implemented as `ReplaceSantaVisitBookingService` calling the existing order cancel and create services inside `DB::transaction`, under the existing event-level lock ordering.

### 4. Event-wide waitlist (logged-in customers only)

- The waitlist belongs to the Santa Visit event as a whole, not to any slot. Entries are created with no occurrence (`event_occurrence_id = null`) on the existing waitlist.
- A logged-in customer can join only when no slot has room: every non-cancelled future slot is full. If any slot has capacity, the join is rejected and the page shows the slot picker instead of the waitlist button. The server enforces this, not just the UI.
- Join requires login. Name and email come from the customer account. One waitlist entry per customer per event, and a customer who already holds a booked slot cannot join (they swap via section 3 instead).
- When a slot frees (parent cancels, swap, staff cancel), the existing `ProcessWaitlistService` offers it to the first waiting entry by email, with an offer link and expiry. Accepting the offer books that slot and takes the customer off the waitlist. An expired or declined offer passes to the next entry.
- Accepting an offer follows the same one-slot rule and goes through the same transaction and lock as normal booking.
- Parents can leave the waitlist from the existing cancel link.
- Staff can see the waitlist and offer manually using the existing organizer waitlist screens.

### 5. Staff booking

- Event dashboard action "Book a family": slot, child name(s), parent name, optional email.
- Creates a completed free order irrespective of the public sales window; honours capacity under the same lock as parent bookings.
- Staff are not subject to the one-slot rule, since walk-ups have no account. If an email is given and it matches a customer who already holds a slot, the staff form warns and requires confirmation.
- If an email is given, the ticket is emailed; otherwise staff open or print the QR from the attendee page.

### 6. Door check-in

QR tickets scan into the existing check-in list; no new work.

### 7. Grotto as a paid child add-on (supersedes the free-ticket assumption)

- The slot event stays separate from the general admission (GA) event. A slot booking is unlocked by buying the **Grotto add-on** on the GA event.
- Config: `slot_booking_configs` gains nullable `ticket_event_id` (GA event), `grotto_product_id` (the paid add-on on the GA event, tiered: "Grotto + photo", "Grotto + photo magnet") and `child_product_ids` (GA child ticket products). When `ticket_event_id` is null the event stays in free mode (current behaviour).
- Child only: the add-on is linked as an add-on of the child ticket(s) only.
- Purchase flows:
  - Same checkout: the add-on appears under the child ticket (existing add-on UI). Grotto quantity may not exceed the child tickets in the order plus child tickets held in the customer's earlier completed GA orders, minus Grotto tickets already bought.
  - Later: a signed-in customer holding completed child-ticket orders buys the add-on alone in a new order. Order validation accepts the add-on without a parent in the same order when a valid `X-Customer-Token` proves enough unused child tickets (matched by order email).
- Entitlement = Grotto attendees in the customer's completed GA orders (email match). A slot booking may not have more children than purchased Grotto tickets.
- Photo option: the slot product has the same two price labels (free). Each child in a slot booking takes the tier they bought, magnets first, so the check-in list and ticket show photo or magnet.
- Waitlist: joining also requires at least one purchased Grotto ticket.
- Staff booking is not gated by a purchase.
- One visit: one active slot per customer (siblings share it), as in section 3.

## Error handling

- Slot full at confirm time: error, nothing changes (replace flow keeps old booking).
- Concurrent bookings: serialised by the event lock; capacity is re-checked inside the lock.
- Customer deleted or logged out mid-flow: 401, no order created.

## Testing

- Unit: slot arithmetic (defaults, non-dividing window, end before start, idempotent regenerate); replace-booking rules with mocked collaborators.
- Feature: generator creates 48 occurrences with capacity; unauthenticated booking rejected; second booking without replace rejected; replace swaps atomically and rolls back when target is full; staff booking respects capacity.
- Feature (waitlist): join rejected while any slot has room, allowed when all are full, rejected when the customer already holds a slot or is not logged in; freeing a slot offers it to the first entry; accepting the offer books the slot.
- E2E (Playwright): parent logs in, books a slot, swaps to another, old slot becomes available again; with all slots full a second parent joins the waitlist and receives an offer when a slot is cancelled.
- Frontend strings translated for all supported languages.

## Out of scope

Taking payment for the Grotto in the slot flow itself (payment happens on the GA event), per-slot waitlists, SMS reminders, multiple slots per booking, and group/sibling booking across slots.
