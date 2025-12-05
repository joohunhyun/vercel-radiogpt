"use client";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Calendar, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Podcast {
    id: number;
    topic: string;
    created_at: string;
    audio_url?: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (!userId) return;

            try {
                const { data, error } = await supabase
                    .from("podcasts")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                setPodcasts(data || []);
            } catch (error) {
                console.error("Error fetching history:", error);
                toast.error("히스토리를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchHistory();
    }, [userId]);

    const handlePlay = (podcast: Podcast) => {
        // For now, just navigate to player with this topic
        // In a real app, we would load the specific audio or config
        localStorage.setItem(
            "podcast.config",
            JSON.stringify({
                topic: podcast.topic,
                mode: "keywords",
                contentKeywords: [],
                length: 10,
                language: "ko",
                tone: "soft",
            })
        );
        router.push("/player");
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="px-6 py-8 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">히스토리</h1>
            </div>

            {/* List */}
            <div className="px-6 pb-24">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : podcasts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>아직 생성된 팟캐스트가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {podcasts.map((podcast) => (
                            <div
                                key={podcast.id}
                                className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => handlePlay(podcast)}
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {podcast.topic}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(podcast.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <button className="p-3 bg-white rounded-full shadow-sm">
                                    <Play className="w-5 h-5 text-black ml-0.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
