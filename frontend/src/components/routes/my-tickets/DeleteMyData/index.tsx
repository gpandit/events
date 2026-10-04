import {useState} from "react";
import {t} from "@lingui/macro";
import {Button, Modal, PasswordInput, Text, TextInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {IconCheck, IconTrash} from "@tabler/icons-react";
import {useErasePersonalData} from "../../../../mutations/useErasePersonalData.ts";
import {Card} from "../../../common/Card";
import classes from "../MyTickets.module.scss";

const CONFIRMATION_WORD = 'DELETE';

interface DeleteMyDataProps {
    token: string;
}

export const DeleteMyData = ({token}: DeleteMyDataProps) => {
    const [opened, {open, close}] = useDisclosure(false);
    const [confirmation, setConfirmation] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [erased, setErased] = useState(false);
    const eraseMutation = useErasePersonalData(token);

    const handleDelete = () => {
        setError(null);
        eraseMutation.mutate({confirmation, password: password || undefined}, {
            onSuccess: () => {
                close();
                setErased(true);
            },
            onError: (err: any) => setError(
                err?.response?.data?.errors?.password?.[0]
                || err?.response?.data?.message
                || t`Something went wrong. Please try again.`
            ),
        });
    };

    if (erased) {
        return (
            <Card className={classes.dangerCard}>
                <div className={classes.requestHeader}>
                    <IconCheck size={20}/>
                    <Text fw={500} data-testid="delete-my-data-done">{t`Your personal data has been deleted.`}</Text>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className={classes.dangerCard}>
                <div className={classes.requestHeader}>
                    <IconTrash size={20}/>
                    <Text fw={500}>{t`Delete my data`}</Text>
                </div>
                <Text size="sm" c="dimmed" mb="md">
                    {t`Permanently delete the personal information we hold for this email address, including your name, email, phone and address on orders and tickets, your account, and any stories or puzzle accounts created for your children. Payment records are kept without any personal details, as we are required to keep financial records.`}
                </Text>
                <Button
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={16}/>}
                    onClick={open}
                    data-testid="delete-my-data-button"
                >
                    {t`Delete my data`}
                </Button>
            </Card>

            <Modal opened={opened} onClose={close} title={t`Delete my data`} centered>
                <Text size="sm" mb="md">
                    {t`This cannot be undone. Your tickets will no longer be linked to you, so keep a copy of any ticket you still need. Type ${CONFIRMATION_WORD} to confirm.`}
                </Text>
                <TextInput
                    label={t`Confirmation`}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.currentTarget.value)}
                    data-testid="delete-my-data-confirmation"
                    mb="sm"
                />
                <PasswordInput
                    label={t`Password (if you have an account password)`}
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    autoComplete="current-password"
                    data-testid="delete-my-data-password"
                    mb="sm"
                />
                {error && <Text size="sm" c="red" mb="sm" role="alert">{error}</Text>}
                <Button
                    color="red"
                    fullWidth
                    disabled={confirmation !== CONFIRMATION_WORD}
                    loading={eraseMutation.isPending}
                    onClick={handleDelete}
                    data-testid="delete-my-data-submit"
                >
                    {t`Permanently delete my data`}
                </Button>
            </Modal>
        </>
    );
};
