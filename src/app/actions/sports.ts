"use server";

export async function fetchSportsData(url: string, host: string) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-host": host,
                "x-rapidapi-key": process.env.RAPIDAPI_SPORTS_KEY!,
            },
            next: { revalidate: 30 },
        });

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText} for URL: ${url}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching sports data:", error);
        return null;
    }
}

export async function fetchTennisData(url: string) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
                "x-rapidapi-key": process.env.RAPIDAPI_TENNIS_KEY!,
            },
            next: { revalidate: 30 },
        });

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText} for URL: ${url}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching tennis data:", error);
        return null;
    }
}

export async function fetchCricketData(url: string, host: string, endpoint: string) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-apihub-host": host,
                "x-apihub-key": process.env.CRICKET_API_KEY!,
                "x-apihub-endpoint": endpoint,
            },
            next: { revalidate: 30 },
        });

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText} for URL: ${url}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching cricket data:", error);
        return null;
    }
}
