import { Button } from "./ui/button";
import { MdCalendarToday, MdAccessTime } from "react-icons/md";
import { HiOutlineChatAlt } from "react-icons/hi";
import Link from "next/link";

export default function MatchCatalogue({
    league,
    title,
    date,
    status,
    home = { name: "Home", crest: "" },
    away = { name: "Away", crest: "" },
    homeScore,
    awayScore,
    category,
}: {
    league?: string;
    title?: string;
    date?: string; // formatted date/time
    status?: string; // e.g., Live
    home?: { name: string; crest?: string };
    away?: { name: string; crest?: string };
    homeScore?: number | string;
    awayScore?: number | string;
    category?: string;
}) {
    const isIndividual = category === "Formula 1";
    return (
        <Link href={"/match/1"} className="bg-[#121212] rounded-2xl overflow-hidden p-5 sm:p-6 transform transition-transform duration-200 hover:-translate-y-1 border border-white/5">
            {/* Top row: status pill + date */}
            <div className="flex items-start justify-between">
                <div>
                    {status ? (
                        <span className="inline-block bg-[#4b1917] text-[#ffd9d6] px-3 py-1 rounded-md text-sm font-semibold">{status}</span>
                    ) : null}
                </div>
                <div className="flex items-center gap-3 text-sm text-[#9ca3af]">
                    <div className="flex items-center gap-2">
                        <MdCalendarToday className="text-[#9ca3af]" />
                        <span>{date ?? "Jul 20, 21:00"}</span>
                    </div>
                </div>
            </div>

            {/* Title / league */}
            <div className="mt-4">
                <div className="text-lg sm:text-xl font-bold italic text-white">{title ?? (league ? `${league}: ${home.name} vs ${away.name}` : `${home.name} vs ${away.name}`)}</div>
            </div>

            {/* Teams or Players */}
            <div className="mt-4 space-y-4">
                {isIndividual ? (
                    <>
                        <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center justify-between border border-white/5">
                            <div className="text-white font-semibold text-lg">{home.name}</div>
                            <div className="text-2xl font-bold text-white">{homeScore ?? "-"}</div>
                        </div>
                        <div className="text-center text-sm text-[#9ca3af] font-medium">VS</div>
                        <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center justify-between border border-white/5">
                            <div className="text-white font-semibold text-lg">{away.name}</div>
                            <div className="text-2xl font-bold text-white">{awayScore ?? "-"}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#0b0b0b] overflow-hidden flex items-center justify-center">
                                    {home.crest ? (
                                        <img src={home.crest} alt={home.name} className="w-10 h-10 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#1f1f1f]" />
                                    )}
                                </div>
                                <div className="text-white font-semibold">{home.name}</div>
                            </div>
                            <div className="text-2xl font-bold text-white">{homeScore ?? "-"}</div>
                        </div>
                        <div className="text-center text-sm text-[#9ca3af] font-medium">VS</div>
                        <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#0b0b0b] overflow-hidden flex items-center justify-center">
                                    {away.crest ? (
                                        <img src={away.crest} alt={away.name} className="w-10 h-10 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#1f1f1f]" />
                                    )}
                                </div>
                                <div className="text-white font-semibold">{away.name}</div>
                            </div>
                            <div className="text-2xl font-bold text-white">{awayScore ?? "-"}</div>
                        </div>
                    </>
                )}
            </div>
        </Link>
    );
}