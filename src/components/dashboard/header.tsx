import { Logo } from "@/components/logo";
import { Menu } from "lucide-react";
import { FC } from "react";

type HeaderProps = {
  active: string;
  online: boolean;
  onMenuToggle?: () => void;
};
export const Header: FC<HeaderProps> = ({active, online, onMenuToggle}) => {
    return (
      <header className="flex items-center justify-between border-b border-[#dce1d5] bg-[#fffef9] px-5 py-4 md:px-10">
        <Logo styles="lg:hidden mx-w-xl" />
        <div className="hidden text-sm text-[#6d766d] lg:block">
          Workspace /{' '}
          <span className="font-semibold text-[#17211b]">{active}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${online ? 'bg-[#e8f5c5] text-[#416000]' : 'bg-[#ffe2dc] text-[#a13c2d]'}`}
          >
            {online ? '● Online' : '● Offline mode'}
          </span>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-[#dce1d5]">
            ⌄
          </button>
          <button
            onClick={onMenuToggle}
            className="rounded-xl border border-[#dce1d5] p-2.5 lg:hidden hover:bg-[#17211b]/5"
          >
            <Menu className="h-5 w-5 text-[#17211b]" />
          </button>
        </div>
      </header>
    );
}