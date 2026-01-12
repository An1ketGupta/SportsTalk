import SearchBar from "./ui/searchbar";
import TagsBox from "./ui/tagbox";
import WhoToFollow from "./whotofollow";
import TrendingSports from "./TrendingSports";

export default function RightSection() {
    return <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
        <SearchBar />
        <TrendingSports />
        <WhoToFollow />
    </div>
}