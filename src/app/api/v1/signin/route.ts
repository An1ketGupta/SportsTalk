import { NextRequest } from "next/server";


async function POST(req:NextRequest){
    const data = req.json();
    console.log(data);
}