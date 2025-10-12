import MyProfilePage from "@/components/myproflepage";
import RightSection from "@/components/rightsection";
import Sidebar from "@/components/sidebar";
export default function Dashboard(){
    return <div className="flex justify-start h-[90vh]">
        <Sidebar/>
        <MyProfilePage/>
        <RightSection/>
    </div>
}