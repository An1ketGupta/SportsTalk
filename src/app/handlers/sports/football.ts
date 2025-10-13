import axios from 'axios';

export default async function   footballMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: {
            live: "61-39-78-135-140"
        },
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        },

    })
    const data = await response.data.response
    return data
}