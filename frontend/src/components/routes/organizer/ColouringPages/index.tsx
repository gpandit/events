import {useParams} from 'react-router';
import {t} from '@lingui/macro';
import {PageBody} from '../../../common/PageBody';
import {PageTitle} from '../../../common/PageTitle';
import {IdParam} from '../../../../types.ts';
import {useIsCurrentUserAdmin} from '../../../../hooks/useIsCurrentUserAdmin.ts';
import {ColouringPagesManager} from './ColouringPagesManager.tsx';

export default function ColouringPages() {
    const {organizerId} = useParams();
    const canManage = useIsCurrentUserAdmin();

    return (
        <PageBody>
            <PageTitle>{t`Colouring pages`}</PageTitle>
            <ColouringPagesManager scope={organizerId as IdParam} canManage={canManage}/>
        </PageBody>
    );
}
