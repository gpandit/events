import {useEffect, useState} from 'react';
import {t} from '@lingui/macro';
import classNames from 'classnames';
import {isConsentBannerEnabled, isEmbedded, openCookieSettings} from '../../../utilites/cookieConsent';
import classes from './CookieSettingsLink.module.scss';

export const CookieSettingsLink = ({className}: { className?: string }) => {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        setHidden(isEmbedded());
    }, []);

    if (hidden || !isConsentBannerEnabled()) return null;

    return (
        <button type="button" className={classNames(classes.link, className)} onClick={openCookieSettings}>
            {t`Cookie settings`}
        </button>
    );
};
