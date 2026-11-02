import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RepairStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trackingUuid: string }> }
) {
  try {
    const { trackingUuid } = await params
    const key = trackingUuid.trim()

    const body = await request.json()
    const action = String(body.action ?? '').toUpperCase()

    if (action !== 'APPROVE' && action !== 'CANCEL') {
      return NextResponse.json(
        { error: 'กรุณาระบุ action เป็น "APPROVE" (อนุมัติซ่อม) หรือ "CANCEL" (ยกเลิกซ่อม)' },
        { status: 400 }
      )
    }

    const existing = await prisma.repairOrder.findFirst({
      where: {
        OR: [{ trackingUuid: key }, { orderNo: key }],
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลใบงานซ่อมจากรหัสติดตามนี้' },
        { status: 404 }
      )
    }

    const nextStatus =
      action === 'APPROVE' ? RepairStatus.REPAIRING : RepairStatus.CANCELLED

    const updatedOrder = await prisma.repairOrder.update({
      where: { id: existing.id },
      data: {
        currentStatus: nextStatus,
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

    return NextResponse.json({
      message:
        action === 'APPROVE'
          ? 'ลูกค้าอนุมัติการซ่อมเรียบร้อยแล้ว เปลี่ยนสถานะเป็นกำลังซ่อม (REPAIRING)'
          : 'ลูกค้ายกเลิกการซ่อมเรียบร้อยแล้ว เปลี่ยนสถานะเป็นยกเลิก (CANCELLED)',
      repairOrder: updatedOrder,
    })
  } catch (error) {
    console.error('Error approving/cancelling repair order:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถทำรายการอนุมัติหรือยกเลิกงานซ่อมได้', details: String(error) },
      { status: 400 }
    )
  }
}
