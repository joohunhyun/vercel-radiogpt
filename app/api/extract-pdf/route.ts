import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import BeautifulSoup from "beautiful-soup-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "유효한 PDF 파일이 필요합니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);

    const htmlPayload = `<html><body>${pdfData.text
      .replace(/\r\n|\r|\n/g, "<br />")
      .trim()}</body></html>`;

    const soup = new BeautifulSoup(htmlPayload);
    const cleanText = soup.getText().replace(/\s+/g, " ").trim();

    return NextResponse.json({
      text: cleanText,
      meta: {
        pages: pdfData.numpages,
        info: pdfData.info ?? null,
      },
    });
  } catch (error) {
    console.error("PDF extract error:", error);
    return NextResponse.json(
      { error: "PDF 텍스트를 추출하지 못했습니다." },
      { status: 500 }
    );
  }
}


