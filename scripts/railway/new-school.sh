#!/usr/bin/env bash
set -euo pipefail

usage() {
    echo "Usage: $0 <env-name> --school \"School name\" --domain school.example.com --support-email a@b.c \\"
    echo "          [--from staging] [--app-service app] [--mail-from a@b.c] [--cc-email a@b.c]"
    echo "          [--instagram handle] [--google-tag G-XXXX] [--share-image /logos/x.png] [--organizer-id 1]"
    echo
    echo "Secrets are read from the environment: APP_KEY JWT_SECRET STRIPE_SECRET_KEY STRIPE_PUBLIC_KEY"
    echo "  STRIPE_WEBHOOK_SECRET VITE_STRIPE_PUBLISHABLE_KEY MAIL_HOST MAIL_PORT MAIL_USERNAME MAIL_PASSWORD"
    exit 1
}

[ $# -ge 1 ] || usage
ENV_NAME="$1"; shift

FROM_ENV="staging"
APP_SERVICE="app"
SCHOOL_NAME=""; DOMAIN=""; SUPPORT_EMAIL=""; MAIL_FROM=""; CC_EMAIL=""
INSTAGRAM=""; GOOGLE_TAG=""; SHARE_IMAGE="/logos/friends-of-repton-logo.png"; ORGANIZER_ID=""

while [ $# -gt 0 ]; do
    case "$1" in
        --from) FROM_ENV="$2" ;;
        --app-service) APP_SERVICE="$2" ;;
        --school) SCHOOL_NAME="$2" ;;
        --domain) DOMAIN="$2" ;;
        --support-email) SUPPORT_EMAIL="$2" ;;
        --mail-from) MAIL_FROM="$2" ;;
        --cc-email) CC_EMAIL="$2" ;;
        --instagram) INSTAGRAM="$2" ;;
        --google-tag) GOOGLE_TAG="$2" ;;
        --share-image) SHARE_IMAGE="$2" ;;
        --organizer-id) ORGANIZER_ID="$2" ;;
        *) usage ;;
    esac
    shift 2
done

[ -n "$SCHOOL_NAME" ] && [ -n "$DOMAIN" ] && [ -n "$SUPPORT_EMAIL" ] || usage
MAIL_FROM="${MAIL_FROM:-$SUPPORT_EMAIL}"
CC_EMAIL="${CC_EMAIL:-$SUPPORT_EMAIL}"

for secret in APP_KEY JWT_SECRET STRIPE_SECRET_KEY STRIPE_PUBLIC_KEY STRIPE_WEBHOOK_SECRET VITE_STRIPE_PUBLISHABLE_KEY; do
    [ -n "${!secret:-}" ] || { echo "Missing required secret: $secret" >&2; exit 1; }
done

HERE="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE="$HERE/../../railway/school.env.template"

args=()
while IFS= read -r line; do
    case "$line" in ''|'#'*) continue ;; esac
    line="${line//\{\{SCHOOL_NAME\}\}/$SCHOOL_NAME}"
    line="${line//\{\{DOMAIN\}\}/$DOMAIN}"
    line="${line//\{\{SUPPORT_EMAIL\}\}/$SUPPORT_EMAIL}"
    line="${line//\{\{MAIL_FROM_ADDRESS\}\}/$MAIL_FROM}"
    line="${line//\{\{SITE_CONTACT_EMAIL\}\}/$SUPPORT_EMAIL}"
    line="${line//\{\{SITE_CONTACT_CC_EMAIL\}\}/$CC_EMAIL}"
    line="${line//\{\{INSTAGRAM_HANDLE\}\}/$INSTAGRAM}"
    line="${line//\{\{GOOGLE_TAG_ID\}\}/$GOOGLE_TAG}"
    line="${line//\{\{SHARE_IMAGE_PATH\}\}/$SHARE_IMAGE}"
    line="${line//\{\{DEFAULT_ORGANIZER_ID\}\}/$ORGANIZER_ID}"
    args+=(--set "$line")
done < "$TEMPLATE"

for secret in APP_KEY JWT_SECRET STRIPE_SECRET_KEY STRIPE_PUBLIC_KEY STRIPE_WEBHOOK_SECRET VITE_STRIPE_PUBLISHABLE_KEY MAIL_HOST MAIL_PORT MAIL_USERNAME MAIL_PASSWORD; do
    [ -n "${!secret:-}" ] && args+=(--set "$secret=${!secret}")
done

railway environment new "$ENV_NAME" --copy "$FROM_ENV"
railway variables --service "$APP_SERVICE" --environment "$ENV_NAME" "${args[@]}"

echo "Environment '$ENV_NAME' created from '$FROM_ENV' with Postgres, Redis and all variables."
echo "Next: attach the custom domain $DOMAIN to the '$APP_SERVICE' service, deploy, create the organizer, then set VITE_DEFAULT_ORGANIZER_ID."
