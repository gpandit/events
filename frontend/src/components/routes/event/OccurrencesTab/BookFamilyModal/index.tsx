import {t} from "@lingui/macro";
import {ActionIcon, Button, Group, Select, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {useMemo} from "react";
import {useParams} from "react-router";
import {Modal} from "../../../../common/Modal";
import {EventOccurrence, GenericModalProps, SlotChild} from "../../../../../types.ts";
import {useGetEvent} from "../../../../../queries/useGetEvent.ts";
import {useStaffBookFamily} from "../../../../../mutations/useStaffBookFamily.ts";
import {showSuccess} from "../../../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../../../hooks/useFormErrorResponseHandler.tsx";
import {formatDateWithLocale} from "../../../../../utilites/dates.ts";

interface BookFamilyModalProps extends GenericModalProps {
    occurrences: EventOccurrence[];
}

interface BookFamilyFormValues {
    event_occurrence_id: string | null;
    parent_first_name: string;
    parent_last_name: string;
    email: string;
    children: SlotChild[];
}

export const BookFamilyModal = ({onClose, occurrences}: BookFamilyModalProps) => {
    const {eventId} = useParams();
    const {data: event} = useGetEvent(eventId);
    const bookMutation = useStaffBookFamily();
    const errorHandler = useFormErrorResponseHandler();

    const slotOptions = useMemo(
        () => occurrences
            .filter((occurrence) => occurrence.is_active && (occurrence.available_capacity ?? 1) > 0)
            .map((occurrence) => ({
                value: String(occurrence.id),
                label: formatDateWithLocale(occurrence.start_date, 'timeOnly', event?.timezone ?? 'UTC') ?? occurrence.start_date,
            })),
        [occurrences, event?.timezone],
    );

    const form = useForm<BookFamilyFormValues>({
        initialValues: {
            event_occurrence_id: null,
            parent_first_name: '',
            parent_last_name: '',
            email: '',
            children: [{first_name: ''}],
        },
    });

    const handleSubmit = (values: BookFamilyFormValues) => {
        bookMutation.mutate({
            eventId: eventId!,
            data: {
                event_occurrence_id: values.event_occurrence_id!,
                parent_first_name: values.parent_first_name,
                parent_last_name: values.parent_last_name,
                email: values.email || undefined,
                children: values.children,
            },
        }, {
            onSuccess: () => {
                showSuccess(t`Family booked`);
                onClose();
            },
            onError: (error) => errorHandler(form, error),
        });
    };

    return (
        <Modal opened onClose={onClose} heading={t`Book a Family`}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Select
                        label={t`Time slot`}
                        data={slotOptions}
                        searchable
                        required
                        {...form.getInputProps('event_occurrence_id')}
                    />
                    <TextInput label={t`Parent first name`} required {...form.getInputProps('parent_first_name')}/>
                    <TextInput label={t`Parent last name`} required {...form.getInputProps('parent_last_name')}/>
                    <TextInput
                        type="email"
                        label={t`Parent email (optional)`}
                        description={t`If left blank, the ticket is sent to you.`}
                        {...form.getInputProps('email')}
                    />
                    {form.values.children.map((_, index) => (
                        <Group key={index} align="flex-end" wrap="nowrap">
                            <TextInput
                                style={{flex: 1}}
                                label={t`Child name`}
                                required
                                {...form.getInputProps(`children.${index}.first_name`)}
                            />
                            {form.values.children.length > 1 && (
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    aria-label={t`Remove child`}
                                    onClick={() => form.removeListItem('children', index)}
                                >
                                    <IconTrash size={16}/>
                                </ActionIcon>
                            )}
                        </Group>
                    ))}
                    <Button
                        variant="light"
                        leftSection={<IconPlus size={14}/>}
                        onClick={() => form.insertListItem('children', {first_name: ''})}
                    >
                        {t`Add child`}
                    </Button>
                    <Button
                        type="submit"
                        loading={bookMutation.isPending}
                        data-testid="book-family-submit-button"
                    >
                        {t`Book family`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
