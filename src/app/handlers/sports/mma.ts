import axios from 'axios'

export default async function mmaMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get('https://v1.mma.api-sports.io/fights', {
        params: { date: todaydate },
        headers: {
            'x-rapidapi-host': 'v1.mma.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        }
    })
    
    const data = await response.data.response
    return data
}
