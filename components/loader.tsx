import Image from 'next/image';
import { cn } from '@/lib/utils';
import { logo } from '@/app/assets/asset';

interface LoaderProps {
  fullPage?: boolean;
}

const Loader = ({ fullPage = false }: LoaderProps) => {
  return (
    <div
      className={cn(
        fullPage &&
          'w-full h-dvh absolute top-0 left-0 default-bg-color grid place-items-center z-30',
      )}
    >
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-primary"></div>
        <Image
          src={logo}
          alt="Logo"
          className="rounded-full w-24 h-24 animate-app-ping"
        />
      </div>
    </div>
  );
};

export default Loader;
