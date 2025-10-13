import axios from 'axios';
export default async function NFLMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const options = {
        method: 'GET',
        url: 'https://v1.american-football.api-sports.io/games',
        params: { date: todaydate},
        headers: {
            'x-rapidapi-host': 'v1.american-football.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        }
    };

    const response = await axios.request(options)
    const data = await response.data.response
    return data
}