import {useState} from 'react';
import {t} from '@lingui/macro';
import {Button, FileInput, Select, Stack, Switch, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {Modal} from '../../../common/Modal';
import {ColouringPage, ColouringPageAgeGroup, ColouringPageTint, IdParam} from '../../../../types.ts';
import {useCreateColouringPage} from '../../../../mutations/useCreateColouringPage.ts';
import {useUpdateColouringPage} from '../../../../mutations/useUpdateColouringPage.ts';
import {useFormErrorResponseHandler} from '../../../../hooks/useFormErrorResponseHandler.tsx';
import {showError, showSuccess} from '../../../../utilites/notifications.tsx';
import {getColouringAgeGroups, getColouringTints} from '../../../../utilites/colouringPages.ts';
import {renderPdfThumbnail} from '../../../../utilites/pdfThumbnail.ts';

interface ColouringPageModalProps {
    organizerId: IdParam;
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

export const ColouringPageModal = ({organizerId, page, onClose}: ColouringPageModalProps) => {
    const [isPreparingFiles, setIsPreparingFiles] = useState(false);
    const createMutation = useCreateColouringPage(organizerId);
    const updateMutation = useUpdateColouringPage(organizerId);
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
            const thumbnail = await renderPdfThumbnail(values.pdf as File);
            createMutation.mutate({...details, pdf: values.pdf as File, thumbnail}, {
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
                        data-testid="colouring-page-submit-button"
                    >
                        {page ? t`Save changes` : t`Upload`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
