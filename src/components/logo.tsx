import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

type LogoProps = {
  styles?: string;
  width: number;
  hieght: number;
};
export const Logo: FC<LogoProps> = ({ styles, width = 120, hieght=60 }) => {
  return (
    <div className={`${styles} flex items-center gap-2`}>
      <Link href="/" className="">
        <div className="font-black tracking-tighter text-md leading-none flex flex-col justify-center items-start uppercase">
          <Image
            src="/gada_pass.png"
            alt="Gada Logo"
            width={width}
            height={hieght}
          />
        </div>
      </Link>
    </div>
  );
};
