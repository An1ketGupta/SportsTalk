"use client";

import { useRef } from "react";
import Lottie from "lottie-react";
import footballAnimation from "../ui/animations/football Goal.json";
import categoryanimation from "../ui/animations/Design icon.json";
import chatanimation from "../ui/animations/Chat.json";

export default function CategorySection() {
  const lottieRef = useRef<any>(null);

  return (
    <div className="hidden md:flex gap-4">
      <a
        className="flex justify-center gap-2 items-center hover:bg-[#515a67] h-[5vh] py-1 px-4 text-lg rounded-lg"
        href="/"
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={categoryanimation}
          loop
          autoplay={true}
          className="w-[45px] h-[60px]"
        />
        Categories
      </a>
      <a
        className="flex justify-center gap-2 items-center hover:bg-[#515a67] h-[5vh] py-1 px-4 text-lg rounded-lg"
        href="/"
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={chatanimation}
          loop
          autoplay={true}
          className="w-[35px] h-[40px]"
        />
        Community
      </a>
      <a
        className="text-white flex justify-center gap-2 items-center hover:bg-[#515a67] h-[5vh] py-1 px-4 text-lg rounded-lg"
        href="/"
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={footballAnimation}
          loop
          autoplay={true}
          className="w-[25px] h-[20px]"
        />
        Live Matches
      </a>
    </div>
  );
}
