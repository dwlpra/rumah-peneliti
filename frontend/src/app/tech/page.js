import dynamic from 'next/dynamic';
const TechContent = dynamic(() => import('./TechContent'), { ssr: false });
export default function TechPage() { return <TechContent />; }
