import {t} from "@lingui/macro";

export const getUserRoleLabel = (role: string) => {
    switch (role) {
        case 'SUPERADMIN':
            return t`Platform admin`;
        case 'ADMIN':
            return t`School admin`;
        case 'ORGANIZER':
            return t`Organizer`;
        default:
            return role;
    }
};
