import {useEffect} from "react";
import {useParams, useSearchParams} from "react-router";
import {t} from "@lingui/macro";
import {CollectionStatus, IdParam} from "../../../../types.ts";
import {useGetEvent} from "../../../../queries/useGetEvent.ts";
import {useGetShopPickList} from "../../../../queries/useGetShopPickList.ts";
import {collectionStatusLabel} from "../../../../constants/shop.ts";
import {ShopPickListTable} from "./ShopPickListTable.tsx";
import classes from "./ShopPickListPrint.module.scss";

const COLLECTION_STATUSES: CollectionStatus[] = ['PENDING', 'READY', 'COLLECTED'];

const ShopPickListPrint = () => {
    const {eventId} = useParams();
    const [searchParams] = useSearchParams();
    const requestedStatus = searchParams.get('collection_status') as CollectionStatus;
    const status = COLLECTION_STATUSES.includes(requestedStatus) ? requestedStatus : 'PENDING';
    const {data: event} = useGetEvent(eventId as IdParam);
    const pickListQuery = useGetShopPickList(eventId as IdParam, status);

    useEffect(() => {
        if (pickListQuery.isFetched && event) {
            setTimeout(() => window?.print(), 500);
        }
    }, [pickListQuery.isFetched, event]);

    if (!event || !pickListQuery.data) {
        return null;
    }

    return (
        <div className={classes.container}>
            <h2 className={classes.title}>{t`Pick list`} - {event.title}</h2>
            <p className={classes.subtitle}>
                {collectionStatusLabel(status)} - {new Date().toLocaleDateString()} - {pickListQuery.data.length} {t`orders`}
            </p>
            <ShopPickListTable rows={pickListQuery.data}/>
        </div>
    );
};

export default ShopPickListPrint;
