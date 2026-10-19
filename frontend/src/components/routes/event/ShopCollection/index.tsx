import {useState} from "react";
import {useParams} from "react-router";
import {t} from "@lingui/macro";
import {Button, Checkbox, Group, Tabs, Text} from "@mantine/core";
import {IconMailForward, IconPackageExport, IconPrinter} from "@tabler/icons-react";
import {CollectionStatus, IdParam, ShopPickListRow} from "../../../../types.ts";
import {PageBody} from "../../../common/PageBody";
import {PageTitle} from "../../../common/PageTitle";
import {Card} from "../../../common/Card";
import {TableSkeleton} from "../../../common/TableSkeleton";
import {useGetShopPickList} from "../../../../queries/useGetShopPickList.ts";
import {OrderCollectionAction, useUpdateOrderCollection} from "../../../../mutations/useUpdateOrderCollection.ts";
import {showError, showSuccess} from "../../../../utilites/notifications.tsx";
import {collectionStatusLabel} from "../../../../constants/shop.ts";
import {ShopPickListTable} from "../ShopPickListPrint/ShopPickListTable.tsx";

const TABS: CollectionStatus[] = ['PENDING', 'READY', 'COLLECTED'];

const ShopCollection = () => {
    const {eventId} = useParams();
    const [status, setStatus] = useState<CollectionStatus>('PENDING');
    const [selected, setSelected] = useState<IdParam[]>([]);
    const pickListQuery = useGetShopPickList(eventId as IdParam, status);
    const updateMutation = useUpdateOrderCollection();
    const rows = pickListQuery.data ?? [];

    const handleStatusChange = (value: string | null) => {
        setStatus((value ?? 'PENDING') as CollectionStatus);
        setSelected([]);
    };

    const toggle = (orderId: IdParam) => {
        setSelected((current) => current.includes(orderId)
            ? current.filter((id) => id !== orderId)
            : [...current, orderId]);
    };

    const toggleAll = () => {
        setSelected(selected.length === rows.length ? [] : rows.map((row) => row.order_id));
    };

    const handleUpdate = (action: OrderCollectionAction) => {
        updateMutation.mutate({eventId: eventId as IdParam, orderIds: selected, action}, {
            onSuccess: ({updated}) => {
                setSelected([]);
                showSuccess(action === 'ready'
                    ? t`${updated} orders marked ready and buyers emailed`
                    : t`${updated} orders marked collected`);
            },
            onError: () => showError(t`Something went wrong. Please try again.`),
        });
    };

    const printUrl = `/manage/event/${eventId}/collection/print?collection_status=${status}`;

    return (
        <PageBody>
            <PageTitle subheading={t`Orders are collected from school reception using the student name.`}>
                {t`Collection`}
            </PageTitle>

            <Tabs value={status} onChange={handleStatusChange}>
                <Tabs.List mb="md">
                    {TABS.map((tab) => (
                        <Tabs.Tab key={tab} value={tab} data-testid={`collection-tab-${tab.toLowerCase()}`}>
                            {collectionStatusLabel(tab)}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            <Group mb="md">
                {status === 'PENDING' && (
                    <Button
                        leftSection={<IconMailForward size={16}/>}
                        disabled={selected.length === 0}
                        loading={updateMutation.isPending}
                        onClick={() => handleUpdate('ready')}
                        data-testid="collection-mark-ready-button"
                    >
                        {t`Mark ready and email buyer`}
                    </Button>
                )}
                {status !== 'COLLECTED' && (
                    <Button
                        variant="light"
                        leftSection={<IconPackageExport size={16}/>}
                        disabled={selected.length === 0}
                        loading={updateMutation.isPending}
                        onClick={() => handleUpdate('collected')}
                        data-testid="collection-mark-collected-button"
                    >
                        {t`Mark collected`}
                    </Button>
                )}
                <Button
                    variant="default"
                    component="a"
                    href={printUrl}
                    target="_blank"
                    leftSection={<IconPrinter size={16}/>}
                    data-testid="collection-print-button"
                >
                    {t`Print pick list`}
                </Button>
            </Group>

            <TableSkeleton isVisible={pickListQuery.isLoading}/>

            {pickListQuery.isFetched && rows.length === 0 && (
                <Card>
                    <Text ta="center" c="dimmed">{t`No orders here yet.`}</Text>
                </Card>
            )}

            {rows.length > 0 && (
                <Card>
                    <ShopPickListTable
                        rows={rows}
                        renderSelect={(row: ShopPickListRow) => (
                            <Checkbox
                                checked={selected.includes(row.order_id)}
                                onChange={() => toggle(row.order_id)}
                                aria-label={t`Select order`}
                            />
                        )}
                        renderSelectAll={() => (
                            <Checkbox
                                checked={selected.length === rows.length}
                                indeterminate={selected.length > 0 && selected.length < rows.length}
                                onChange={toggleAll}
                                aria-label={t`Select all`}
                            />
                        )}
                    />
                </Card>
            )}
        </PageBody>
    );
};

export default ShopCollection;
