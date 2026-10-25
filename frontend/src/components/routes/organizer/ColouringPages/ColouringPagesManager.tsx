import {useState} from 'react';
import {t} from '@lingui/macro';
import {ActionIcon, Badge, Button, Group, Image, SegmentedControl, Stack, Table, Text, Tooltip} from '@mantine/core';
import {modals} from '@mantine/modals';
import {IconArrowDown, IconArrowUp, IconDownload, IconPencil, IconPlus, IconTrash} from '@tabler/icons-react';
import {Card} from '../../../common/Card';
import {TableSkeleton} from '../../../common/TableSkeleton';
import {ColouringPage, ColouringPageAgeGroup} from '../../../../types.ts';
import {ColouringPageScope, SHARED_COLOURING_PAGES} from '../../../../api/colouring-page.client.ts';
import {useGetColouringPages} from '../../../../queries/useGetColouringPages.ts';
import {useDeleteColouringPage} from '../../../../mutations/useDeleteColouringPage.ts';
import {useReorderColouringPages} from '../../../../mutations/useReorderColouringPages.ts';
import {showError, showSuccess} from '../../../../utilites/notifications.tsx';
import {getColouringAgeGroups} from '../../../../utilites/colouringPages.ts';
import {ColouringPageModal} from './ColouringPageModal.tsx';
import {moveWithinAgeGroup} from './colouringPageOrder.ts';

interface ColouringPagesManagerProps {
    scope: ColouringPageScope;
    canManage: boolean;
}

export const ColouringPagesManager = ({scope, canManage}: ColouringPagesManagerProps) => {
    const [ageGroup, setAgeGroup] = useState<ColouringPageAgeGroup>('AGE_6_10');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<ColouringPage | undefined>();

    const pagesQuery = useGetColouringPages(scope);
    const deleteMutation = useDeleteColouringPage(scope);
    const reorderMutation = useReorderColouringPages(scope);

    const ageGroups = getColouringAgeGroups();
    const allPages = pagesQuery.data?.data;
    const isEditable = (page: ColouringPage) => canManage && (scope === SHARED_COLOURING_PAGES || !page.is_shared);
    const editablePages = allPages?.filter(isEditable);
    const pages = allPages?.filter((page) => page.age_group === ageGroup);
    const editablePagesInGroup = pages?.filter(isEditable) ?? [];

    const handleMove = (pageId: number, direction: -1 | 1) => {
        const pageIds = moveWithinAgeGroup(editablePages ?? [], pageId, direction);
        if (!pageIds) {
            return;
        }

        reorderMutation.mutate(pageIds, {
            onError: () => showError(t`Something went wrong. Please try again.`),
        });
    };

    const handleDelete = (page: ColouringPage) => {
        const {title} = page;

        modals.openConfirmModal({
            title: t`Delete colouring page`,
            children: <Text size="sm">{t`Delete "${title}"? Parents will no longer be able to download it.`}</Text>,
            labels: {confirm: t`Delete`, cancel: t`Cancel`},
            confirmProps: {color: 'red'},
            onConfirm: () => deleteMutation.mutate(page.id, {
                onSuccess: () => showSuccess(t`Colouring page deleted`),
                onError: () => showError(t`Something went wrong. Please try again.`),
            }),
        });
    };

    return (
        <>
            <Card>
                <Stack gap="md">
                    <Group justify="space-between" wrap="wrap">
                        <SegmentedControl
                            value={ageGroup}
                            onChange={(value) => setAgeGroup(value as ColouringPageAgeGroup)}
                            data={ageGroups.map(({value, label, ages}) => ({value, label: `${label} · ${ages}`}))}
                        />
                        {canManage && (
                            <Button
                                leftSection={<IconPlus size={16}/>}
                                onClick={() => setIsUploadOpen(true)}
                                data-testid="colouring-page-upload-button"
                            >
                                {t`Upload colouring page`}
                            </Button>
                        )}
                    </Group>

                    {scope !== SHARED_COLOURING_PAGES && (
                        <Text size="sm" c="dimmed">
                            {t`Pages marked Shared are provided for every school and appear on your site automatically.`}
                        </Text>
                    )}

                    <TableSkeleton isVisible={!pages}/>

                    {pages && pages.length === 0 && (
                        <Text c="dimmed" ta="center" py="lg">{t`No colouring pages in this age group yet.`}</Text>
                    )}

                    {pages && pages.length > 0 && (
                        <Table verticalSpacing="sm" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t`Preview`}</Table.Th>
                                    <Table.Th>{t`Title`}</Table.Th>
                                    <Table.Th>{t`Status`}</Table.Th>
                                    <Table.Th>{t`Actions`}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {pages.map((page) => (
                                    <Table.Tr key={page.id}>
                                        <Table.Td>
                                            <Image src={page.thumbnail_url} alt={page.title} w={48} h={64} fit="contain"/>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" wrap="nowrap">
                                                {page.title}
                                                {page.is_shared && scope !== SHARED_COLOURING_PAGES && (
                                                    <Badge variant="light" color="blue">{t`Shared`}</Badge>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={page.status === 'PUBLISHED' ? 'green' : 'gray'} variant="light">
                                                {page.status === 'PUBLISHED' ? t`Published` : t`Draft`}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" wrap="nowrap">
                                                {isEditable(page) && (
                                                    <>
                                                <Tooltip label={t`Move up`}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        aria-label={t`Move up`}
                                                        disabled={editablePagesInGroup.indexOf(page) === 0 || reorderMutation.isPending}
                                                        onClick={() => handleMove(page.id, -1)}
                                                    >
                                                        <IconArrowUp size={16}/>
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label={t`Move down`}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        aria-label={t`Move down`}
                                                        disabled={editablePagesInGroup.indexOf(page) === editablePagesInGroup.length - 1 || reorderMutation.isPending}
                                                        onClick={() => handleMove(page.id, 1)}
                                                    >
                                                        <IconArrowDown size={16}/>
                                                    </ActionIcon>
                                                </Tooltip>
                                                    </>
                                                )}
                                                <Tooltip label={t`Download PDF`}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        component="a"
                                                        href={page.pdf_url}
                                                        target="_blank"
                                                        aria-label={t`Download PDF`}
                                                    >
                                                        <IconDownload size={16}/>
                                                    </ActionIcon>
                                                </Tooltip>
                                                {isEditable(page) && (
                                                    <>
                                                <Tooltip label={t`Edit`}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        aria-label={t`Edit`}
                                                        onClick={() => setEditingPage(page)}
                                                        data-testid="colouring-page-edit-button"
                                                    >
                                                        <IconPencil size={16}/>
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label={t`Delete`}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        aria-label={t`Delete`}
                                                        onClick={() => handleDelete(page)}
                                                    >
                                                        <IconTrash size={16}/>
                                                    </ActionIcon>
                                                </Tooltip>
                                                    </>
                                                )}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Stack>
            </Card>

            {isUploadOpen && (
                <ColouringPageModal scope={scope} onClose={() => setIsUploadOpen(false)}/>
            )}
            {editingPage && (
                <ColouringPageModal scope={scope} page={editingPage} onClose={() => setEditingPage(undefined)}/>
            )}
        </>
    );
};
