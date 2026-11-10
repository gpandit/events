import {t} from "@lingui/macro";
import {Button, NumberInput, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useParams} from "react-router";
import {Modal} from "../../../../common/Modal";
import {GenericModalProps, GenerateSlotsRequest} from "../../../../../types.ts";
import {useGenerateSlots} from "../../../../../mutations/useGenerateSlots.ts";
import {showSuccess} from "../../../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../../../hooks/useFormErrorResponseHandler.tsx";

const DEFAULT_SLOT_DATE = '2026-12-10';

export const GenerateSlotsModal = ({onClose}: GenericModalProps) => {
    const {eventId} = useParams();
    const generateMutation = useGenerateSlots();
    const errorHandler = useFormErrorResponseHandler();

    const form = useForm<GenerateSlotsRequest>({
        initialValues: {
            date: DEFAULT_SLOT_DATE,
            start_time: '18:00',
            end_time: '22:00',
            slot_minutes: 5,
            children_per_slot: 1,
        },
    });

    const handleSubmit = (values: GenerateSlotsRequest) => {
        generateMutation.mutate({eventId: eventId!, data: values}, {
            onSuccess: ({created}) => {
                showSuccess(t`Created ${created} time slot(s)`);
                onClose();
            },
            onError: (error) => errorHandler(form, error),
        });
    };

    return (
        <Modal opened onClose={onClose} heading={t`Generate Time Slots`}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        type="date"
                        label={t`Date`}
                        required
                        {...form.getInputProps('date')}
                    />
                    <TextInput
                        type="time"
                        label={t`Start time`}
                        required
                        {...form.getInputProps('start_time')}
                    />
                    <TextInput
                        type="time"
                        label={t`End time`}
                        required
                        {...form.getInputProps('end_time')}
                    />
                    <NumberInput
                        label={t`Slot length (minutes)`}
                        min={1}
                        max={240}
                        required
                        {...form.getInputProps('slot_minutes')}
                    />
                    <NumberInput
                        label={t`Children per slot`}
                        min={1}
                        max={50}
                        required
                        {...form.getInputProps('children_per_slot')}
                    />
                    <Button
                        type="submit"
                        loading={generateMutation.isPending}
                        data-testid="generate-slots-submit-button"
                    >
                        {t`Generate slots`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
