export default async function SportLiveMatches({params}:any){
    let category = (await params).category
    return <div>
        These are the live matches for {category} sport
    </div>
}