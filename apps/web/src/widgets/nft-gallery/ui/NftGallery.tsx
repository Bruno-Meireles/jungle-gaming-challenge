import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type GalleryImage = { src: string; width: number; height: number };

export type NftGalleryProps = {
  title: string;
  images: readonly GalleryImage[];
};

export function NftGallery({ title, images }: NftGalleryProps) {
  const { t } = useTranslation(['nftGallery', 'nft']);
  const [current, setCurrent] = useState(0);
  const main = images[current] ?? images[0];
  if (!main) return null;
  return (
    <div className="flex flex-col gap-16">
      <img
        src={main.src}
        width={main.width}
        height={main.height}
        alt={t('nft:image.alt', { title })}
        className="aspect-square h-auto w-full rounded-22 object-cover"
      />
      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-12">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                aria-label={t('nftGallery:view', { index: index + 1, count: images.length })}
                aria-pressed={index === current}
                onClick={() => setCurrent(index)}
                className="block cursor-pointer rounded-8 border-2 border-transparent p-0 aria-pressed:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <img src={image.src} alt="" width={image.width} height={image.height} className="size-72 rounded-6 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
