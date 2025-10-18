import axios from "axios"

export async function basketballMatchesHandler(){
    const todayDate = new Date().toISOString().split("T")[0]
    const response = await axios.get("https://v1.basketball.api-sports.io/games",{
        params:{
            date:todayDate
        },
        headers:{
		"x-rapidapi-host": "v1.basketball.api-sports.io",
		"x-rapidapi-key": "115c63a79ada64779433b7f133255804"
	}
    })

    const data = await response.data.response
    console.log(data)
    return data
}