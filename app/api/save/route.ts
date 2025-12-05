import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topic, audioUrl } = await request.json();

        const { data, error } = await supabase
            .from("podcasts")
            .insert([
                {
                    user_id: userId,
                    topic,
                    audio_url: audioUrl,
                },
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error saving podcast:", error);
        return NextResponse.json(
            { error: "Failed to save podcast" },
            { status: 500 }
        );
    }
}
