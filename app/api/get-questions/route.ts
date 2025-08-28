import { connectDB } from "@/lib/db";
import Questions from "@/models/Questions";
import { NextResponse } from "next/server";

export  async function GET(req:Request){
    try {
        await connectDB()
        const questions = await Questions.find({}).limit(5)
        return NextResponse.json({questions,message:"successfully found the questions"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message:"internal server error"},{status:500})
    }
}