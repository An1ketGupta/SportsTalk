import CategorySection from "./categorysection";
import Logosection from "./Logosection";
import SignIn from "./signin";

export default function NavBar(){
    return <div className="px-[2vw] bg-[#353f4f] h-[10vh] text-white flex justify-between items-center sticky top-0">
        <Logosection/>
        <CategorySection/>
        <SignIn/>
    </div>
}