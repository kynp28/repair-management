import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RepairStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = Number(id)

    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'รหัสใบแจ้งซ่อม (id) ไม่ถูกต้อง' }, { status: 400 })
    }

    const body = await request.json()
    const rawStatus = body.currentStatus ?? body.status

    if (!rawStatus || !Object.values(RepairStatus).includes(rawStatus as RepairStatus)) {
      return NextResponse.json(
        {
          error: `สถานะงานซ่อมไม่ถูกต้อง กรุณาระบุหนึ่งใน: ${Object.values(RepairStatus).join(', ')}`,
        },
        { status: 400 }
      )
    }

    const existing = await prisma.repairOrder.findUnique({
      where: { id: orderId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบใบแจ้งซ่อมที่ต้องการเปลี่ยนสถานะ' }, { status: 404 })
    }

    const updatedOrder = await prisma.repairOrder.update({
      where: { id: orderId },
      data: {
        currentStatus: rawStatus as RepairStatus,
        ...(body.technicianNote !== undefined
          ? { technicianNote: body.technicianNote ? String(body.technicianNote) : null }
          : {}),
        ...(body.technicianName !== undefined
          ? { technicianName: body.technicianName ? String(body.technicianName) : null }
          : {}),
      },
      include: {
        customer: true,
        items: {
          orderBy: { itemOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating repair status:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตสถานะงานซ่อมได้', details: String(error) },
      { status: 400 }
    )
  }
}
