import {Checkbox, Text} from "@mantine/core";
import {t} from "@lingui/macro";
import {IdParam} from "../../../../../types.ts";
import {formatCurrency} from "../../../../../utilites/currency.ts";
import {showError} from "../../../../../utilites/notifications.tsx";
import {useGetPaymentProcessingFee} from "../../../../../queries/useGetPaymentProcessingFee.ts";
import {useSetPaymentProcessingFeeCoverage} from "../../../../../mutations/useSetPaymentProcessingFeeCoverage.ts";
import classes from "./PaymentProcessingFee.module.scss";

interface PaymentProcessingFeeProps {
    eventId: IdParam;
    orderShortId: IdParam;
    onCoverageChanged: () => void;
}

export const PaymentProcessingFee = ({eventId, orderShortId, onCoverageChanged}: PaymentProcessingFeeProps) => {
    const {data: quote} = useGetPaymentProcessingFee(eventId, orderShortId);
    const coverageMutation = useSetPaymentProcessingFeeCoverage();

    if (!quote || quote.mode === 'HIDE' || quote.fee <= 0) {
        return null;
    }

    const formattedFee = formatCurrency(quote.fee, quote.currency);

    if (quote.mode === 'SHOW') {
        return (
            <div className={classes.container} data-testid="payment-processing-fee-info">
                <Text size="sm" c="dimmed">
                    {t`Payment processing fee (estimated): ${formattedFee}`}
                </Text>
            </div>
        );
    }

    const handleChange = (cover: boolean) => {
        coverageMutation.mutate({eventId, orderShortId, cover}, {
            onSuccess: onCoverageChanged,
            onError: (error: any) => showError(
                error?.response?.data?.message || error?.response?.data?.errors?.cover?.[0]
                || t`Could not update the payment processing fee. Please try again.`
            ),
        });
    };

    return (
        <div className={classes.container} data-testid="payment-processing-fee-collect">
            <Checkbox
                checked={quote.covered}
                disabled={coverageMutation.isPending}
                onChange={(event) => handleChange(event.currentTarget.checked)}
                label={t`I'd like to cover the payment processing fee (${formattedFee})`}
                description={t`Optional. This covers the card processing charge so the organizer receives the full amount.`}
                data-testid="payment-processing-fee-checkbox"
            />
        </div>
    );
};
