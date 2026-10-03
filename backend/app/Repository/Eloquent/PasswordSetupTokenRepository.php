<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\PasswordSetupTokenDomainObject;
use HiEvents\Models\PasswordSetupToken;
use HiEvents\Repository\Interfaces\PasswordSetupTokenRepositoryInterface;

/**
 * @extends BaseRepository<PasswordSetupTokenDomainObject>
 */
class PasswordSetupTokenRepository extends BaseRepository implements PasswordSetupTokenRepositoryInterface
{
    protected function getModel(): string
    {
        return PasswordSetupToken::class;
    }

    public function getDomainObject(): string
    {
        return PasswordSetupTokenDomainObject::class;
    }
}
