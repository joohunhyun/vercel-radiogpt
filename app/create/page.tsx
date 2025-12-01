"use client";

import TagInput from "@/components/TagInput";
import type { PodcastConfig, TonePreference } from "@/types";
import {
  FileText,
  Home,
  Library,
  Menu,
  Radio,
  Settings,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState("오늘의 경제 뉴스");
  const [mode, setMode] = useState<"keywords" | "file" | "pdf">("keywords");
  const [contentKeywords, setContentKeywords] = useState<string[]>([
    "음악",
    "영국",
    "R&B",
    "심리",
    "심리·정신",
  ]);
  const [djKeywords, setDjKeywords] = useState<string[]>([
    "여성",
    "강연",
    "부드러운",
    "심리·정신",
  ]);
  const [length, setLength] = useState<5 | 10 | 30 | 60 | "continuous">(10);
  const [tone, setTone] = useState<TonePreference>("soft");
  const [fileText, setFileText] = useState<string>("");
  const [pdfText, setPdfText] = useState<string>("");
  const [pdfDetails, setPdfDetails] = useState<{ pages?: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      setFileText(text);
      setPdfText("");
      setPdfDetails(null);
      setMode("file");
    } catch (error) {
      console.error("File reading error:", error);
      alert("파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("PDF 추출 실패");
      }

      const data = await response.json();
      setPdfText(data.text);
      setPdfDetails({ pages: data.meta?.pages });
      setFileText("");
      setMode("pdf");
    } catch (error) {
      console.error("PDF upload error:", error);
      alert("PDF 내용을 추출하는 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = () => {
    const config: PodcastConfig = {
      topic,
      mode,
      contentKeywords,
      djKeywords,
      length,
      fileText: mode === "file" ? fileText : undefined,
      pdfText: mode === "pdf" ? pdfText : undefined,
      language: "ko",
      tone,
    };

    // Save to localStorage
    localStorage.setItem("podcast.config", JSON.stringify(config));

    // Navigate to player
    router.push("/player");
  };

  const lengthOptions = [
    { value: 5, label: "5분" },
    { value: 10, label: "10분" },
    { value: 30, label: "30분" },
    { value: 60, label: "1시간" },
    { value: "continuous", label: "연속 생성" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">팟캐스트 생성</h1>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Topic */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">주제</h3>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 오늘의 경제 뉴스 알려줘"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => setMode("keywords")}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-l-xl border ${
              mode === "keywords"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            키워드로 생성
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex-1 py-3 px-4 text-center font-medium border ${
              mode === "file"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            텍스트 파일
          </button>
          <button
            onClick={() => setMode("pdf")}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-r-xl border ${
              mode === "pdf"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            PDF 파일
          </button>
        </div>

        {/* Plain Text Upload */}
        {mode === "file" && (
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                .txt, .md 파일을 업로드하세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isUploading ? "업로드 중..." : "파일 선택"}
              </button>
            </div>

            {fileText && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    파일 내용
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {fileText.substring(0, 200)}...
                </p>
              </div>
            )}
          </div>
        )}

        {/* PDF Upload Section */}
        {mode === "pdf" && (
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">.pdf 파일을 업로드하세요</p>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={isUploading}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isUploading ? "추출 중..." : "PDF 선택"}
              </button>
            </div>

            {pdfText && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    PDF 내용 (상위 200자)
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {pdfText.substring(0, 200)}...
                </p>
                {pdfDetails?.pages && (
                  <p className="text-xs text-gray-500 mt-2">
                    총 {pdfDetails.pages} 페이지
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Keywords */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            컨텐츠 키워드 설정
          </h3>
          <TagInput
            tags={contentKeywords}
            onTagsChange={setContentKeywords}
            placeholder="키워드를 입력하세요"
          />
        </div>

        {/* DJ Keywords */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            DJ 키워드 설정
          </h3>
          <TagInput
            tags={djKeywords}
            onTagsChange={setDjKeywords}
            placeholder="키워드를 입력하세요"
          />
        </div>

        {/* TTS Tone */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            TTS 톤 선택
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "soft", label: "부드러운" },
              { value: "energetic", label: "에너지" },
              { value: "calm", label: "차분한" },
              { value: "narrative", label: "서사형" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTone(option.value as TonePreference)}
                className={`py-3 px-4 rounded-xl border ${
                  tone === option.value
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length Slider */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            팟캐스트 길이
          </h3>
          <div className="space-y-4">
            {lengthOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="length"
                  value={option.value}
                  checked={length === option.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "continuous") {
                      setLength("continuous");
                    } else {
                      setLength(parseInt(value) as 5 | 10 | 30 | 60);
                    }
                  }}
                  className="w-4 h-4 text-black focus:ring-black"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-4">
          <button className="p-2 text-gray-400">
            <Home className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400">
            <Radio className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400">
            <Settings className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400">
            <Library className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6">
        <button
          onClick={handleStart}
          className="w-full bg-black text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
