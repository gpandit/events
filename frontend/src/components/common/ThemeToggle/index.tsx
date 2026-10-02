import {ActionIcon, useMantineColorScheme, useComputedColorScheme} from '@mantine/core';
import {IconMoon, IconSun} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import classes from './ThemeToggle.module.scss';

export const ThemeToggle = () => {
    const {setColorScheme} = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light');

    const toggle = () => {
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ActionIcon
            onClick={toggle}
            variant="filled"
            size={48}
            radius="xl"
            className={classes.toggle}
            aria-label={t`Toggle light and dark theme`}
            title={t`Toggle light and dark theme`}
        >
            {computedColorScheme === 'dark' ? <IconSun size={22}/> : <IconMoon size={22}/>}
        </ActionIcon>
    );
};

export default ThemeToggle;
