import {t} from "@lingui/macro";
import {Badge, Button, Skeleton} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import {NavLink, useParams} from "react-router";
import {Event, IdParam, QueryFilterOperator} from "../../../../types.ts";
import {PageBody} from "../../../common/PageBody";
import {PageTitle} from "../../../common/PageTitle";
import {ToolBar} from "../../../common/ToolBar";
import {Card} from "../../../common/Card";
import {CreateShopModal} from "../../../modals/CreateShopModal";
import {useGetEvents} from "../../../../queries/useGetEvents.ts";
import {shopCategoryLabel, shopVendorTypeLabel} from "../../../../constants/shop.ts";
import classes from "./Shops.module.scss";

const Shops = () => {
    const {organizerId} = useParams();
    const [createModalOpen, {open: openCreateModal, close: closeCreateModal}] = useDisclosure(false);
    const shopsQuery = useGetEvents({
        pageNumber: 1,
        perPage: 100,
        filterFields: {
            is_shop: {operator: QueryFilterOperator.Equals, value: 'true'},
            organizer_id: {operator: QueryFilterOperator.Equals, value: String(organizerId)},
        },
    });
    const shops = shopsQuery.data?.data;

    return (
        <PageBody>
            <PageTitle subheading={t`Uniform, books, stationery and meals sold by the school and its vendors. Orders are collected from school reception.`}>
                {t`Shops`}
            </PageTitle>
            <ToolBar resultCount={shopsQuery.data?.meta?.total} resultLabel={t`shops`}>
                <Button color="green" rightSection={<IconPlus/>} onClick={openCreateModal} data-testid="shop-create-button">
                    {t`Create shop`}
                </Button>
            </ToolBar>

            {!shopsQuery.isFetched && <Skeleton height={90}/>}

            {shopsQuery.isFetched && shops?.length === 0 && (
                <p className={classes.empty}>{t`No shops yet. Create one for each vendor or school shop.`}</p>
            )}

            {shops?.map((shop: Event) => (
                <Card key={shop.id} className={classes.shop}>
                    <NavLink to={`/manage/event/${shop.id}/dashboard`} className={classes.shopLink}>
                        <div>
                            <h3 className={classes.shopTitle}>{shop.title}</h3>
                            <div className={classes.badges}>
                                {shop.shop_category && <Badge variant="light">{shopCategoryLabel(shop.shop_category)}</Badge>}
                                {shop.vendor_type && <Badge variant="outline">{shopVendorTypeLabel(shop.vendor_type)}</Badge>}
                                <Badge color={shop.status === 'LIVE' ? 'green' : 'gray'}>{shop.status}</Badge>
                            </div>
                        </div>
                    </NavLink>
                </Card>
            ))}

            {createModalOpen && <CreateShopModal organizerId={organizerId as IdParam} onClose={closeCreateModal}/>}
        </PageBody>
    );
};

export default Shops;
