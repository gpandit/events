<?php

namespace HiEvents\DomainObjects\Enums;

enum ProductTerminology
{
    case TICKETS;
    case CLASSES;
    case REGISTRATIONS;
    case BOOKINGS;
    case PASSES;
    case SHOP;

    public static function forCategory(?string $category): self
    {
        if ($category === null) {
            return self::TICKETS;
        }

        return EventCategory::tryFrom($category)?->terminology() ?? self::TICKETS;
    }

    public function defaultProductCategoryName(): string
    {
        return match ($this) {
            self::TICKETS, self::BOOKINGS => __('Tickets'),
            self::CLASSES => __('Classes'),
            self::REGISTRATIONS => __('Registration'),
            self::PASSES => __('Passes'),
            self::SHOP => __('Items'),
        };
    }

    public function defaultNoProductsMessage(): string
    {
        return match ($this) {
            self::TICKETS, self::BOOKINGS => __('There are no tickets available for this event'),
            self::CLASSES => __('There are no classes available for this event'),
            self::REGISTRATIONS => __('Registration is not open for this event'),
            self::PASSES => __('There are no passes available for this event'),
            self::SHOP => __('There are no items available in this shop'),
        };
    }

    public function defaultContinueButtonText(): string
    {
        return match ($this) {
            self::TICKETS, self::SHOP => __('Continue'),
            self::CLASSES, self::BOOKINGS => __('Book Now'),
            self::REGISTRATIONS, self::PASSES => __('Register'),
        };
    }

    public function defaultGetTicketsButtonText(): ?string
    {
        return match ($this) {
            self::TICKETS => null,
            self::CLASSES, self::BOOKINGS => __('Book Now'),
            self::REGISTRATIONS => __('Register'),
            self::PASSES => __('Get Passes'),
            self::SHOP => __('Buy now'),
        };
    }
}
