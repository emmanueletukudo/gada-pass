import Link from "next/link";
import { FC } from "react";

type LogoProps = {
  styles?: string;
};
export const Logo: FC<LogoProps> = ({styles}) => {
  return (
    <div className={`${styles} flex items-center gap-2`}>
      <Link
        href="/"
        className=""
      >

        <div className="bg-black px-3 py-1.5 font-black tracking-tighter text-white text-md leading-none flex flex-col justify-center items-start uppercase shadow-md shadow-black/20">
          <span>GADA</span>
          <span>PASS</span>
        </div>
      </Link>
    </div>
  );
};
