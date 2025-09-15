import Catalogue from "@/components/ui/catalogue";
import categories from "@/app/public/categoryinfo.json";
import SquareBox from "@/components/ui/squarebox";
import { Button } from "@/components/ui/button";

export default function Part2() {
    return <div className="bg-[#0f0f0f] min-h-screen text-[white] py-[8vh] sm:py-[12vh] px-[4vw] sm:px-[2vw]">
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic mb-2 flex justify-center text-center">
            Explore Sports Categories
        </div>
        <div className="text-[#d2d2d2] text-base sm:text-lg md:text-xl mb-6 sm:mb-8 flex justify-center text-center max-w-4xl mx-auto px-4">
            Follow your favorite sports and join live discussions during matches with passionate fans worldwide
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((cat) => (
                <Catalogue
                    key={cat.title}
                    imglink={cat.img}
                    Title={cat.title}
                    Description={cat.description}
                />
            ))}
        </div>
        <div className="my-8 sm:my-10">
            <SquareBox height="auto" width="auto" paddingx="4vw" paddingy="4vh sm:6vh" bg="#181818">
                <div className="text-2xl sm:text-3xl md:text-4xl italic text-[#cfd2cc] font-semibold my-3 text-center">
                    Join Community
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl italic text-[#cfd2cc] font-bold my-3 text-center">
                    Become Part of the Action
                </div>
                <div className="my-3 text-sm sm:text-base md:text-lg font-semibold text-[#cfd2cc] text-center max-w-3xl mx-auto">
                    Sign in to follow your favorite sports, participate in live chats, share your thoughts, and connect with fellow fans from around the world.
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8 justify-center items-center">
                    <Button className="bg-[#f35730] text-white hover:bg-[#e04d2b] px-6 sm:px-8 md:px-12 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center gap-2">
                        Sign In to get started
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </Button>
                    <Button variant="outline" className="border-2 border-[#959595] text-[#cfd2cc] hover:bg-[#959595] hover:text-[#181818] px-6 sm:px-8 md:px-12 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center gap-2">
                        Learn More
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                            <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </Button>
                </div>
            </SquareBox>
        </div>
    </div>
} 