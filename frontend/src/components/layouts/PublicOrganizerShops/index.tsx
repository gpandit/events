import {Link, useLoaderData} from "react-router";
import {t} from "@lingui/macro";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import {SHOP_CATEGORIES, shopCategoryLabel, shopVendorTypeLabel} from "../../../constants/shop.ts";
import {eventHomepagePath} from "../../../utilites/urlHelper.ts";
import classes from './PublicOrganizerShops.module.scss';

export const PublicOrganizerShops = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        shopsData: GenericPaginatedResponse<Event> | null;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    const shops = loaderData.shopsData?.data ?? [];

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="shops">
            <div className={classes.page}>
                <h1 className={classes.title}>{t`School Shop`}</h1>
                <p className={classes.intro}>
                    {t`Order uniform, books, stationery and meals. Everything is collected from school reception - please give your child's name when you order.`}
                </p>

                {shops.length === 0 && <p className={classes.empty}>{t`No shops are open yet. Please check back soon.`}</p>}

                {SHOP_CATEGORIES.map((category) => {
                    const categoryShops = shops.filter((shop) => shop.shop_category === category);
                    if (categoryShops.length === 0) {
                        return null;
                    }

                    return (
                        <section key={category} className={classes.section} data-testid={`shop-section-${category.toLowerCase()}`}>
                            <h2 className={classes.sectionTitle}>{shopCategoryLabel(category)}</h2>
                            <div className={classes.grid}>
                                {categoryShops.map((shop) => {
                                    const cover = shop.images?.find((image) => image.type === 'EVENT_COVER');
                                    return (
                                        <Link key={shop.id} to={eventHomepagePath(shop)} className={classes.card}>
                                            {cover && <img src={cover.url} alt="" className={classes.cover}/>}
                                            <div className={classes.cardBody}>
                                                <h3 className={classes.cardTitle}>{shop.title}</h3>
                                                {shop.vendor_type && (
                                                    <span className={classes.vendor}>{shopVendorTypeLabel(shop.vendor_type)}</span>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </OrganizerPageShell>
    );
};

export default PublicOrganizerShops;
