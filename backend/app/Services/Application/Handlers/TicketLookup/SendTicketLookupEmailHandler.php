<?php

namespace HiEvents\Services\Application\Handlers\TicketLookup;

use HiEvents\DomainObjects\Generated\OrderDomainObjectAbstract;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Mail\TicketLookup\TicketLookupEmail;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Services\Application\Handlers\TicketLookup\DTO\SendTicketLookupEmailDTO;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Collection;
use Psr\Log\LoggerInterface;
use Throwable;

class SendTicketLookupEmailHandler
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly TicketLookupTokenService $ticketLookupTokenService,
        private readonly Mailer $mailer,
        private readonly LoggerInterface $logger,
        private readonly DatabaseManager $databaseManager,
    ) {}

    /**
     * @throws Throwable
     */
    public function handle(SendTicketLookupEmailDTO $dto): void
    {
        $email = strtolower($dto->email);

        $orders = $this->findOrdersByEmail($email);

        if ($orders->isEmpty()) {
            $this->logger->info('Ticket lookup requested for email with no orders', [
                'email' => $email,
            ]);

            return;
        }

        $orderCount = $orders->count();

        $this->databaseManager->transaction(function () use ($email, $orderCount) {
            $token = $this->ticketLookupTokenService->issue($email);
            $this->sendTicketLookupEmail($email, $token, $orderCount);
        });
    }

    private function findOrdersByEmail(string $email): Collection
    {
        return $this->orderRepository->findWhere(
            [
                [OrderDomainObjectAbstract::EMAIL, '=', $email],
                [OrderDomainObjectAbstract::STATUS, '=', OrderStatus::COMPLETED->name],
            ],
        );
    }

    private function sendTicketLookupEmail(string $email, string $token, int $orderCount): void
    {
        $this->logger->info('Sending ticket lookup email', [
            'email' => $email,
            'order_count' => $orderCount,
        ]);

        $this->mailer
            ->to($email)
            ->queue(new TicketLookupEmail(
                email: $email,
                token: $token,
                orderCount: $orderCount,
            ));
    }
}
