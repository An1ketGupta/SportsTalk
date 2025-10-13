import axios from 'axios';
export default async function F1MatchesHandler() {
    const todayDate = new Date().toISOString().split("T")[0]
    const response = await axios.get('https://v1.formula-1.api-sports.io/races', {
        params: {
            date: todayDate
        },
        headers: {
            'x-rapidapi-host': 'v1.formula-1.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        }
    })
    const data = await response.data.response
    return data

}