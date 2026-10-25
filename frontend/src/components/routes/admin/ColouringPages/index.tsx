import {t} from "@lingui/macro";
import {Container, Stack, Text, Title} from "@mantine/core";
import {SHARED_COLOURING_PAGES} from "../../../../api/colouring-page.client.ts";
import {ColouringPagesManager} from "../../organizer/ColouringPages/ColouringPagesManager.tsx";

const SharedColouringPages = () => {
    return (
        <Container fluid>
            <Stack gap="md">
                <div>
                    <Title order={2}>{t`Shared colouring pages`}</Title>
                    <Text size="sm" c="dimmed">
                        {t`Published pages here appear on every school's site next to the pages that school uploads itself.`}
                    </Text>
                </div>
                <ColouringPagesManager scope={SHARED_COLOURING_PAGES} canManage/>
            </Stack>
        </Container>
    );
};

export default SharedColouringPages;
