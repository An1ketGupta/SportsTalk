import { Radius } from "lucide-react";
import { ReactNode } from "react";

export default function SquareBox({
  bg,
  height,
  width,
  paddingx,
  paddingy,
  rounded,
  children,
}: {
  bg: string;
  height: string;
  width: string;
  paddingx?: string;
  paddingy?: string;
  rounded?: string;
  children: ReactNode;
}) {
  return (
    <div
        style={{
            backgroundColor: bg,
            height: height,
            width: width,
            paddingLeft: paddingx,
            paddingRight: paddingx,
            paddingBottom: paddingy,
            paddingTop: paddingy
        }}
        className={`text-white flex flex-col justify-center items-center py-2 border-white border border-opacity-20 ${rounded ? `rounded-${rounded}` : 'rounded-3xl'}`}
    >
      {children}
    </div>
  );
}
