import categories from "@/public/categoryinfo.json";
import SquareBox from "@/components/ui/squarebox";
import SportsCatalogue from "@/components/SportPreview";
import { auth } from "@/auth";

export default async function Body() {
    const session = await auth()
    const user = session?.user
    // The Catalogue Section for the sports categories
    return <div className="min-h-screen py-[8vh] sm:py-[12vh] px-[4vw] sm:px-[2vw]">
        <div>
            <div className="h-auto w-full flex flex-col gap-6 lg:gap-8 lg:flex-row">
                <SquareBox height="auto" width="auto" paddingx="1vh" paddingy="6vh">
                    <div className="px-4 sm:px-6 lg:px-8 flex flex-col justify-center" >
                        <div className="leading-none font-bold italic my-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl">
                            Sports Community
                        </div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold my-2">
                            Share your passion, follow your favorite sports, and connect with fans during live matches.
                        </div>
                        <div className="flex my-2 gap-2 flex-wrap">
                            <SquareBox height="auto" width="auto" paddingx="2vw">Tweet</SquareBox>
                            <SquareBox height="auto" width="auto" paddingx="2vw">Scores</SquareBox>
                            <SquareBox height="auto" width="auto" paddingx="2vw">Chat</SquareBox>
                        </div>
                    </div>
                </SquareBox>
                <div className="flex h-auto flex-col justify-between gap-4 lg:gap-0">
                    <SquareBox height="auto" width="auto" paddingx="auto">
                        <div className="py-4 px-4 sm:px-6 lg:px-10 flex flex-col gap-2 items-center justify-center" >
                            <div className="font-bold italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                                Live
                            </div>
                            <div className="font-semibold my-2 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center text-[#d1d5db]">
                                Real-time discussions during matches
                            </div>
                            <div className="flex my-2 gap-2 flex-wrap justify-center">
                                <SquareBox height="auto" width="auto" paddingx="2vw">
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
                                <div className="flex gap-2 items-center text-base sm:text-lg lg:text-xl font-semibold">
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
            {!user?<div className="mt-8 lg:mt-12">
                <SquareBox bg="#0f0f0f" height="auto" width="auto" paddingx="0vh">
                    <div className="px-4 sm:px-6 lg:px-10 py-6" >
                        <div className="flex justify-center leading-none font-bold italic my-4 text-lg sm:text-2xl md:text-2xl lg:text-3xl text-center">
                            Ready to Join the Action?
                        </div>
                        <div className="flex justify-center font-semibold my-4 text-[#c6c9ce] text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center px-4">
                            Connect with fellow sports enthusiasts and never miss a moment of the excitement
                        </div>
                        <div className="flex justify-center">
                            <a className="bg-red-600 h-auto w-auto px-6 py-3 rounded-lg flex gap-2 items-center justify-center" href="/auth">
                                Get Started Today
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                                    <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </SquareBox>
            </div>:""}
        </div>
        <div className="my-24 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic flex justify-center text-center">
            Explore Sports Categories
        </div>
        <div className="text-[#d2d2d2] text-base sm:text-lg md:text-xl mb-6 sm:mb-8 flex justify-center text-center max-w-4xl mx-auto px-4">
            Follow your favorite sports and join live discussions during matches with passionate fans worldwide
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((cat) => (
                <SportsCatalogue
                    key={cat.title}
                    imglink={cat.img}
                    Title={cat.title}
                    Description={cat.description}
                    link={cat.link}
                />
            ))}
        </div>

        {/* Join Copmmunity Section */}
        <div className="my-8 sm:mt-20">
            {!user?<SquareBox height="auto" width="auto" paddingx="4vw" paddingy="4vh" bg="#181818">
                <div className="text-2xl sm:text-3xl md:text-4xl italic text-[#cfd2cc] font-semibold my-3 text-center">
                    Join Community
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl italic text-[#cfd2cc] font-bold my-3 text-center">
                    Become Part of the Action
                </div>
                <div className="my-3 text-sm sm:text-base md:text-lg font-semibold text-[#cfd2cc] text-center max-w-3xl mx-auto">
                    Sign in to follow your favorite sports, participate in live chats, share your thoughts, and connect with fellow fans from around the world.
                </div>
                <div className="flex gap-4 mt-6 justify-center items-center">
                    <a className="bg-red-600 h-auto w-auto px-6 py-3 font-semibold text-xl rounded-lg flex gap-2 items-center justify-center" href="/auth">
                        SignIn to get started
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                            <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </a>
                </div>
            </SquareBox>:""}
        </div>
    </div>
} 