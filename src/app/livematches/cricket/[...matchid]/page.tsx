"use client"

import { CricketMatchInfoHandler } from "@/app/handlers/sports/cricket"
import { useEffect, useState } from "react"

export default function MatchPage({ params }: any) {
    const [matchData, setMatchData] = useState<any>(null);

    useEffect(() => {
        async function getMatchData() {
            const matchId = (await params).matchid
            const response = await CricketMatchInfoHandler(matchId)
            setMatchData(response)
        }
        getMatchData()
    }, [params]);

    return (
        <div className="p-4 space-y-8">
            {
                matchData ?
                    <table className="w-full text-center border-2">
                        <thead>
                            <tr>
                                <th>Batsman</th>
                                <th>Runs</th>
                                <th>Balls</th>
                                <th>Fours</th>
                                <th>Sixes</th>
                                <th>Strike Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                matchData.scorecard[0].batsman
                                    .filter((b: any) => b.outdec === "not out") // ✅ only not out batsmen
                                    .map((b: any, i: number) => (
                                        <tr key={i}>
                                            <td>{b.name}</td>
                                            <td>{b.runs}</td>
                                            <td>{b.balls}</td>
                                            <td>{b.fours}</td>
                                            <td>{b.sixes}</td>
                                            <td>{b.strkrate}</td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                    : null
            }
        </div>
    );
}
