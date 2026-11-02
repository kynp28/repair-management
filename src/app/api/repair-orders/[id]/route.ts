import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = Number(id)

    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'รหัสใบแจ้งซ่อม (id) ไม่ถูกต้อง' }, { status: 400 })
    }

    const repairOrder = await prisma.repairOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          orderBy: { itemOrder: 'asc' },
        },
      },
    })

    if (!repairOrder) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลใบแจ้งซ่อมนี้' }, { status: 404 })
    }

    return NextResponse.json(repairOrder)
  } catch (error) {
    console.error('Error fetching repair order by ID:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงรายละเอียดใบแจ้งซ่อมได้', details: String(error) },
      { status: 500 }
    )
  }
}
