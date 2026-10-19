<?php

namespace HiEvents\Services\Domain\Shop;

use HiEvents\DomainObjects\Enums\CollectionStatus;
use HiEvents\DomainObjects\Enums\QuestionBelongsTo;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrderItemDomainObject;
use HiEvents\DomainObjects\QuestionAndAnswerViewDomainObject;
use HiEvents\Services\Domain\Shop\DTO\ShopPickListRowDTO;

class ShopOrderDetailsService
{
    public function toPickListRow(OrderDomainObject $order): ShopPickListRowDTO
    {
        $answers = $this->orderAnswers($order);

        return new ShopPickListRowDTO(
            order_id: $order->getId(),
            order_public_id: $order->getPublicId(),
            student_name: $answers[0]['answer'] ?? trim($order->getFirstName().' '.$order->getLastName()),
            answers: $answers,
            buyer_name: trim($order->getFirstName().' '.$order->getLastName()),
            buyer_email: $order->getEmail(),
            collection_status: $order->getCollectionStatus() ?? CollectionStatus::PENDING->value,
            items: $order->getOrderItems()
                ?->map(static fn (OrderItemDomainObject $item) => [
                    'name' => $item->getItemName(),
                    'quantity' => $item->getQuantity(),
                ])
                ->values()
                ->all() ?? [],
        );
    }

    public function studentName(OrderDomainObject $order): string
    {
        return $this->toPickListRow($order)->student_name;
    }

    /**
     * @return array<int, array{title: string, answer: string}>
     */
    private function orderAnswers(OrderDomainObject $order): array
    {
        return $order->getQuestionAndAnswerViews()
            ?->filter(static fn (QuestionAndAnswerViewDomainObject $view) => $view->getBelongsTo() === QuestionBelongsTo::ORDER->name)
            ->sortBy(static fn (QuestionAndAnswerViewDomainObject $view) => $view->getQuestionId())
            ->map(static fn (QuestionAndAnswerViewDomainObject $view) => [
                'title' => $view->getTitle(),
                'answer' => is_array($view->getAnswer()) ? implode(', ', $view->getAnswer()) : (string) $view->getAnswer(),
            ])
            ->values()
            ->all() ?? [];
    }
}
