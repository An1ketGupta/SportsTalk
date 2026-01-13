export default function SportsCatalogue({
    imglink,
    Title,
    Description,
    link
}: {
    imglink: string;
    Title: string;
    Description: string;
    link: string;
}) {
    return (
        <div className="bg-[#181818] rounded-xl h-auto w-auto overflow-hidden p-4 sm:p-6 lg:p-7 flex flex-col items-center justify-between transform transition-transform border-[#959595] border-opacity-50 border-[0.5px] duration-200 hover:-translate-y-2">
            <div className="w-full h-40 sm:h-48 lg:h-56 overflow-hidden rounded-lg mb-3 sm:mb-4">
                <img
                    src={imglink}
                    alt="Sport category"
                    className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-110"
                />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-2 italic">
                {Title}
            </div>
            <div className="text-sm sm:text-base text-center text-[#959595] font-medium">
                {Description}
            </div>
            <div className="mt-6 bg-[#959595] w-full h-[0.1px]">
                &nbsp;
            </div>
            <div className="w-full mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <span className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>
                </span>
                <span className="text-[#959595] font-semibold">Active Community</span>
                <span>
                    <a href={`/livematches/${link}`} className="bg-red-600 cursor-pointer flex rounded-lg font-semibold py-1 sm:py-1.5 items-center w-auto px-2 sm:px-3 text-sm sm:text-base hover:bg-[#e04d2b]">
                        <div>
                            Live Scores
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </a>
                </span>
            </div>
        </div>
    );
}
