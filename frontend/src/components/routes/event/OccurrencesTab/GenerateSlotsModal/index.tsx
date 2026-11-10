import {t} from "@lingui/macro";
import {Button, MultiSelect, NumberInput, Select, Stack, Switch, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useMemo, useState} from "react";
import {useParams} from "react-router";
import {Modal} from "../../../../common/Modal";
import {GenericModalProps, GenerateSlotsRequest} from "../../../../../types.ts";
import {useGenerateSlots} from "../../../../../mutations/useGenerateSlots.ts";
import {useGetEvents} from "../../../../../queries/useGetEvents.ts";
import {useGetEventProductCategories} from "../../../../../queries/useGetProductCategories.ts";
import {showSuccess} from "../../../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../../../hooks/useFormErrorResponseHandler.tsx";

const DEFAULT_SLOT_DATE = '2026-12-10';

export const GenerateSlotsModal = ({onClose}: GenericModalProps) => {
    const {eventId} = useParams();
    const generateMutation = useGenerateSlots();
    const errorHandler = useFormErrorResponseHandler();

    const [sellAsAddon, setSellAsAddon] = useState(false);
    const [ticketEventId, setTicketEventId] = useState<string | null>(null);
    const [childProductIds, setChildProductIds] = useState<string[]>([]);
    const {data: events} = useGetEvents({pageNumber: 1, perPage: 100});
    const {data: categories} = useGetEventProductCategories(sellAsAddon && ticketEventId ? ticketEventId : undefined);

    const eventOptions = useMemo(
        () => (events?.data ?? []).filter((e) => String(e.id) !== String(eventId)).map((e) => ({value: String(e.id), label: e.title})),
        [events, eventId],
    );
    const productOptions = useMemo(
        () => (categories?.data ?? []).flatMap((category) => category.products ?? []).map((product) => ({
            value: String(product.id),
            label: product.title,
        })),
        [categories],
    );

    const form = useForm<GenerateSlotsRequest>({
        initialValues: {
            date: DEFAULT_SLOT_DATE,
            start_time: '18:00',
            end_time: '22:00',
            slot_minutes: 5,
            children_per_slot: 1,
            grotto_product_id: null,
        },
    });

    const handleSubmit = (values: GenerateSlotsRequest) => {
        const data: GenerateSlotsRequest = sellAsAddon
            ? {
                ...values,
                ticket_event_id: ticketEventId ? Number(ticketEventId) : null,
                grotto_product_id: values.grotto_product_id ? Number(values.grotto_product_id) : null,
                child_product_ids: childProductIds.map(Number),
            }
            : {...values, ticket_event_id: null, grotto_product_id: null, child_product_ids: []};

        generateMutation.mutate({eventId: eventId!, data}, {
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
                    <Switch
                        label={t`Sell visits as a paid Grotto add-on on another event`}
                        checked={sellAsAddon}
                        onChange={(e) => setSellAsAddon(e.currentTarget.checked)}
                        data-testid="generate-slots-addon-switch"
                    />
                    {sellAsAddon && (
                        <>
                            <Select
                                label={t`Ticket event`}
                                data={eventOptions}
                                value={ticketEventId}
                                onChange={(value) => {
                                    setTicketEventId(value);
                                    form.setFieldValue('grotto_product_id', null);
                                    setChildProductIds([]);
                                }}
                                searchable
                                required
                            />
                            <Select
                                label={t`Grotto add-on product`}
                                data={productOptions}
                                value={form.values.grotto_product_id ? String(form.values.grotto_product_id) : null}
                                onChange={(value) => form.setFieldValue('grotto_product_id', value ? Number(value) : null)}
                                searchable
                                required
                            />
                            <MultiSelect
                                label={t`Child ticket products`}
                                description={t`Grotto tickets are limited to the number of child tickets held.`}
                                data={productOptions}
                                value={childProductIds}
                                onChange={setChildProductIds}
                                searchable
                                required
                            />
                        </>
                    )}
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
