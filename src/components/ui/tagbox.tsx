import Tags from "../../public/tag.json"
import SquareBox from "../squarebox";

export default function TagsBox(){
    return (
        <div className="my-4">
            <SquareBox width="auto" height="auto" paddingy="2vh">
                <div className="font-semibold text-xl">What's Trending</div>
                <div>
                    {Tags.tag.slice(0, 5).map((tag, idx) => (
                        <div key={idx} className="my-4 items-start flex flex-col">
                            <div className="text-[#c4c6c7] text-[12px]">
                                {tag.category} 
                                <span className="text-lg"> • </span>
                                Trending in {tag.country}
                            </div>
                            <div className="font-semibold">
                                #{tag.name}
                            </div>
                        </div>
                    ))}
                </div>
            </SquareBox>
        </div>
    );
}