"use client";
import { useRef } from "react";
import Lottie from "lottie-react";
import footballAnimation from "./ui/animations/football Goal.json";
import categoryanimation from "./ui/animations/Design icon.json";
import chatanimation from "./ui/animations/Chat.json";
import SignIn from "./ui/signin";

export default function NavBar() {
  const lottieRef = useRef<any>(null);
    return <div className="w-full px-[2vw] bg-black/20 backdrop-blur-md border-b border-white/10 h-[10vh] text-white flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <a href="/" className="flex items-center gap-1 text-2xl font-bold italic">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
            </svg>
            SportsTalk
        </a>
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
                href="/foryou"
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
                href="/livematches"
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
        <SignIn/>
    </div>
}