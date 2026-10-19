<?php

namespace Tests\Unit\Services\Domain\Shop;

use HiEvents\DomainObjects\Enums\QuestionBelongsTo;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrderItemDomainObject;
use HiEvents\DomainObjects\QuestionAndAnswerViewDomainObject;
use HiEvents\Services\Domain\Shop\ShopOrderDetailsService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class ShopOrderDetailsServiceTest extends TestCase
{
    private ShopOrderDetailsService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ShopOrderDetailsService;
    }

    public function test_student_name_is_the_answer_to_the_first_order_question(): void
    {
        $order = $this->order([
            $this->answer(12, 'Student class or year', 'Year 5'),
            $this->answer(11, 'Student name', 'Amelia Khan'),
        ]);

        $row = $this->service->toPickListRow($order);

        $this->assertSame('Amelia Khan', $row->student_name);
        $this->assertSame(
            [['title' => 'Student name', 'answer' => 'Amelia Khan'], ['title' => 'Student class or year', 'answer' => 'Year 5']],
            $row->answers,
        );
    }

    public function test_product_level_answers_are_ignored(): void
    {
        $order = $this->order([
            $this->answer(5, 'Size notes', 'Tall', QuestionBelongsTo::PRODUCT->name),
            $this->answer(11, 'Student name', 'Amelia Khan'),
        ]);

        $this->assertSame('Amelia Khan', $this->service->studentName($order));
    }

    public function test_student_name_falls_back_to_the_buyer_when_unanswered(): void
    {
        $this->assertSame('Sara Buyer', $this->service->studentName($this->order([])));
    }

    public function test_pick_list_row_lists_items_and_defaults_to_pending(): void
    {
        $row = $this->service->toPickListRow($this->order([$this->answer(1, 'Student name', 'Amelia Khan')]));

        $this->assertSame('PENDING', $row->collection_status);
        $this->assertSame([['name' => 'Polo shirt - Age 5-6', 'quantity' => 2]], $row->items);
        $this->assertSame('Sara Buyer', $row->buyer_name);
    }

    private function order(array $answers): OrderDomainObject
    {
        return (new OrderDomainObject)
            ->setId(7)
            ->setPublicId('O-ABC123')
            ->setFirstName('Sara')
            ->setLastName('Buyer')
            ->setEmail('sara@example.com')
            ->setQuestionAndAnswerViews(new Collection($answers))
            ->setOrderItems(new Collection([
                (new OrderItemDomainObject)->setItemName('Polo shirt - Age 5-6')->setQuantity(2),
            ]));
    }

    private function answer(int $questionId, string $title, string $answer, string $belongsTo = 'ORDER'): QuestionAndAnswerViewDomainObject
    {
        return (new QuestionAndAnswerViewDomainObject)
            ->setQuestionId($questionId)
            ->setTitle($title)
            ->setAnswer($answer)
            ->setBelongsTo($belongsTo);
    }
}
