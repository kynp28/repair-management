'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
      กำลังโหลดเอกสาร Homglai Repair Tracking API Docs...
    </div>
  ),
})

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-900 px-6 py-4 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Homglai Repair Tracking API (Next.js + MySQL)
            </h1>
            <p className="text-sm text-slate-300">
              ระบบแจ้งซ่อมและติดตามสถานะแบบเรียลไทม์ ร้าน &quot;หอมไกล ชลบุรี&quot; — กด Try it out เพื่อทดสอบยิง API เข้าฐานข้อมูลได้ทันที
            </p>
          </div>
          <a
            href="/api/doc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-700 transition hover:bg-slate-700"
          >
            ดูไฟล์ JSON (/api/doc)
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl py-4">
        <SwaggerUI url="/api/doc" docExpansion="list" defaultModelsExpandDepth={1} />
      </div>
    </main>
  )
}
