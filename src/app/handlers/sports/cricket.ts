import axios from 'axios'

export default async function CricketMatchesHandler() {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live',
        headers: {
            'x-apihub-key': 'XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci',
            'x-apihub-host': 'Cricbuzz-Official-Cricket-API.allthingsdev.co',
            'x-apihub-endpoint': 'e0cb5c72-38e1-435e-8bf0-6b38fbe923b7'
        }
    };

    const response = await axios.request(config)
    const matches = await response.data.typeMatches
    console.log(matches)
    return matches
}
