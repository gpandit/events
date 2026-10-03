import {t} from '@lingui/macro';
import {Box, Button, Container, Image, rem, Stack, Text, Title} from '@mantine/core';
import {IconHome} from '@tabler/icons-react';
import classes from './ErrorDisplay.module.scss';
import {Helmet} from "react-helmet-async";
import {useEffect, useState} from "react";
import {NavLink, useNavigate, useRouteError} from "react-router";
import {BouncingEmoji} from "../BouncingEmoji";

const getErrorStatus = (error: any): number | undefined => {
    const status = error?.status ?? error?.response?.status;
    return typeof status === 'number' ? status : undefined;
};

const REDIRECT_SECONDS = 10;

export const ErrorDisplay = () => {
    const error = useRouteError() as any;
    const status = getErrorStatus(error);
    const navigate = useNavigate();
    const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
    const redirectsHome = status === 404;

    useEffect(() => {
        if (!redirectsHome) {
            return;
        }

        if (secondsLeft === 0) {
            navigate('/');
            return;
        }

        const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [redirectsHome, secondsLeft, navigate]);

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
                            {redirectsHome && (
                                <Text size="sm" c="dimmed" role="status" data-testid="error-redirect-countdown">
                                    {t`Taking you to the home page in ${secondsLeft} seconds...`}
                                </Text>
                            )}
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
