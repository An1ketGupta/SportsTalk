import axios from "axios";
export default async function basketballMatchesHandler() {
    console.log("reached here")
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get("https://v2.nba.api-sports.io/games?date=2022-03-09", {
        headers: {
            "x-rapidapi-host": "v2.nba.api-sports.io",
            "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
        },
        params:{
            date:todaydate,
        }
    })
    const data = await response.data.response
    return data
}