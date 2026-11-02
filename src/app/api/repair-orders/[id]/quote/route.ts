import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BillingType, Prisma, RepairStatus } from '@prisma/client'

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

    const existing = await prisma.repairOrder.findUnique({
      where: { id: orderId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบใบแจ้งซ่อมที่ต้องการประเมินราคา' }, { status: 404 })
    }

    const body = await request.json()
    const {
      technicianNote,
      technicianName,
      billingType,
      careInstructions,
      warningNote,
      operatingHours,
      currentStatus,
      items,
    } = body

    const parsedItems: Array<{
      itemOrder: number
      barcode: string | null
      description: string
      quantity: number
      unitPrice: number
      amount: number
    }> = Array.isArray(items)
      ? items.map((item: Record<string, unknown>, idx: number) => {
          const quantity = item.quantity !== undefined ? Number(item.quantity) : 1
          const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : 0
          const amount =
            item.amount !== undefined ? Number(item.amount) : quantity * unitPrice
          return {
            itemOrder: item.itemOrder !== undefined ? Number(item.itemOrder) : idx + 1,
            barcode: item.barcode ? String(item.barcode) : null,
            description: String(item.description ?? ''),
            quantity,
            unitPrice,
            amount,
          }
        })
      : []

    const calculatedTotal = parsedItems.reduce((sum, item) => sum + item.amount, 0)
    const subTotal = body.subTotal !== undefined ? Number(body.subTotal) : calculatedTotal
    const grandTotal =
      body.grandTotal !== undefined ? Number(body.grandTotal) : calculatedTotal

    const targetStatus: RepairStatus =
      currentStatus && Object.values(RepairStatus).includes(currentStatus)
        ? (currentStatus as RepairStatus)
        : RepairStatus.WAITING_APPROVAL

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (Array.isArray(items)) {
        await tx.repairOrderItem.deleteMany({
          where: { repairOrderId: orderId },
        })
      }

      return tx.repairOrder.update({
        where: { id: orderId },
        data: {
          ...(technicianNote !== undefined
            ? { technicianNote: technicianNote ? String(technicianNote) : null }
            : {}),
          ...(technicianName !== undefined
            ? { technicianName: technicianName ? String(technicianName) : null }
            : {}),
          ...(billingType !== undefined
            ? {
                billingType:
                  billingType && Object.values(BillingType).includes(billingType)
                    ? (billingType as BillingType)
                    : null,
              }
            : {}),
          ...(careInstructions !== undefined
            ? { careInstructions: careInstructions ?? Prisma.JsonNull }
            : {}),
          ...(warningNote !== undefined
            ? { warningNote: warningNote ? String(warningNote) : null }
            : {}),
          ...(operatingHours !== undefined
            ? {
                operatingHours:
                  operatingHours !== null ? Number(operatingHours) : null,
              }
            : {}),
          ...(Array.isArray(items) || body.subTotal !== undefined || body.grandTotal !== undefined
            ? { subTotal, grandTotal }
            : {}),
          currentStatus: targetStatus,
          ...(Array.isArray(items) && parsedItems.length > 0
            ? {
                items: {
                  create: parsedItems,
                },
              }
            : {}),
        },
        include: {
          customer: true,
          items: {
            orderBy: { itemOrder: 'asc' },
          },
        },
      })
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating repair order quote:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกผลการตรวจเช็คและใบเสนอราคาได้', details: String(error) },
      { status: 400 }
    )
  }
}
