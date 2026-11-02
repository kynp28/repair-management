import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BillingType, Prisma, RepairStatus, WarrantyStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const statusParam = searchParams.get('status')?.trim()
    const search = searchParams.get('search')?.trim()

    const where: Prisma.RepairOrderWhereInput = {}

    if (statusParam && Object.values(RepairStatus).includes(statusParam as RepairStatus)) {
      where.currentStatus = statusParam as RepairStatus
    }

    if (search) {
      where.OR = [
        { orderNo: { contains: search } },
        { bookNo: { contains: search } },
        { machineBrandModel: { contains: search } },
        { serialNumber: { contains: search } },
        { customer: { phone: { contains: search } } },
        { customer: { name: { contains: search } } },
      ]
    }

    const repairOrders = await prisma.repairOrder.findMany({
      where,
      include: {
        customer: true,
        items: {
          orderBy: { itemOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(repairOrders)
  } catch (error) {
    console.error('Error fetching repair orders:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงรายการใบแจ้งซ่อมได้', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookNo,
      orderNo,
      receivedDate,
      jobType,
      customerId,
      customer,
      customerName,
      customerPhone,
      customerAddress,
      isWeAreFriends,
      machineBrandModel,
      serialNumber,
      warrantyStatus,
      warrantyExpDate,
      customerReportedIssue,
      technicianNote,
      accessories,
      hasLoanerMachine,
      billingType,
      careInstructions,
      warningNote,
      operatingHours,
      receivedBy,
      technicianName,
      currentStatus,
      items,
    } = body

    if (!orderNo || !machineBrandModel || !customerReportedIssue) {
      return NextResponse.json(
        {
          error:
            'กรุณาระบุข้อมูลสำคัญให้ครบถ้วน (orderNo, machineBrandModel, customerReportedIssue)',
        },
        { status: 400 }
      )
    }

    let resolvedCustomerId: number | null = customerId ? Number(customerId) : null

    if (!resolvedCustomerId) {
      const name = customer?.name ?? customerName
      const phone = customer?.phone ?? customerPhone
      const address = customer?.address ?? customerAddress ?? null
      const friendsFlag = Boolean(customer?.isWeAreFriends ?? isWeAreFriends ?? false)

      if (!name || !phone) {
        return NextResponse.json(
          { error: 'กรุณาระบุข้อมูลลูกค้า (customer.name และ customer.phone หรือ customerId)' },
          { status: 400 }
        )
      }

      const existingCustomer = await prisma.customer.findFirst({
        where: { phone: String(phone).trim() },
      })

      if (existingCustomer) {
        const updatedCustomer = await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: String(name).trim(),
            ...(address !== null ? { address: String(address) } : {}),
            ...(customer?.isWeAreFriends !== undefined || isWeAreFriends !== undefined
              ? { isWeAreFriends: friendsFlag }
              : {}),
          },
        })
        resolvedCustomerId = updatedCustomer.id
      } else {
        const createdCustomer = await prisma.customer.create({
          data: {
            name: String(name).trim(),
            phone: String(phone).trim(),
            address: address ? String(address) : null,
            isWeAreFriends: friendsFlag,
          },
        })
        resolvedCustomerId = createdCustomer.id
      }
    }

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

    const calculatedSubTotal = parsedItems.reduce((sum, item) => sum + item.amount, 0)
    const subTotal =
      body.subTotal !== undefined ? Number(body.subTotal) : calculatedSubTotal
    const grandTotal =
      body.grandTotal !== undefined ? Number(body.grandTotal) : calculatedSubTotal

    const createdOrder = await prisma.repairOrder.create({
      data: {
        bookNo: bookNo ? String(bookNo) : null,
        orderNo: String(orderNo).trim(),
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        jobType: jobType ? String(jobType) : 'ซ่อม',
        customerId: resolvedCustomerId,
        machineBrandModel: String(machineBrandModel).trim(),
        serialNumber: serialNumber ? String(serialNumber) : null,
        warrantyStatus:
          warrantyStatus && Object.values(WarrantyStatus).includes(warrantyStatus)
            ? (warrantyStatus as WarrantyStatus)
            : WarrantyStatus.OUT_OF_WARRANTY,
        warrantyExpDate: warrantyExpDate ? new Date(warrantyExpDate) : null,
        customerReportedIssue: String(customerReportedIssue),
        technicianNote: technicianNote ? String(technicianNote) : null,
        accessories: accessories ?? {},
        hasLoanerMachine: Boolean(hasLoanerMachine ?? false),
        billingType:
          billingType && Object.values(BillingType).includes(billingType)
            ? (billingType as BillingType)
            : null,
        careInstructions: careInstructions ?? Prisma.JsonNull,
        warningNote: warningNote ? String(warningNote) : null,
        operatingHours:
          operatingHours !== undefined && operatingHours !== null
            ? Number(operatingHours)
            : null,
        subTotal,
        grandTotal,
        currentStatus:
          currentStatus && Object.values(RepairStatus).includes(currentStatus)
            ? (currentStatus as RepairStatus)
            : RepairStatus.RECEIVED,
        receivedBy: receivedBy ? String(receivedBy) : null,
        technicianName: technicianName ? String(technicianName) : null,
        ...(parsedItems.length > 0
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

    return NextResponse.json(createdOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating repair order:', error)
    return NextResponse.json(
      {
        error: 'ไม่สามารถสร้างใบรับซ่อมได้ (เลขที่ใบงานอาจซ้ำหรือข้อมูลไม่ถูกต้อง)',
        details: String(error),
      },
      { status: 400 }
    )
  }
}
