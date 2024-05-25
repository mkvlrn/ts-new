/**
 * this exists because pure ESM support in next is terrible
 */

declare module 'next/image.js' {
  import { Image as ImageComponent } from 'next/dist/client/image-component.js';

  // eslint-disable-next-line unicorn/prefer-export-from
  export default ImageComponent;
}
