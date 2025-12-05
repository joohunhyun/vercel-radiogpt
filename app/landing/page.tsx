"use client";

import { ArrowRight, Mic, Play, Radio, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-8 h-8 text-black" />
            <span className="text-2xl font-bold text-black">RadioGPT</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-black transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              당신만의
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                AI 팟캐스트
              </span>
              <br />
              실시간으로 생성
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              키워드나 파일을 입력하면 AI가 개인 맞춤형 팟캐스트를 생성합니다.
              실시간 피드백으로 내용을 조정하고 음성 명령으로 제어하세요.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/login"
              className="group px-8 py-4 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Play className="w-5 h-5" />
              <span>지금 시작하기</span>
              <ArrowRight
                className={`w-5 h-5 transition-transform ${isHovered ? "translate-x-1" : ""
                  }`}
              />
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full text-lg font-semibold hover:border-black hover:text-black transition-all duration-300">
              데모 보기
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                실시간 음성 상호작용
              </h3>
              <p className="text-gray-600">
                음성 명령으로 팟캐스트를 실시간으로 제어하고 내용을 조정할 수
                있습니다.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                AI 맞춤형 생성
              </h3>
              <p className="text-gray-600">
                키워드나 파일을 기반으로 당신만의 개인화된 팟캐스트를 자동
                생성합니다.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                즉시 피드백 반영
              </h3>
              <p className="text-gray-600">
                버튼 클릭이나 음성 명령으로 즉시 내용의 깊이, 속도, 톤을 조정할
                수 있습니다.
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-12">
              어떻게 작동하나요?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  키워드 입력
                </h3>
                <p className="text-gray-600">
                  관심 있는 주제나 키워드를 입력하세요
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  AI 생성
                </h3>
                <p className="text-gray-600">
                  AI가 개인 맞춤형 팟캐스트를 생성합니다
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  실시간 청취
                </h3>
                <p className="text-gray-600">
                  생성된 팟캐스트를 실시간으로 청취하세요
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  피드백 조정
                </h3>
                <p className="text-gray-600">
                  실시간으로 내용을 조정하고 개선하세요
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">100%</div>
              <div className="text-gray-600">개인 맞춤형</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">실시간</div>
              <div className="text-gray-600">피드백 반영</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">AI</div>
              <div className="text-gray-600">음성 생성</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">한국어</div>
              <div className="text-gray-600">완벽 지원</div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              지금 바로 시작해보세요
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              몇 분 안에 당신만의 AI 팟캐스트를 만들어보세요
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Radio className="w-6 h-6 text-black" />
            <span className="text-xl font-bold text-black">RadioGPT</span>
          </div>
          <p className="text-gray-600">© 2024 RadioGPT. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
}
