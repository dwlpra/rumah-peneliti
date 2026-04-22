import dynamic from 'next/dynamic';

const NFTGalleryContent = dynamic(() => import('./NFTGalleryContent'), { ssr: false });

export default function NFTGalleryPage() {
  return <NFTGalleryContent />;
}
