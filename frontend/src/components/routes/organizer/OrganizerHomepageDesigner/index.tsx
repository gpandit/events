import {useEffect, useRef, useState} from "react";
import classes from './OrganizerHomepageDesigner.module.scss';
import {useParams} from "react-router";
import {useGetOrganizerSettings} from "../../../../queries/useGetOrganizerSettings.ts";
import {useUpdateOrganizerSettings} from "../../../../mutations/useUpdateOrganizerSettings.ts";
import {useFormErrorResponseHandler} from "../../../../hooks/useFormErrorResponseHandler.tsx";
import {HomepageThemeSettings, IdParam, OrganizerSettings} from "../../../../types.ts";
import {showSuccess} from "../../../../utilites/notifications.tsx";
import {t} from "@lingui/macro";
import {useForm} from "@mantine/form";
import {Accordion, Button, Group, SegmentedControl, Stack, Text, TextInput, Textarea} from "@mantine/core";
import {
    IconAddressBook,
    IconColorPicker,
    IconHelp,
    IconInfoCircle,
    IconLayoutList,
    IconPalette,
    IconPhoto,
    IconPhotoVideo,
    IconTypography,
    IconUsers,
    IconVideo,
} from "@tabler/icons-react";
import {Tooltip} from "../../../common/Tooltip";
import {LoadingMask} from "../../../common/LoadingMask";
import {CustomSelect} from "../../../common/CustomSelect";
import {GET_ORGANIZER_QUERY_KEY, useGetOrganizer} from "../../../../queries/useGetOrganizer.ts";
import {ImageUploadDropzone} from "../../../common/ImageUploadDropzone";
import {OrganizerPreviewPage, organizerPreviewPath} from "../../../../utilites/urlHelper.ts";
import {queryClient} from "../../../../utilites/queryClient.ts";
import {GET_ORGANIZER_PUBLIC_QUERY_KEY} from "../../../../queries/useGetOrganizerPublic.ts";
import {ThemeColorControls} from "../../../common/ThemeColorControls";
import {ThemeFontControl} from "../../../common/ThemeFontControl";
import {computeThemeVariables, validateThemeSettings} from "../../../../utilites/themeUtils.ts";
import {DEFAULT_HOMEPAGE_FONT} from "../../../../constants/homepageFonts.ts";

interface FormValues {
    homepage_theme_settings: Partial<HomepageThemeSettings>;
}

const MAX_TEAM_MEMBERS = 12;

