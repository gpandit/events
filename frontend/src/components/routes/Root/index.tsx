import {useEffect, useState} from "react";
import {Navigate, useLoaderData} from "react-router";
import {useGetMe} from "../../../queries/useGetMe.ts";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import OrganizerHomepage from "../../layouts/OrganizerHomepage";

export const Root = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData: GenericPaginatedResponse<Event> | null;
        isPastEvents: boolean;
    } | undefined;

    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const me = useGetMe();

    useEffect(() => {
        if (me.isFetched) {
            const searchParams = typeof window !== 'undefined' ? window.location.search : '';
            if (me.isSuccess) {
                setRedirectPath("/manage/events" + searchParams);
            } else if (!loaderData?.organizer) {
                setRedirectPath("/auth/login" + searchParams);
            }
        }
    }, [me.isFetched, me.isSuccess, loaderData]);

    if (redirectPath) {
        return <Navigate to={redirectPath} replace={true}/>;
    }

    if (me.isFetched && !me.isSuccess && loaderData?.organizer) {
        return (
            <OrganizerHomepage
                organizer={loaderData.organizer}
                eventsData={loaderData.eventsData ?? undefined}
                isPastEvents={loaderData.isPastEvents}
            />
        );
    }

    return null;
};

export default Root;
