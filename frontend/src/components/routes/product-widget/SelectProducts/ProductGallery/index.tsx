import {useState} from "react";
import {Image} from "../../../../../types.ts";

interface ProductGalleryProps {
    images: Image[];
    alt: string;
}

export const ProductGallery = ({images, alt}: ProductGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return null;
    }

    const active = images[Math.min(activeIndex, images.length - 1)];

    return (
        <div className={'hi-product-gallery'}>
            <img className={'hi-product-gallery-main'} src={active.url} alt={alt} loading={'lazy'}/>
            {images.length > 1 && (
                <div className={'hi-product-gallery-thumbs'}>
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            type={'button'}
                            className={'hi-product-gallery-thumb'}
                            data-active={index === activeIndex || undefined}
                            onClick={() => setActiveIndex(index)}
                        >
                            <img src={image.url} alt={alt} loading={'lazy'}/>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
