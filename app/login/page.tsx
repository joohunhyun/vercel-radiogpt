"use client";

import { Apple, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // Save email to localStorage for prototype
    localStorage.setItem("user.email", email || "demo@radiogpt.com");
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              계정 만들기
            </h1>
            <p className="text-gray-600 text-lg">
              이 앱에 가입하려면 이메일을 입력하세요
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleContinue} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              계속
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              disabled
            >
              <Chrome className="w-5 h-5 mr-3" />
              Google 계정으로 계속하기
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              disabled
            >
              <Apple className="w-5 h-5 mr-3" />
              Apple 계정으로 계속하기
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">
          계속 진행하면{" "}
          <a href="#" className="text-black underline">
            서비스 이용 약관
          </a>
          과{" "}
          <a href="#" className="text-black underline">
            개인정보 처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
