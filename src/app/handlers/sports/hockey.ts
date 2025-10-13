import axios from 'axios'

export default async function hockeyMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get("https://v1.hockey.api-sports.io/games", {
        "headers": {
            "x-rapidapi-host": "v1.hockey.api-sports.io",
            "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
        },
        params:{
            date:todaydate
        }
    })
    console.log("HEHEHEH")
    const data = await response.data.response
    console.log(data)
    return data
}
