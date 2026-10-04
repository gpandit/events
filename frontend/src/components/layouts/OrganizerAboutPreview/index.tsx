import {LoadingMask} from "../../common/LoadingMask";
import {OrganizerAboutPage} from "../PublicOrganizerAbout/OrganizerAboutPage.tsx";
import {useOrganizerPreview} from "../OrganizerPagePreview/useOrganizerPreview.ts";

const OrganizerAboutPreview = () => {
    const {isLoading, organizer} = useOrganizerPreview();

    if (isLoading) {
        return <LoadingMask/>;
    }

    if (!organizer) {
        return null;
    }

    return <OrganizerAboutPage organizer={organizer}/>;
};

export default OrganizerAboutPreview;
