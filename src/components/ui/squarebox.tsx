import { ReactNode } from "react";

export default function SquareBox({
  bg,
  height,
  width,
  children,
}: {
  bg: string;
  height: string;
  width: string;
  children: ReactNode;
}) {
  return (
    <div
        style={{
            backgroundColor: bg,
            height: height,
            width: width,
        }}
        className="rounded-3xl border-[#dfe6e9] border-[1px]"
    >
      {children}
    </div>
  );
}
