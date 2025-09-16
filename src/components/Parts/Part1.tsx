import { Button } from "@/components/ui/button";
import SquareBox from "@/components/ui/squarebox";

export default function Part1() {
    return <div className="bg-[#0f0f0f] min-h-screen py-28 px-4 sm:px-6 lg:px-8">
        <div>
            <div className="h-auto w-full flex flex-col gap-6 lg:gap-8 lg:flex-row">
                <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="1vh" paddingy="6vh">
                    <div className="px-4 sm:px-6 lg:px-8 flex flex-col justify-center" >
                        <div className="leading-none font-bold italic my-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl">
                            Sports Community
                        </div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold my-2">
                            Share your passion, follow your favorite sports, and connect with fans during live matches.
                        </div>
                        <div className="flex my-2 gap-2 flex-wrap">
                            <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="2vw">Hi there</SquareBox>
                            <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="2vw">Hi there</SquareBox>
                            <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="2vw">Hi there</SquareBox>
                        </div>
                    </div>
                </SquareBox>
                <div className="flex h-auto flex-col justify-between gap-4 lg:gap-0">
                    <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="auto">
                        <div className="py-4 px-4 sm:px-6 lg:px-10 flex flex-col gap-2 items-center justify-center" >
                            <div className="font-bold italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white">
                                Live
                            </div>
                            <div className="font-semibold my-2 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center text-[#d1d5db]">
                                Real-time discussions during matches
                            </div>
                            <div className="flex my-2 gap-2 flex-wrap justify-center">
                                <SquareBox bg="#181818" height="auto" width="auto" paddingx="2vw">
                                    <div className="font-bold px-12 text-lg sm:text-xl lg:text-2xl text-[#f35730]">
                                        10
                                    </div>
                                    <div className="text-xs sm:text-sm text-[#9ca3af]">
                                        Sports
                                    </div>
                                </SquareBox>
                                <SquareBox bg="#181818" height="auto" width="auto" paddingx="2vw">
                                    <div className="font-bold px-10 py-3 text-lg sm:text-xl lg:text-2xl text-[#3b82f6]">
                                        24/7
                                    </div>
                                    <div className="text-xs sm:text-sm text-[#9ca3af]">
                                        Active
                                    </div>
                                </SquareBox>
                            </div>
                        </div>
                    </SquareBox>
                    <div className="mt-4 lg:mt-0">
                        <SquareBox bg="#0f0f0f" height="auto" width="auto">
                            <div className="px-4 sm:px-6 lg:px-10 py-2" >
                                <div className="flex gap-2 items-center text-base sm:text-lg lg:text-xl font-semibold text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-[#f35730]">
                                        <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z" clipRule="evenodd" />
                                    </svg>
                                    Trending Now
                                </div>
                                <div className="text-sm sm:text-base lg:text-lg text-[#d1d5db]">
                                    Join thousands of fans discussing live matches and sharing their passion for sports.
                                </div>
                            </div>
                        </SquareBox>
                    </div>
                </div>
            </div>
            <div className="mt-8 lg:mt-12">
                <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="0vh">
                    <div className="px-4 sm:px-6 lg:px-10 py-6" >
                        <div className="flex justify-center leading-none font-bold italic my-4 text-lg sm:text-2xl md:text-2xl lg:text-3xl text-center">
                            Ready to Join the Action?
                        </div>
                        <div className="flex justify-center font-semibold my-4 text-[#c6c9ce] text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center px-4">
                            Connect with fellow sports enthusiasts and never miss a moment of the excitement
                        </div>
                        <div className="flex justify-center">
                            <Button variant={"destructive"} className="w-full max-w-xs sm:max-w-sm lg:max-w-md h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg mt-6">
                                <a className="flex gap-2 items-center justify-center" href="/auth/v1/signin">
                                    Get Started Today
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                                        <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                    </svg>
                                </a>
                            </Button>
                        </div>
                    </div>
                </SquareBox>
            </div>
        </div>
    </div>
}