const OrganizerHomepageDesigner = () => {
    const {organizerId} = useParams();
    const organizerSettingsQuery = useGetOrganizerSettings(organizerId);
    const organizerQuery = useGetOrganizer(organizerId);
    const updateMutation = useUpdateOrganizerSettings();

    const organizerData = organizerQuery.data;

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lastSentSettings = useRef<string | null>(null);

    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [accordionValue, setAccordionValue] = useState<string[]>(['images', 'hero', 'theme', 'typography']);
    const [page, setPage] = useState<OrganizerPreviewPage>('home');
    const [lastCoverId, setLastCoverId] = useState<IdParam | null>(null);
    const [lastLogoId, setLastLogoId] = useState<IdParam | null>(null);

    const existingLogo = organizerData?.images?.find((image) => image.type === 'ORGANIZER_LOGO');
    const existingCover = organizerData?.images?.find((image) => image.type === 'ORGANIZER_COVER');

    const form = useForm<FormValues>({
        initialValues: {
            homepage_theme_settings: {
                accent: '#8b5cf6',
                background: '#f5f3ff',
                mode: 'light',
                background_type: 'COLOR',
                font_family: DEFAULT_HOMEPAGE_FONT,
                hero_media_type: 'IMAGE',
                hero_video_url: '',
                hero_heading: '',
                hero_subheading: '',
                hero_cta_text: '',
                hero_cta_url: '',
            },
        }
    });

    const formErrorHandle = useFormErrorResponseHandler();

    useEffect(() => {
        if (organizerSettingsQuery?.isFetched && organizerSettingsQuery?.data) {
            const settings = organizerSettingsQuery.data;
            const themeSettings = validateThemeSettings(settings.homepage_theme_settings);

            form.setValues({
                homepage_theme_settings: themeSettings,
            });
        }
    }, [organizerSettingsQuery.isFetched, organizerSettingsQuery.data]);

    const buildPreviewSrc = (previewPage: OrganizerPreviewPage, coverId?: IdParam, logoId?: IdParam) => {
        const path = organizerPreviewPath(organizerId, previewPage);
        return coverId || logoId ? `${path}?cover_image_id=${coverId}&logo_image_id=${logoId}` : path;
    };

    useEffect(() => {
        if (organizerSettingsQuery.isFetched && organizerQuery.isFetched && !iframeSrc) {
            setIframeSrc(organizerPreviewPath(organizerId));
        }
    }, [organizerSettingsQuery.isFetched, organizerQuery.isFetched, organizerId]);

    const handlePageChange = (value: string) => {
        const nextPage = value as OrganizerPreviewPage;
        setPage(nextPage);
        setIframeLoaded(false);
        lastSentSettings.current = null;
        setIframeSrc(buildPreviewSrc(nextPage, existingCover?.id, existingLogo?.id));
    };

    const handleSubmit = (values: FormValues) => {
        const validatedTheme = validateThemeSettings(values.homepage_theme_settings);

        const organizerSettings: Partial<OrganizerSettings> = {
            homepage_theme_settings: validatedTheme,
        };

        updateMutation.mutate(
            {
                organizerSettings,
                organizerId: organizerId
            },
            {
                onSuccess: () => {
                    showSuccess(t`Successfully Updated Site Design`);
                },
                onError: (error) => {
                    formErrorHandle(form, error);
                },
            }
        );
    };

    const sendSettingsToIframe = () => {
        if (iframeRef.current?.contentWindow && iframeLoaded) {
            const themeSettings = validateThemeSettings(form.values.homepage_theme_settings);
            const cssVars = computeThemeVariables(themeSettings);

            const settingsToSend = {
                homepage_theme_settings: themeSettings,
                logoUrl: existingLogo?.url,
                coverUrl: existingCover?.url,
                // Include legacy fields for backward compatibility with preview
                homepage_background_color: themeSettings.background,
                homepage_content_background_color: cssVars['--theme-surface'],
                homepage_primary_color: themeSettings.accent,
                homepage_primary_text_color: cssVars['--theme-text-primary'],
                homepage_secondary_color: cssVars['--theme-text-secondary'],
                homepage_secondary_text_color: cssVars['--theme-text-tertiary'],
                homepage_background_type: themeSettings.background_type,
            };

            const settingsJson = JSON.stringify(settingsToSend);
            if (settingsJson !== lastSentSettings.current) {
                iframeRef.current.contentWindow.postMessage(
                    {type: "UPDATE_ORGANIZER_SETTINGS", settings: settingsToSend},
                    "*"
                );
                lastSentSettings.current = settingsJson;
            }
        }
    };

    useEffect(() => {
        sendSettingsToIframe();
    }, [iframeLoaded, form.values, existingLogo?.url, existingCover?.url]);

    useEffect(() => {
        if (((existingCover?.id !== lastCoverId) || existingLogo?.id !== lastLogoId) && iframeSrc) {
            setLastCoverId(existingCover?.id);
            setLastLogoId(existingLogo?.id);
            setIframeSrc(buildPreviewSrc(page, existingCover?.id, existingLogo?.id));
            setIframeLoaded(false);
        }
    }, [existingCover?.id, existingLogo?.id]);

    const handleImageChange = () => {
        queryClient.invalidateQueries({
            queryKey: [GET_ORGANIZER_PUBLIC_QUERY_KEY, organizerId],
        });
        queryClient.invalidateQueries({
            queryKey: [GET_ORGANIZER_QUERY_KEY, organizerId],
        });
    };

    const handleThemeChange = (themeSettings: Partial<HomepageThemeSettings>) => {
        form.setFieldValue('homepage_theme_settings', themeSettings);
    };

    const handleBackgroundTypeChange = (backgroundType: string | string[]) => {
        const value = Array.isArray(backgroundType) ? backgroundType[0] : backgroundType;
        form.setFieldValue('homepage_theme_settings', {
            ...form.values.homepage_theme_settings,
            background_type: value as 'COLOR' | 'MIRROR_COVER_IMAGE',
        });
    };

    const updateHeroField = (field: keyof HomepageThemeSettings, value: string) => {
        form.setFieldValue('homepage_theme_settings', {
            ...form.values.homepage_theme_settings,
            [field]: value,
        });
    };

    const updateTeamMembers = (value: string) => {
        form.setFieldValue('homepage_theme_settings', {
            ...form.values.homepage_theme_settings,
            team_members: value.split('\n').slice(0, MAX_TEAM_MEMBERS),
        });
    };

    const handleHeroMediaTypeChange = (mediaType: string | string[]) => {
        const value = Array.isArray(mediaType) ? mediaType[0] : mediaType;
        form.setFieldValue('homepage_theme_settings', {
            ...form.values.homepage_theme_settings,
            hero_media_type: value as 'IMAGE' | 'VIDEO',
        });
    };

    return (
        <div className={classes.container}>
            <div className={classes.sidebar}>
                <div className={classes.sticky}>
                    <div className={classes.header}>
                        <h2>{t`Site Design`}</h2>
                        <Text c="dimmed" size="sm">{t`Customize the look and content of your public pages`}</Text>
                        <SegmentedControl
                            fullWidth
                            mt="sm"
                            value={page}
                            onChange={handlePageChange}
                            data={[
                                {value: 'home', label: t`Home`},
                                {value: 'about', label: t`About & Contact`},
                            ]}
                            data-testid="designer-page-switcher"
                        />
                    </div>

                    <Accordion
                        multiple
                        value={accordionValue}
                        onChange={setAccordionValue}
                        variant="contained"
                        className={classes.accordion}
                    >
                        <Accordion.Item value="images" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconPhoto size={20}/>}>
                                <Text fw={500}>{t`Images`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap="lg">
                                    <div>
                                        <Group justify={'space-between'} mb="xs">
                                            <Text fw={500} size="sm">{t`Cover Image`}</Text>
                                            <Tooltip
                                                label={t`We recommend dimensions of 1950px by 650px, a ratio of 3:1, and a maximum file size of 5MB`}>
                                                <IconHelp size={16} style={{color: 'var(--mantine-color-gray-6)'}}/>
                                            </Tooltip>
                                        </Group>
                                        <ImageUploadDropzone
                                            imageType="ORGANIZER_COVER"
                                            entityId={organizerId}
                                            onUploadSuccess={handleImageChange}
                                            onDeleteSuccess={handleImageChange}
                                            existingImageData={{
                                                url: existingCover?.url,
                                                id: existingCover?.id,
                                            }}
                                            helpText={t`Cover image will be displayed at the top of your organizer page`}
                                            displayMode="compact"
                                        />
                                    </div>

                                    <div>
                                        <Group justify={'space-between'} mb="xs">
                                            <Text fw={500} size="sm">{t`Logo`}</Text>
                                            <Tooltip label={t`We recommend dimensions of 400px by 400px, and a maximum file size of 5MB`}>
                                                <IconHelp size={16} style={{color: 'var(--mantine-color-gray-6)'}}/>
                                            </Tooltip>
                                        </Group>
                                        <ImageUploadDropzone
                                            imageType="ORGANIZER_LOGO"
                                            entityId={organizerId}
                                            onUploadSuccess={handleImageChange}
                                            onDeleteSuccess={handleImageChange}
                                            existingImageData={{
                                                url: existingLogo?.url,
                                                id: existingLogo?.id,
                                            }}
                                            helpText={t`Logo will be displayed in the header`}
                                            displayMode="compact"
                                        />
                                    </div>
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>

                        {page === 'home' && (
                        <Accordion.Item value="hero" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconPhotoVideo size={20}/>}>
                                <Text fw={500}>{t`Hero Banner`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <Stack gap="md">
                                        <Text c="dimmed" size="sm">
                                            {t`The large banner at the top of your homepage. Leave fields blank to use sensible defaults.`}
                                        </Text>

                                        <CustomSelect
                                            optionList={[
                                                {
                                                    icon: <IconPhoto/>,
                                                    label: t`Image`,
                                                    value: 'IMAGE',
                                                    description: t`Use your cover image as the banner background`,
                                                },
                                                {
                                                    icon: <IconVideo/>,
                                                    label: t`Video`,
                                                    value: 'VIDEO',
                                                    description: t`Use a looping background video instead`,
                                                },
                                            ]}
                                            label={t`Banner Type`}
                                            name={'homepage_theme_settings.hero_media_type'}
                                            value={form.values.homepage_theme_settings.hero_media_type || 'IMAGE'}
                                            onChange={handleHeroMediaTypeChange}
                                        />

                                        {form.values.homepage_theme_settings.hero_media_type === 'VIDEO' && (
                                            <TextInput
                                                label={t`Video URL`}
                                                placeholder="https://example.com/banner.mp4"
                                                description={t`Direct link to an .mp4 video file`}
                                                value={form.values.homepage_theme_settings.hero_video_url || ''}
                                                onChange={(event) => updateHeroField('hero_video_url', event.currentTarget.value)}
                                            />
                                        )}

                                        <TextInput
                                            label={t`Heading`}
                                            placeholder={organizerData?.name || t`Your organization name`}
                                            value={form.values.homepage_theme_settings.hero_heading || ''}
                                            onChange={(event) => updateHeroField('hero_heading', event.currentTarget.value)}
                                            maxLength={150}
                                        />

                                        <Textarea
                                            label={t`Subheading`}
                                            placeholder={t`A short line about what you do`}
                                            value={form.values.homepage_theme_settings.hero_subheading || ''}
                                            onChange={(event) => updateHeroField('hero_subheading', event.currentTarget.value)}
                                            maxLength={300}
                                            autosize
                                            minRows={2}
                                        />

                                        <TextInput
                                            label={t`Button Text`}
                                            placeholder={t`View Events`}
                                            value={form.values.homepage_theme_settings.hero_cta_text || ''}
                                            onChange={(event) => updateHeroField('hero_cta_text', event.currentTarget.value)}
                                            maxLength={50}
                                        />

                                        <TextInput
                                            label={t`Button Link`}
                                            description={t`Leave blank to link to your events page`}
                                            placeholder="https://example.com"
                                            value={form.values.homepage_theme_settings.hero_cta_url || ''}
                                            onChange={(event) => updateHeroField('hero_cta_url', event.currentTarget.value)}
                                            maxLength={2048}
                                        />
                                    </Stack>
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>
                        )}

                        {page === 'home' && (
                        <Accordion.Item value="homepage-text" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconLayoutList size={20}/>}>
                                <Text fw={500}>{t`Homepage Text`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <TextInput
                                        label={t`Upcoming Events Heading`}
                                        placeholder={t`What's happening`}
                                        value={form.values.homepage_theme_settings.upcoming_heading || ''}
                                        onChange={(event) => updateHeroField('upcoming_heading', event.currentTarget.value)}
                                        maxLength={100}
                                    />
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>
                        )}

                        {page === 'about' && (
                        <Accordion.Item value="about-text" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconInfoCircle size={20}/>}>
                                <Text fw={500}>{t`About Text`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <Textarea
                                        label={t`About Us`}
                                        description={t`Leave blank to show your organizer description`}
                                        value={form.values.homepage_theme_settings.about_text || ''}
                                        onChange={(event) => updateHeroField('about_text', event.currentTarget.value)}
                                        maxLength={2000}
                                        autosize
                                        minRows={4}
                                    />
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>
                        )}

                        {page === 'about' && (
                        <Accordion.Item value="team" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconUsers size={20}/>}>
                                <Text fw={500}>{t`Team`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <Stack gap="md">
                                        <TextInput
                                            label={t`Team Heading`}
                                            placeholder={t`Meet the team`}
                                            value={form.values.homepage_theme_settings.team_heading || ''}
                                            onChange={(event) => updateHeroField('team_heading', event.currentTarget.value)}
                                            maxLength={100}
                                        />
                                        <Textarea
                                            label={t`Team Members`}
                                            description={t`One name per line, up to 12. Leave blank to hide the team section`}
                                            value={(form.values.homepage_theme_settings.team_members || []).join('\n')}
                                            onChange={(event) => updateTeamMembers(event.currentTarget.value)}
                                            autosize
                                            minRows={4}
                                        />
                                    </Stack>
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>
                        )}

                        {page === 'about' && (
                        <Accordion.Item value="contact-section" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconAddressBook size={20}/>}>
                                <Text fw={500}>{t`Get in Touch Section`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <Stack gap="md">
                                        <TextInput
                                            label={t`Heading`}
                                            placeholder={t`Get involved - volunteer, sponsor or say hello`}
                                            value={form.values.homepage_theme_settings.contact_heading || ''}
                                            onChange={(event) => updateHeroField('contact_heading', event.currentTarget.value)}
                                            maxLength={100}
                                        />
                                        <Textarea
                                            label={t`Introduction`}
                                            value={form.values.homepage_theme_settings.contact_intro || ''}
                                            onChange={(event) => updateHeroField('contact_intro', event.currentTarget.value)}
                                            maxLength={300}
                                            autosize
                                            minRows={2}
                                        />
                                    </Stack>
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>
                        )}

                        <Accordion.Item value="contact-details" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconAddressBook size={20}/>}>
                                <Text fw={500}>{t`Contact Details`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <Stack gap="md">
                                        <TextInput
                                            label={t`Contact Email`}
                                            description={t`Shown in the footer and on the About page. Defaults to your organizer email`}
                                            placeholder={organizerData?.email}
                                            value={form.values.homepage_theme_settings.contact_email || ''}
                                            onChange={(event) => updateHeroField('contact_email', event.currentTarget.value)}
                                            maxLength={255}
                                        />
                                        <TextInput
                                            label={t`Instagram Handle`}
                                            description={t`Without the @. Leave blank to hide Instagram links`}
                                            placeholder="yourschool"
                                            value={form.values.homepage_theme_settings.instagram_handle || ''}
                                            onChange={(event) => updateHeroField('instagram_handle', event.currentTarget.value.replace(/^@/, ''))}
                                            maxLength={30}
                                        />
                                    </Stack>
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="theme" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconPalette size={20}/>}>
                                <Text fw={500}>{t`Theme & Colors`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <form onSubmit={form.onSubmit(handleSubmit)}>
                                    <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                              className={classes.fieldset}>
                                        <Stack gap="md">
                                            <CustomSelect
                                                optionList={[
                                                    {
                                                        icon: <IconColorPicker/>,
                                                        label: t`Color`,
                                                        value: 'COLOR',
                                                        description: t`Choose a color for your background`,
                                                    },
                                                    {
                                                        icon: <IconPhoto/>,
                                                        label: t`Use cover image`,
                                                        value: 'MIRROR_COVER_IMAGE',
                                                        description: t`Use a blurred version of the cover image as the background`,
                                                        disabled: !existingCover,
                                                    },
                                                ]}
                                                label={t`Background Type`}
                                                name={'homepage_theme_settings.background_type'}
                                                value={form.values.homepage_theme_settings.background_type || 'COLOR'}
                                                onChange={handleBackgroundTypeChange}
                                            />

                                            <ThemeColorControls
                                                values={form.values.homepage_theme_settings}
                                                onChange={handleThemeChange}
                                                disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                            />
                                        </Stack>
                                    </fieldset>
                                </form>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="typography" className={classes.accordionItem}>
                            <Accordion.Control icon={<IconTypography size={20}/>}>
                                <Text fw={500}>{t`Typography`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <fieldset disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                          className={classes.fieldset}>
                                    <ThemeFontControl
                                        value={form.values.homepage_theme_settings.font_family}
                                        onChange={(fontFamily) => form.setFieldValue('homepage_theme_settings', {
                                            ...form.values.homepage_theme_settings,
                                            font_family: fontFamily,
                                        })}
                                        disabled={organizerSettingsQuery.isLoading || updateMutation.isPending}
                                    />
                                </fieldset>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                    <Button
                        loading={updateMutation.isPending}
                        type={'submit'}
                        fullWidth
                        mt="md"
                        onClick={() => form.onSubmit(handleSubmit)()}
                    >
                        {t`Save Changes`}
                    </Button>
                </div>
            </div>

            <div className={classes.previewContainer}>
                <h2>{page === 'about' ? t`About Page Preview` : t`Homepage Preview`}</h2>
                <div className={classes.iframeContainer}>
                    {iframeSrc ? (
                        <iframe
                            ref={iframeRef}
                            src={iframeSrc}
                            title="Organizer Homepage Preview"
                            onLoad={() => setIframeLoaded(true)}
                        />
                    ) : (
                        <LoadingMask/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerHomepageDesigner;
