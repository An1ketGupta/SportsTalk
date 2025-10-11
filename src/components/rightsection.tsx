import SearchBar from "./ui/searchbar";
import TagsBox from "./ui/tagbox";

export default function RightSection() {
    return <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
        <SearchBar />
        <TagsBox />
        {/* <WhoToFollow /> */}
    </div>
}