<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\Models\Customer;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;

/**
 * @extends BaseRepository<CustomerDomainObject>
 */
class CustomerRepository extends BaseRepository implements CustomerRepositoryInterface
{
    protected function getModel(): string
    {
        return Customer::class;
    }

    public function getDomainObject(): string
    {
        return CustomerDomainObject::class;
    }
}
