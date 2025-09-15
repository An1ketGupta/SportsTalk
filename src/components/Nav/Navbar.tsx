import CategorySection from "./categorysection";
import Logosection from "./Logosection";
import SignIn from "./signin";

export default function NavBar(){
    return <div className="w-full px-[2vw] bg-black/20 backdrop-blur-md border-b border-white/10 h-[10vh] text-white flex justify-between items-center fixed top-0 z-50 shadow-xl">
        <Logosection/>
        <CategorySection/>
        <SignIn/>
    </div>
}