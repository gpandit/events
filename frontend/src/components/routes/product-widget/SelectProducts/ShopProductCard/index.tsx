import {useState} from "react";
import {t} from "@lingui/macro";
import {Modal} from "@mantine/core";
import {IconInfoCircle} from "@tabler/icons-react";
import {UseFormReturnType} from "@mantine/form";
import {Event, Product} from "../../../../../types.ts";
import {UserGeneratedContent} from "../../../../common/UserGeneratedContent";
import {TieredPricing} from "../Prices/Tiered";
import {ProductGallery} from "../ProductGallery";

interface ShopProductCardProps {
    product: Product;
    event: Event;
    form: UseFormReturnType<any>;
    productIndex: number;
    eventOccurrenceId?: number;
}

export const ShopProductCard = ({product, event, form, productIndex, eventOccurrenceId}: ShopProductCardProps) => {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const mainImage = product.images?.[0];
    const isSimpleProduct = product.type !== 'TIERED' && (product.prices?.length ?? 0) === 1;
    const hasDetails = !!product.description || (product.images?.length ?? 0) > 1;

    return (
        <article className={'hi-shop-card'} data-has-image={!!mainImage || undefined}
                 data-testid={`shop-product-card-${product.id}`}>
            {mainImage && (
                <img className={'hi-shop-card-image'} src={mainImage.url} alt={product.title} loading={'lazy'}/>
            )}
            <div className={'hi-shop-card-shade'}/>

            <div className={'hi-shop-card-overlay'}>
                <div className={'hi-shop-card-heading'}>
                    <h3 className={'hi-shop-card-title'}>{product.title}</h3>
                    {hasDetails && (
                        <button type={'button'} className={'hi-shop-card-details-button'}
                                data-testid={`shop-product-details-${product.id}`}
                                onClick={() => setDetailsOpen(true)}>
                            <IconInfoCircle size={16}/>
                            {t`Details`}
                        </button>
                    )}
                </div>

                <div className={'hi-shop-card-panel'}>
                    <TieredPricing
                        productIndex={productIndex}
                        event={event}
                        product={product}
                        form={form}
                        eventOccurrenceId={eventOccurrenceId}
                        displayMode={isSimpleProduct ? 'header' : 'list'}
                    />
                </div>
            </div>

            <Modal opened={detailsOpen} onClose={() => setDetailsOpen(false)} title={product.title} size={'lg'}
                   centered>
                {!!product.images?.length && <ProductGallery images={product.images} alt={product.title}/>}
                {product.description && <UserGeneratedContent html={product.description}/>}
            </Modal>
        </article>
    );
};
