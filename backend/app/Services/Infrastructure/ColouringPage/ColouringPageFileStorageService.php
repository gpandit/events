<?php

declare(strict_types=1);

namespace HiEvents\Services\Infrastructure\ColouringPage;

use HiEvents\Exceptions\CouldNotStoreColouringPageFilesException;
use HiEvents\Services\Infrastructure\ColouringPage\DTO\ColouringPageFilesDTO;
use Illuminate\Config\Repository;
use Illuminate\Filesystem\FilesystemManager;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ColouringPageFileStorageService
{
    private const DIRECTORY = 'colouring-pages';

    public function __construct(
        private readonly FilesystemManager $filesystemManager,
        private readonly Repository $config,
    ) {}

    /**
     * @throws CouldNotStoreColouringPageFilesException
     */
    public function store(UploadedFile $pdf, UploadedFile $thumbnail, string $title): ColouringPageFilesDTO
    {
        $baseName = Str::slug($title).'-'.Str::random(8);
        $pdfPath = $this->putFile($pdf, $baseName.'.pdf');

        try {
            $thumbnailPath = $this->putFile($thumbnail, $baseName.'.'.$thumbnail->extension());
        } catch (CouldNotStoreColouringPageFilesException $exception) {
            $this->delete($pdfPath);

            throw $exception;
        }

        return new ColouringPageFilesDTO(
            pdf_path: $pdfPath,
            thumbnail_path: $thumbnailPath,
        );
    }

    public function delete(string ...$paths): void
    {
        $this->filesystemManager->disk($this->config->get('filesystems.public'))->delete($paths);
    }

    /**
     * @throws CouldNotStoreColouringPageFilesException
     */
    private function putFile(UploadedFile $file, string $name): string
    {
        $path = $this->filesystemManager->disk($this->config->get('filesystems.public'))->putFileAs(
            path: self::DIRECTORY,
            file: $file,
            name: $name,
            options: ['visibility' => 'public'],
        );

        if ($path === false) {
            throw new CouldNotStoreColouringPageFilesException(__('Could not upload the colouring page files'));
        }

        return $path;
    }
}
