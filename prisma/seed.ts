import { PrismaClient, WarrantyStatus, BillingType, RepairStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 กำลังจำลองข้อมูลเริ่มต้น (Seed) สำหรับร้าน หอมไกล ชลบุรี...')

  // 1. สร้างรายการอะไหล่และบริการมาตรฐานในคลัง (CatalogItem)
  await prisma.catalogItem.upsert({
    where: { barcode: '1681573' },
    update: {
      description: 'เฟืองดอกเห็ด',
      defaultPrice: 250,
      itemType: 'PART',
    },
    create: {
      barcode: '1681573',
      description: 'เฟืองดอกเห็ด',
      defaultPrice: 250,
      itemType: 'PART',
    },
  })

  await prisma.catalogItem.upsert({
    where: { barcode: 'SRV-CLEAN-01' },
    update: {
      description: 'ทำความสะอาดภายใน+นอก',
      defaultPrice: 0,
      itemType: 'SERVICE',
    },
    create: {
      barcode: 'SRV-CLEAN-01',
      description: 'ทำความสะอาดภายใน+นอก',
      defaultPrice: 0,
      itemType: 'SERVICE',
    },
  })

  await prisma.catalogItem.upsert({
    where: { barcode: 'SRV-SHIP-01' },
    update: {
      description: 'ค่าเดินทางนอกสถานที่ ค่าขนส่งกลับ',
      defaultPrice: 215,
      itemType: 'SERVICE',
    },
    create: {
      barcode: 'SRV-SHIP-01',
      description: 'ค่าเดินทางนอกสถานที่ ค่าขนส่งกลับ',
      defaultPrice: 215,
      itemType: 'SERVICE',
    },
  })

  await prisma.catalogItem.upsert({
    where: { barcode: 'SRV-REPAIR-01' },
    update: {
      description: 'ค่าบริการซ่อม',
      defaultPrice: 350,
      itemType: 'SERVICE',
    },
    create: {
      barcode: 'SRV-REPAIR-01',
      description: 'ค่าบริการซ่อม',
      defaultPrice: 350,
      itemType: 'SERVICE',
    },
  })

  // 2. สร้างข้อมูลลูกค้า "บจก. ชาวันชา"
  let customer = await prisma.customer.findFirst({
    where: { phone: '093-446-8687' },
  })

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: 'บจก. ชาวันชา',
        phone: '093-446-8687',
        isWeAreFriends: false,
      },
    })
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: 'บจก. ชาวันชา',
      },
    })
  }

  // 3. สร้างใบแจ้งซ่อม เล่มที่ 112 เลขที่ใบงาน 5595
  const existingOrder = await prisma.repairOrder.findUnique({
    where: { orderNo: '5595' },
  })

  if (existingOrder) {
    await prisma.repairOrder.delete({
      where: { id: existingOrder.id },
    })
  }

  const repairOrder = await prisma.repairOrder.create({
    data: {
      bookNo: '112',
      orderNo: '5595',
      jobType: 'ซ่อม',
      customerId: customer.id,
      machineBrandModel: 'เครื่องปั่น GEF A9+',
      warrantyStatus: WarrantyStatus.OUT_OF_WARRANTY,
      customerReportedIssue: 'แจ้งว่าเครื่องไม่ทำงาน',
      technicianNote: 'เช็คเฟืองดอกเห็ด',
      accessories: {
        power_cord: true,
        other: 'ฝาครอบ',
      },
      hasLoanerMachine: false,
      billingType: BillingType.OUT_OF_WARRANTY_PAID,
      subTotal: 815,
      grandTotal: 815,
      currentStatus: RepairStatus.WAITING_APPROVAL,
      items: {
        create: [
          {
            itemOrder: 1,
            barcode: null,
            description: 'ทำความสะอาดภายใน+นอก',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
          },
          {
            itemOrder: 4,
            barcode: '1681573',
            description: 'เฟืองดอกเห็ด',
            quantity: 1,
            unitPrice: 250,
            amount: 250,
          },
          {
            itemOrder: 8,
            barcode: null,
            description: 'ค่าเดินทางนอกสถานที่ ค่าขนส่งกลับ',
            quantity: 1,
            unitPrice: 215,
            amount: 215,
          },
          {
            itemOrder: 10,
            barcode: null,
            description: 'ค่าบริการซ่อม',
            quantity: 1,
            unitPrice: 350,
            amount: 350,
          },
        ],
      },
    },
    include: {
      customer: true,
      items: {
        orderBy: { itemOrder: 'asc' },
      },
    },
  })

  console.log('✅ Seed ข้อมูลสำเร็จ!')
  console.log(`📋 เลขที่ใบงาน: ${repairOrder.orderNo} (เล่มที่ ${repairOrder.bookNo})`)
  console.log(`👤 ลูกค้า: ${repairOrder.customer.name} (${repairOrder.customer.phone})`)
  console.log(`🔑 Tracking UUID: ${repairOrder.trackingUuid}`)
  console.log(`💰 ยอดรวม Grand Total: ${repairOrder.grandTotal} บาท`)
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
