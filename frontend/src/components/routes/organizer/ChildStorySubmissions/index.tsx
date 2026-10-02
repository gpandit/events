import {useState} from 'react';
import {useParams} from 'react-router';
import {t} from '@lingui/macro';
import {Badge, Button, Group, SegmentedControl, Stack, Table, Text} from '@mantine/core';
import {IconCheck, IconX} from '@tabler/icons-react';
import {PageBody} from '../../../common/PageBody';
import {PageTitle} from '../../../common/PageTitle';
import {Card} from '../../../common/Card';
import {TableSkeleton} from '../../../common/TableSkeleton';
import {IdParam, ChildStorySubmissionStatus} from '../../../../types.ts';
import {useGetChildStorySubmissions} from '../../../../queries/useGetChildStorySubmissions.ts';
import {useReviewChildStorySubmission} from '../../../../mutations/useReviewChildStorySubmission.ts';
import {showError, showSuccess} from '../../../../utilites/notifications.tsx';

const STATUS_FILTERS: { value: ChildStorySubmissionStatus; label: string }[] = [
    {value: 'PENDING', label: t`Pending`},
    {value: 'APPROVED', label: t`Approved`},
    {value: 'REJECTED', label: t`Rejected`},
];

export default function ChildStorySubmissions() {
    const {organizerId} = useParams();
    const [status, setStatus] = useState<ChildStorySubmissionStatus>('PENDING');

    const submissionsQuery = useGetChildStorySubmissions(organizerId as IdParam, status);
    const submissions = submissionsQuery.data?.data;
    const reviewMutation = useReviewChildStorySubmission(organizerId as IdParam);

    const handleReview = (submissionId: IdParam, newStatus: ChildStorySubmissionStatus) => {
        reviewMutation.mutate({submissionId, status: newStatus}, {
            onSuccess: () => {
                showSuccess(newStatus === 'APPROVED' ? t`Story published` : t`Story rejected`);
            },
            onError: () => {
                showError(t`Something went wrong. Please try again.`);
            },
        });
    };

    return (
        <PageBody>
            <PageTitle>{t`Story Submissions`}</PageTitle>
            <Card>
                <Stack gap="md">
                    <SegmentedControl
                        value={status}
                        onChange={(value) => setStatus(value as ChildStorySubmissionStatus)}
                        data={STATUS_FILTERS.map(({value, label}) => ({value, label}))}
                    />

                    <TableSkeleton isVisible={!submissions}/>

                    {submissions && submissions.length === 0 && (
                        <Text c="dimmed" ta="center" py="lg">{t`No submissions here yet.`}</Text>
                    )}

                    {submissions && submissions.length > 0 && (
                        <Table verticalSpacing="sm" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t`Type`}</Table.Th>
                                    <Table.Th>{t`Name`}</Table.Th>
                                    <Table.Th>{t`Year group`}</Table.Th>
                                    <Table.Th>{t`Submitted`}</Table.Th>
                                    <Table.Th>{t`Content`}</Table.Th>
                                    {status === 'PENDING' && <Table.Th>{t`Actions`}</Table.Th>}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {submissions.map((submission) => (
                                    <Table.Tr key={submission.id}>
                                        <Table.Td>
                                            <Badge variant="light">
                                                {submission.type === 'POEM' ? t`Poem` : t`Story`}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{submission.first_name} {submission.last_name}</Table.Td>
                                        <Table.Td>{submission.year_group}</Table.Td>
                                        <Table.Td>{new Date(submission.submitted_at).toLocaleDateString()}</Table.Td>
                                        <Table.Td>
                                            <Text size="sm" lineClamp={2} maw={320}>{submission.content}</Text>
                                        </Table.Td>
                                        {status === 'PENDING' && (
                                            <Table.Td>
                                                <Group gap="xs" wrap="nowrap">
                                                    <Button
                                                        size="xs"
                                                        color="green"
                                                        leftSection={<IconCheck size={14}/>}
                                                        loading={reviewMutation.isPending}
                                                        onClick={() => handleReview(submission.id, 'APPROVED')}
                                                    >
                                                        {t`Approve`}
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        color="red"
                                                        variant="light"
                                                        leftSection={<IconX size={14}/>}
                                                        loading={reviewMutation.isPending}
                                                        onClick={() => handleReview(submission.id, 'REJECTED')}
                                                    >
                                                        {t`Reject`}
                                                    </Button>
                                                </Group>
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Stack>
            </Card>
        </PageBody>
    );
}
