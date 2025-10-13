import axios from 'axios';
export default async function tennisMatchesHandler() {

    const options = {
        method: 'GET',
        url: 'https://tennisapi1.p.rapidapi.com/api/tennis/events/live',
        headers: {
            'x-rapidapi-key': 'e60478613emsh5570a46ef93e082p1752e5jsndf6235d350ab',
            'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        const events = await response.data.events
        return events
    } catch (error) {
        console.error(error);
    }
}