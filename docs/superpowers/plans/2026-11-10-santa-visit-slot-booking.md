# Santa Visit Slot Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let logged-in parents book 5-minute Santa Grotto slots on a single recurring event (one occurrence per slot), with staff booking, one-active-slot swap, and an event-wide waitlist.

**Architecture:** One recurring event; a slot generator creates one occurrence per slot plus a free product. A `slot_booking_configs` row marks the event as slot-booked. Parent identity is the existing customer lookup token (`X-Customer-Token`). Booking/swap runs in one DB transaction under `SeatingEventLockService::lock`, reusing `CreateOrderHandler`, `CompleteOrderHandler`, `OrderCancelService`. Waitlist reuses `CreateWaitlistEntryService` with `event_occurrence_id = null`.

**Tech Stack:** Laravel 11 / PHP 8.3, Spatie Laravel Data, PostgreSQL, React + Mantine + React Query, Lingui, Playwright.

## Global Constraints

- No explanatory comments in code (CLAUDE.md hard rule).
- Actions extend `BaseAction`, use `resourceResponse()/jsonResponse()/errorResponse()` only; `isActionAuthorized` for non-public endpoints.
- Request flow Action → Handler → Domain Service → Repository; no Eloquent outside repositories.
- DTOs extend `BaseDataObject`; custom exceptions only (never `InvalidArgumentException`/`RuntimeException`).
- Wrap user-facing strings in `__()` (backend) / `t` or `Trans` (frontend); add translations for all languages.
- Unit tests in `backend/tests/Unit` are DB-free; DB tests go in `backend/tests/Feature` with `DatabaseTransactions`.
- Public throttle routes must be named, e.g. `throttle:10,1,public-santa-book`.
- Defaults: date 2026-12-10, 18:00–22:00, 5-minute slots, 1 child per slot; slot length 1–240 and must divide the window; children per slot 1–50.
- Booking and waitlist require a valid customer lookup token; one active slot per customer per event.

---

### Task 1: Slot window calculator

**Files:**
- Create: `backend/app/Exceptions/InvalidSlotConfigurationException.php`
- Create: `backend/app/Services/Domain/EventOccurrence/SlotWindowCalculator.php`
- Test: `backend/tests/Unit/Services/Domain/EventOccurrence/SlotWindowCalculatorTest.php`

**Interfaces:**
- Produces: `SlotWindowCalculator::slots(string $date, string $startTime, string $endTime, int $slotMinutes, string $timezone): array` returning `list<array{start: CarbonImmutable, end: CarbonImmutable}>` (UTC-agnostic, in the given timezone); throws `InvalidSlotConfigurationException`.

- [ ] Write failing tests: 48 slots for 18:00–22:00/5; first starts 18:00, last ends 22:00; 18:00–18:10/3 throws; end before start throws; slot 0 and 241 throw.
- [ ] Run `php artisan test --filter=SlotWindowCalculatorTest` → FAIL (class missing).
- [ ] Implement calculator: parse `"$date $startTime"` in `$timezone`, compute window minutes, validate (`end > start`, `1 <= slotMinutes <= 240`, `window % slotMinutes === 0`), loop `addMinutes`.
- [ ] Re-run → PASS. Commit `feat: slot window calculator`.

### Task 2: Slot generator (config table, service, action)

**Files:**
- Create: migration `backend/database/migrations/2026_11_10_000000_create_slot_booking_configs_table.php` (`id`, `event_id` unique FK cascade, `product_id` FK, `slot_minutes`, `children_per_slot`, timestamps)
- Create: `backend/app/Services/Domain/EventOccurrence/SlotGeneratorService.php`
- Create: `backend/app/Services/Application/Handlers/EventOccurrence/GenerateSlotsHandler.php` + `DTO/GenerateSlotsDTO.php`
- Create: `backend/app/Http/Request/EventOccurrence/GenerateSlotsRequest.php`, `backend/app/Http/Actions/EventOccurrences/GenerateSlotsAction.php`
- Modify: `backend/routes/api.php` (`POST /events/{event_id}/occurrences/generate-slots`)
- Test: Feature `backend/tests/Feature/EventOccurrence/GenerateSlotsTest.php`

**Interfaces:**
- Consumes: `SlotWindowCalculator::slots`, `EventOccurrenceRepositoryInterface::insert/findWhere`
- Produces: `SlotGeneratorService::generate(EventDomainObject $event, GenerateSlotsDTO $dto): int` (number created); idempotent by start time; creates free `Santa Visit` product with `max_per_order = children_per_slot`; upserts config row.

- [ ] Write failing feature test (48 occurrences, capacity = children_per_slot, rerun creates 0, bad window → 422).
- [ ] Run migration, `php artisan generate-domain-objects`, implement, make pass. Commit.

### Task 3: Customer token + book/swap

**Files:**
- Create: `backend/app/Services/Domain/Customer/CustomerTokenResolver.php` (`resolve(Request): CustomerDomainObject`, throws `InvalidTicketLookupTokenException` → 401)
- Create: `backend/app/Services/Domain/SlotBooking/ActiveSlotBookingFinder.php` (`findActiveOrder(int $eventId, string $email): ?OrderDomainObject`)
- Create: `backend/app/Services/Domain/SlotBooking/BookSlotService.php` (`book(BookSlotDTO): OrderDomainObject`, one transaction; `replace=false` + existing → `SlotAlreadyBookedException`; `replace=true` cancels old order via `OrderCancelService::cancelOrder`, re-checks capacity, creates+completes new order, rolls back on `SlotFullException`)
- Create: `backend/app/Http/Actions/SlotBooking/BookSlotActionPublic.php`; route `POST /public/events/{event_id}/slot-bookings` (`throttle:10,1,public-slot-book`)
- Tests: Unit `BookSlotServiceTest` (mocks), Feature `BookSlotTest`

- [ ] Tests first: unauthenticated 401; second booking without `replace` 409; replace swaps; full target rolls back and keeps old booking.
- [ ] Implement, pass, commit.

### Task 4: Waitlist gate and staff booking

**Files:**
- Create: `backend/app/Services/Domain/SlotBooking/SlotWaitlistService.php` (`join(CustomerDomainObject, int $eventId)`: reject with `SlotsStillAvailableException` if any future active occurrence has room; reject if customer holds a slot or already waiting; call `CreateWaitlistEntryService::createEntry` with null occurrence)
- Create: `backend/app/Http/Actions/SlotBooking/JoinSlotWaitlistActionPublic.php`; route `POST /public/events/{event_id}/slot-waitlist`
- Create: `backend/app/Services/Domain/SlotBooking/StaffBookFamilyService.php`, `backend/app/Http/Actions/SlotBooking/StaffBookFamilyAction.php`; route `POST /events/{event_id}/slot-bookings` (authorized)
- Tests: Unit + Feature for each rule in the spec

- [ ] Tests first, implement, pass, commit.

### Task 5: Frontend, translations, E2E

**Files:**
- Modify/Create under `frontend/src/components/routes/event/OccurrencesTab/` (generate-slots drawer), `frontend/src/api/slot-booking.client.ts`, `frontend/src/mutations/useBookSlot.ts`, `useJoinSlotWaitlist.ts`, `useStaffBookFamily.ts`, public slot-picker component with login prompt, staff "Book a family" modal
- Translations for all supported languages (use `/translations` workflow); `data-testid`s per CLAUDE.md
- E2E: `e2e/tests/santa-visit.spec.ts`

- [ ] Implement, `npx tsc --noEmit`, extract/compile messages, commit.
