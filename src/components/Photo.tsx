import type { ImgHTMLAttributes } from 'react'
import type { PhotoAsset } from '../content/home'

type PhotoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  image: PhotoAsset
}

/** Full-bleed image that fills its parent; crop is controlled by the asset focal point. */
export function Photo({ image, className, style, ...rest }: PhotoProps) {
  return (
    <img
      {...rest}
      className={className ? `photo ${className}` : 'photo'}
      src={image.src}
      alt={image.alt}
      style={{ objectPosition: image.focus, ...style }}
      decoding="async"
      draggable={false}
    />
  )
}
