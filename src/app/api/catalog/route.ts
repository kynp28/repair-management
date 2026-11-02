import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')?.trim()
    const itemType = searchParams.get('itemType')?.trim()

    const items = await prisma.catalogItem.findMany({
      where: {
        ...(itemType ? { itemType } : {}),
        ...(search
          ? {
              OR: [
                { barcode: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { id: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching catalog items:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงรายการอะไหล่และบริการได้', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barcode, description, defaultPrice, itemType } = body

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'กรุณาระบุชื่อรายการอะไหล่หรือบริการ (description)' },
        { status: 400 }
      )
    }

    const newItem = await prisma.catalogItem.create({
      data: {
        barcode: barcode ? String(barcode).trim() : null,
        description: description.trim(),
        defaultPrice: defaultPrice !== undefined ? Number(defaultPrice) : 0,
        itemType: itemType ? String(itemType).trim() : 'PART',
      },
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating catalog item:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถเพิ่มรายการอะไหล่/บริการได้ (บาร์โค้ดอาจซ้ำ)', details: String(error) },
      { status: 400 }
    )
  }
}
