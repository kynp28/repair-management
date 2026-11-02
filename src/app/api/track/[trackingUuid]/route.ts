import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackingUuid: string }> }
) {
  try {
    const { trackingUuid } = await params
    const key = trackingUuid.trim()

    const repairOrder = await prisma.repairOrder.findFirst({
      where: {
        OR: [{ trackingUuid: key }, { orderNo: key }],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            isWeAreFriends: true,
          },
        },
        items: {
          orderBy: { itemOrder: 'asc' },
        },
      },
    })

    if (!repairOrder) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลใบงานซ่อมจากรหัสติดตามนี้' },
        { status: 404 }
      )
    }

    return NextResponse.json(repairOrder)
  } catch (error) {
    console.error('Error fetching tracking info:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลติดตามสถานะงานซ่อมได้', details: String(error) },
      { status: 500 }
    )
  }
}
