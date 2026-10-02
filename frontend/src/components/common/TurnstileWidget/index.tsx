import {useEffect, useRef} from 'react';
import {getConfig} from '../../../utilites/config.ts';

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: Record<string, unknown>) => string;
            remove: (widgetId: string) => void;
        };
    }
}

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileWidgetProps {
    onToken: (token: string | null) => void;
}

export const TurnstileWidget = ({onToken}: TurnstileWidgetProps) => {
    const siteKey = getConfig('VITE_TURNSTILE_SITE_KEY');
    const containerRef = useRef<HTMLDivElement>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    useEffect(() => {
        if (!siteKey || !containerRef.current) {
            return;
        }

        const container = containerRef.current;
        let widgetId: string | undefined;

        const renderWidget = () => {
            if (!window.turnstile || widgetId) {
                return;
            }

            widgetId = window.turnstile.render(container, {
                sitekey: siteKey,
                callback: (token: string) => onTokenRef.current(token),
                'expired-callback': () => onTokenRef.current(null),
                'error-callback': () => onTokenRef.current(null),
            });
        };

        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.id = SCRIPT_ID;
            script.src = SCRIPT_SRC;
            script.async = true;
            document.head.appendChild(script);
        }

        if (window.turnstile) {
            renderWidget();
        } else {
            script.addEventListener('load', renderWidget);
        }

        return () => {
            script?.removeEventListener('load', renderWidget);
            if (widgetId && window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [siteKey]);

    if (!siteKey) {
        return null;
    }

    return <div ref={containerRef}/>;
};

export default TurnstileWidget;
