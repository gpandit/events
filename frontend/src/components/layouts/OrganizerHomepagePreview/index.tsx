import {LoadingMask} from "../../common/LoadingMask";
import OrganizerHomepage from "../OrganizerHomepage";
import {useOrganizerPreview} from "../OrganizerPagePreview/useOrganizerPreview.ts";

const OrganizerHomepagePreview = () => {
    const {isLoading, organizer, eventsData} = useOrganizerPreview();

    if (isLoading) {
        return <LoadingMask/>;
    }

    if (!organizer) {
        return null;
    }

    return <OrganizerHomepage
        organizer={organizer}
        eventsData={eventsData}
        isPastEvents={false}
    />;
};

export default OrganizerHomepagePreview;
