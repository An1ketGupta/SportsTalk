import RightSection from "@/components/rightsection";
import Sidebar from "@/components/sidebar";

export default function Dashboard(){
    return <div className="flex h-[90vh]">
        <Sidebar/>
        
        <RightSection/>
    </div>
}