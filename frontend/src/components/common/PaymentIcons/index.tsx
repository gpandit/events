import {t} from "@lingui/macro";
import classes from './PaymentIcons.module.scss';

const VisaIcon = () => (
    <svg viewBox="0 0 48 30" className={classes.icon} role="img" aria-label="Visa">
        <rect width="48" height="30" rx="4" fill="#1A1F71"/>
        <text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontStyle="italic"
              fontSize="13" fill="#ffffff">VISA
        </text>
    </svg>
);

const MastercardIcon = () => (
    <svg viewBox="0 0 48 30" className={classes.icon} role="img" aria-label="Mastercard">
        <rect width="48" height="30" rx="4" fill="#16161a"/>
        <circle cx="20" cy="15" r="9" fill="#EB001B"/>
        <circle cx="28" cy="15" r="9" fill="#F79E1B" fillOpacity="0.9"/>
    </svg>
);

const AmexIcon = () => (
    <svg viewBox="0 0 48 30" className={classes.icon} role="img" aria-label="American Express">
        <rect width="48" height="30" rx="4" fill="#2E77BC"/>
        <text x="24" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9.5"
              fill="#ffffff">AMEX
        </text>
    </svg>
);

const ApplePayIcon = () => (
    <svg viewBox="0 0 48 30" className={classes.icon} role="img" aria-label="Apple Pay">
        <rect width="48" height="30" rx="4" fill="#000000"/>
        <text x="24" y="19" textAnchor="middle" fontFamily="-apple-system, Arial, sans-serif" fontWeight="600"
              fontSize="9.5" fill="#ffffff"> Pay
        </text>
    </svg>
);

const GooglePayIcon = () => (
    <svg viewBox="0 0 48 30" className={classes.icon} role="img" aria-label="Google Pay">
        <rect width="48" height="30" rx="4" fill="#ffffff" stroke="#dadce0"/>
        <text x="24" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9"
              fill="#5F6368">
            <tspan fill="#4285F4">G</tspan>
            <tspan fill="#5F6368"> Pay</tspan>
        </text>
    </svg>
);

const StripeIcon = () => (
    <svg viewBox="0 0 48 30" className={classes.icon} role="img" aria-label="Stripe">
        <rect width="48" height="30" rx="4" fill="#635BFF"/>
        <text x="24" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9.5"
              fill="#ffffff">stripe
        </text>
    </svg>
);

export const PaymentIcons = () => {
    return (
        <div className={classes.wrapper}>
            <span className={classes.label}>{t`We accept`}</span>
            <div className={classes.icons}>
                <VisaIcon/>
                <MastercardIcon/>
                <AmexIcon/>
                <ApplePayIcon/>
                <GooglePayIcon/>
                <StripeIcon/>
            </div>
        </div>
    );
};

export default PaymentIcons;
