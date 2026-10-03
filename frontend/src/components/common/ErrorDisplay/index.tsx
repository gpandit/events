import {t} from '@lingui/macro';
import {Box, Button, Container, Image, rem, Stack, Text, Title} from '@mantine/core';
import {IconHome} from '@tabler/icons-react';
import classes from './ErrorDisplay.module.scss';
import {Helmet} from "react-helmet-async";
import {NavLink, useRouteError} from "react-router";
import {BouncingEmoji} from "../BouncingEmoji";

const getErrorStatus = (error: any): number | undefined => {
    const status = error?.status ?? error?.response?.status;
    return typeof status === 'number' ? status : undefined;
};

export const ErrorDisplay = () => {
    const error = useRouteError() as any;
    const status = getErrorStatus(error);

    const {emoji, title, description} = (() => {
        switch (status) {
            case 404:
                return {
                    emoji: '🧤',
                    title: t`Error 404! Page not found.`,
                    description: t`This link is currently sitting in the school's Lost and Found bin right next to a single, unlabeled winter glove.`,
                };
            case 403:
                return {
                    emoji: '☕',
                    title: t`Error 403! Access Denied!`,
                    description: t`You've officially wandered into the digital Teachers' Lounge. No parents or students allowed!`,
                };
            case 503:
                return {
                    emoji: '🚌',
                    title: t`503 Service Unavailable.`,
                    description: t`Our servers are currently stuck in the morning drop-off car line. We'll be moving forward again shortly!`,
                };
            default:
                return {
                    emoji: '✨',
                    title: t`500 Error.`,
                    description: t`Someone knocked over a gallon of craft glitter onto our servers. Our digital janitors are cleaning it up now!`,
                };
        }
    })();

    return (
        <>
            <Helmet
                title={title}
                meta={[
                    {
                        name: 'description',
                        content: description,
                    },
                ]}
            />
            <Box className={classes.wrapper}>

                {/* Animated background elements */}
                <div className={classes.backgroundOrb1}/>
                <div className={classes.backgroundOrb2}/>

                <Container size="md" className={classes.root}>
                    <Stack gap="xl" align="center">
                        <Image
                            src="/logos/friends-of-school-logo.webp"
                            alt={t`Friends of School`}
                            w={rem(180)}
                            h="auto"
                            fit="contain"
                            className={classes.logo}
                        />

                        <Stack gap="lg" align="center" className={classes.content}>
                            <BouncingEmoji emoji={emoji} size={64}/>
                            <Title order={1} className={classes.title}>
                                {title}
                            </Title>

                            <Text size="lg" c="dimmed" className={classes.description}>
                                {description}
                            </Text>
                            <Button
                                component={NavLink}
                                to="/"
                                leftSection={<IconHome size={18}/>}
                                variant="gradient"
                                gradient={{from: 'primary', to: 'secondary'}}
                                className={classes.button}
                            >
                                {t`Go back to home page`}
                            </Button>
                        </Stack>

                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default ErrorDisplay;
