import SearchBar from "./ui/searchbar";
import WhoToFollow from "./whotofollow";
import TrendingSports from "./TrendingSports";

export default function RightSection() {
    return <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
        <SearchBar />
        <TrendingSports />
        <WhoToFollow />
    </div>
}