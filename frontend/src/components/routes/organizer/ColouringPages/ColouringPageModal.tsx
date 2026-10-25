import {useEffect, useState} from 'react';
import {t} from '@lingui/macro';
import {Button, FileInput, Group, Image, Loader, Select, Stack, Switch, Text, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {Modal} from '../../../common/Modal';
import {ColouringPage, ColouringPageAgeGroup, ColouringPageTint} from '../../../../types.ts';
import {ColouringPageScope} from '../../../../api/colouring-page.client.ts';
import {useCreateColouringPage} from '../../../../mutations/useCreateColouringPage.ts';
import {useUpdateColouringPage} from '../../../../mutations/useUpdateColouringPage.ts';
import {useFormErrorResponseHandler} from '../../../../hooks/useFormErrorResponseHandler.tsx';
import {showError, showSuccess} from '../../../../utilites/notifications.tsx';
import {getColouringAgeGroups, getColouringTints} from '../../../../utilites/colouringPages.ts';
import {renderPdfThumbnail} from '../../../../utilites/pdfThumbnail.ts';
import {ColourByNumber, createColourByNumber} from '../../../../utilites/colourByNumber';

interface ColouringPageModalProps {
    scope: ColouringPageScope;
    page?: ColouringPage;
    onClose: () => void;
}

interface ColouringPageFormValues {
    title: string;
    age_group: ColouringPageAgeGroup;
    tint: ColouringPageTint;
    publish: boolean;
    pdf: File | null;
}

const titleFromFilename = (filename: string) => filename.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();

export const ColouringPageModal = ({scope, page, onClose}: ColouringPageModalProps) => {
    const [isPreparingFiles, setIsPreparingFiles] = useState(false);
    const [wantsColourByNumber, setWantsColourByNumber] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [colourByNumber, setColourByNumber] = useState<ColourByNumber | null>(null);
    const createMutation = useCreateColouringPage(scope);
    const updateMutation = useUpdateColouringPage(scope);
    const errorHandler = useFormErrorResponseHandler();

    const form = useForm<ColouringPageFormValues>({
        initialValues: {
            title: page?.title ?? '',
            age_group: page?.age_group ?? 'AGE_6_10',
            tint: page?.tint ?? 'PEACH',
            publish: page ? page.status === 'PUBLISHED' : true,
            pdf: null,
        },
        validate: {
            title: (value) => value.trim() ? null : t`Title is required`,
            pdf: (value) => page || value ? null : t`Choose a PDF file`,
        },
    });

    const sourcePdf = form.values.pdf;

    useEffect(() => {
        setColourByNumber(null);
        if (!wantsColourByNumber || !sourcePdf) {
            setIsConverting(false);
            return;
        }

        let isCurrent = true;
        setIsConverting(true);
        createColourByNumber(sourcePdf)
            .then((result) => isCurrent && setColourByNumber(result))
            .catch(() => {
                if (isCurrent) {
                    showError(t`We could not create the colour-by-number version. Please check the PDF and try again.`);
                    setWantsColourByNumber(false);
                }
            })
            .finally(() => isCurrent && setIsConverting(false));

        return () => {
            isCurrent = false;
        };
    }, [wantsColourByNumber, sourcePdf]);

    const handlePdfChange = (file: File | null) => {
        form.setFieldValue('pdf', file);
        if (file && !form.values.title) {
            form.setFieldValue('title', titleFromFilename(file.name));
        }
    };

    const handleSubmit = form.onSubmit(async (values) => {
        const details = {
            title: values.title,
            age_group: values.age_group,
            tint: values.tint,
            status: values.publish ? 'PUBLISHED' as const : 'DRAFT' as const,
        };

        if (page) {
            updateMutation.mutate({pageId: page.id, details}, {
                onSuccess: () => {
                    showSuccess(t`Colouring page updated`);
                    onClose();
                },
                onError: (error) => errorHandler(form, error),
            });
            return;
        }

        setIsPreparingFiles(true);
        try {
            const files = colourByNumber
                ? {pdf: colourByNumber.pdf, thumbnail: colourByNumber.thumbnail}
                : {pdf: values.pdf as File, thumbnail: await renderPdfThumbnail(values.pdf as File)};
            createMutation.mutate({...details, ...files}, {
                onSuccess: () => {
                    showSuccess(t`Colouring page uploaded`);
                    onClose();
                },
                onError: (error) => errorHandler(form, error),
            });
        } catch {
            showError(t`We could not read that PDF. Please check the file and try again.`);
        } finally {
            setIsPreparingFiles(false);
        }
    });

    const ageGroupOptions = getColouringAgeGroups().map(({value, label, ages}) => ({value, label: `${label} (${ages})`}));

    return (
        <Modal opened onClose={onClose} heading={page ? t`Edit colouring page` : t`Upload colouring page`}>
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {!page && (
                        <FileInput
                            label={t`PDF file`}
                            description={t`Up to 10 MB. The first page becomes the thumbnail.`}
                            accept="application/pdf"
                            required
                            data-testid="colouring-page-pdf-input"
                            {...form.getInputProps('pdf')}
                            onChange={handlePdfChange}
                        />
                    )}
                    {!page && (
                        <>
                            <Switch
                                label={t`Make a colour-by-number version`}
                                description={t`Numbers each area of a line-art page and adds a colour key and a finished-picture page. Colours are chosen automatically.`}
                                checked={wantsColourByNumber}
                                disabled={!sourcePdf}
                                onChange={(event) => setWantsColourByNumber(event.currentTarget.checked)}
                                data-testid="colouring-page-colour-by-number-switch"
                            />
                            {isConverting && (
                                <Group gap="xs">
                                    <Loader size="sm"/>
                                    <Text size="sm">{t`Creating the colour-by-number page…`}</Text>
                                </Group>
                            )}
                            {colourByNumber && (
                                <Image
                                    src={colourByNumber.previewUrl}
                                    alt={t`Colour-by-number preview`}
                                    mah={360}
                                    fit="contain"
                                    data-testid="colouring-page-colour-by-number-preview"
                                />
                            )}
                        </>
                    )}
                    <TextInput label={t`Title`} required {...form.getInputProps('title')}/>
                    <Select
                        label={t`Age group`}
                        data={ageGroupOptions}
                        allowDeselect={false}
                        {...form.getInputProps('age_group')}
                    />
                    <Select
                        label={t`Tile colour`}
                        data={getColouringTints()}
                        allowDeselect={false}
                        {...form.getInputProps('tint')}
                    />
                    <Switch
                        label={t`Show on the website`}
                        {...form.getInputProps('publish', {type: 'checkbox'})}
                    />
                    <Button
                        type="submit"
                        loading={isPreparingFiles || createMutation.isPending || updateMutation.isPending}
                        disabled={isConverting}
                        data-testid="colouring-page-submit-button"
                    >
                        {page ? t`Save changes` : t`Upload`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
