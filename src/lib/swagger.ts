import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Homglai Repair Tracking API (Next.js + MySQL)',
        version: '1.0.0',
        description:
          'เอกสาร API สำหรับระบบแจ้งซ่อมและติดตามสถานะแบบเรียลไทม์ของร้าน **"หอมไกล ชลบุรี"** พัฒนาด้วย Next.js (App Router) เชื่อมต่อฐานข้อมูล MySQL ผ่าน Prisma ORM รองรับการจัดการรายการอะไหล่/บริการ (`/api/catalog`), ใบแจ้งซ่อมและการเสนอราคาสำหรับช่าง (`/api/repair-orders`) และการติดตามสถานะพร้อมอนุมัติซ่อมแบบเรียลไทม์สำหรับลูกค้า (`/api/track/{trackingUuid}`)',
      },
      servers: [
        {
          url: '/',
          description: 'เซิร์ฟเวอร์ปัจจุบัน (Current Server)',
        },
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server',
        },
      ],
      tags: [
        {
          name: '1. Catalog (รายการอะไหล่และบริการ)',
          description: 'ดึงและเพิ่มรายการอะไหล่/บริการมาตรฐานของร้าน (เช่น เฟืองดอกเห็ด, ค่าบริการซ่อม)',
        },
        {
          name: '2. Repair Orders (จัดการใบแจ้งซ่อมสำหรับหน้าร้านและช่าง)',
          description:
            'สร้างใบรับซ่อมใหม่, ค้นหาใบงาน, ดูรายละเอียดใบงาน, บันทึกผลตรวจเช็ค/เสนอราคา และเปลี่ยนสถานะงานซ่อมแบบเรียลไทม์',
        },
        {
          name: '3. Public Tracking (ลูกค้าติดตามสถานะและอนุมัติซ่อม)',
          description:
            'สำหรับลูกค้าเปิดดูสถานะใบงาน รายการอะไหล่ ยอดรวม และกดปุ่ม "อนุมัติซ่อม" หรือ "ยกเลิกซ่อม" ได้ด้วยตนเองผ่าน Tracking UUID',
        },
      ],
      components: {
        schemas: {
          WarrantyStatus: {
            type: 'string',
            enum: ['IN_WARRANTY', 'OUT_OF_WARRANTY'],
            description: 'สถานะการรับประกันของเครื่อง (IN_WARRANTY = ในประกัน, OUT_OF_WARRANTY = นอกประกัน)',
            example: 'OUT_OF_WARRANTY',
          },
          BillingType: {
            type: 'string',
            nullable: true,
            enum: ['OUT_OF_WARRANTY_PAID', 'IN_WARRANTY_FREE', 'IN_WARRANTY_PAID'],
            description:
              'รูปแบบการคิดค่าใช้จ่าย (OUT_OF_WARRANTY_PAID = นอกประกันมีค่าใช้จ่าย, IN_WARRANTY_FREE = ในประกันไม่มีค่าใช้จ่าย, IN_WARRANTY_PAID = ในประกันแต่มีค่าใช้จ่ายเพิ่มเติม)',
            example: 'OUT_OF_WARRANTY_PAID',
          },
          RepairStatus: {
            type: 'string',
            enum: [
              'RECEIVED',
              'CHECKING',
              'WAITING_APPROVAL',
              'WAITING_PARTS',
              'REPAIRING',
              'READY_FOR_PAYMENT',
              'COMPLETED',
              'CANCELLED',
            ],
            description:
              'สถานะใบงานซ่อม (RECEIVED = รับเครื่องแล้ว, CHECKING = กำลังตรวจเช็ค, WAITING_APPROVAL = รอลูกค้าอนุมัติซ่อม, WAITING_PARTS = รออะไหล่, REPAIRING = กำลังซ่อม, READY_FOR_PAYMENT = ซ่อมเสร็จรอชำระเงิน, COMPLETED = ส่งมอบเรียบร้อย, CANCELLED = ยกเลิกซ่อม)',
            example: 'RECEIVED',
          },
          Accessories: {
            type: 'object',
            description: 'สถานะอุปกรณ์ที่ติดมากับเครื่องตอนส่งซ่อม (JSON)',
            properties: {
              drip_tray: { type: 'boolean', description: 'ถาดน้ำทิ้ง', example: false },
              portafilter: { type: 'boolean', description: 'ด้ามอัด', example: false },
              basket_1_shot: { type: 'boolean', description: 'Basket 1 shot', example: false },
              basket_2_shot: { type: 'boolean', description: 'Basket 2 shot', example: false },
              power_cord: { type: 'boolean', description: 'สายไฟ', example: true },
              water_tank: { type: 'boolean', description: 'แทงค์น้ำ', example: false },
              tamper: { type: 'boolean', description: 'แทมเปอร์', example: false },
              steam_wand_sleeve: { type: 'boolean', description: 'ปลอกท่อสตรีม', example: false },
              other: { type: 'string', nullable: true, description: 'อุปกรณ์อื่นๆ', example: 'ฝาครอบ' },
            },
            example: {
              power_cord: true,
              other: 'ฝาครอบ',
            },
          },
          Customer: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', description: 'ชื่อลูกค้า / บริษัท', example: 'บจก. ชาวันชา' },
              phone: { type: 'string', description: 'เบอร์โทรศัพท์', example: '093-446-8687' },
              address: {
                type: 'string',
                nullable: true,
                description: 'ที่อยู่ลูกค้า',
                example: 'ต.แสนสุข อ.เมืองชลบุรี จ.ชลบุรี',
              },
              isWeAreFriends: {
                type: 'boolean',
                description: 'สมาชิก We Are Friends',
                example: false,
              },
              createdAt: { type: 'string', format: 'date-time', example: '2026-11-02T03:30:00.000Z' },
            },
          },
          CatalogItem: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              barcode: { type: 'string', nullable: true, description: 'รหัสอะไหล่/บาร์โค้ด', example: '1681573' },
              description: { type: 'string', description: 'ชื่อรายการอะไหล่หรือบริการ', example: 'เฟืองดอกเห็ด' },
              defaultPrice: { type: 'number', format: 'double', description: 'ราคามาตรฐาน (บาท)', example: 250 },
              itemType: {
                type: 'string',
                description: 'ประเภท (PART = อะไหล่, SERVICE = บริการ)',
                example: 'PART',
              },
            },
          },
          CreateCatalogItemInput: {
            type: 'object',
            required: ['description'],
            properties: {
              barcode: { type: 'string', nullable: true, description: 'รหัสอะไหล่/บาร์โค้ด (ถ้ามี)', example: '1681573' },
              description: { type: 'string', description: 'ชื่ออะไหล่หรือบริการ', example: 'เฟืองดอกเห็ด' },
              defaultPrice: { type: 'number', format: 'double', description: 'ราคา (บาท)', example: 250 },
              itemType: { type: 'string', description: 'PART หรือ SERVICE', default: 'PART', example: 'PART' },
            },
          },
          RepairOrderItem: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              repairOrderId: { type: 'integer', example: 1 },
              itemOrder: { type: 'integer', description: 'ลำดับที่ในใบแจ้งซ่อม', example: 4 },
              barcode: { type: 'string', nullable: true, example: '1681573' },
              description: { type: 'string', example: 'เฟืองดอกเห็ด' },
              quantity: { type: 'integer', example: 1 },
              unitPrice: { type: 'number', format: 'double', example: 250 },
              amount: { type: 'number', format: 'double', example: 250 },
            },
          },
          RepairOrderItemInput: {
            type: 'object',
            required: ['itemOrder', 'description', 'quantity', 'unitPrice'],
            properties: {
              itemOrder: { type: 'integer', description: 'ลำดับที่', example: 4 },
              barcode: { type: 'string', nullable: true, description: 'รหัสอะไหล่ (ถ้ามี)', example: '1681573' },
              description: { type: 'string', description: 'รายการอะไหล่/บริการ', example: 'เฟืองดอกเห็ด' },
              quantity: { type: 'integer', description: 'จำนวน', default: 1, example: 1 },
              unitPrice: { type: 'number', format: 'double', description: 'ราคาต่อหน่วย', example: 250 },
              amount: { type: 'number', format: 'double', description: 'จำนวนเงินรวม (ถ้าไม่ส่งจะคำนวณจาก quantity * unitPrice)', example: 250 },
            },
          },
          RepairOrder: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              trackingUuid: {
                type: 'string',
                format: 'uuid',
                description: 'UUID สำหรับให้ลูกค้าติดตามสถานะแบบไม่ต้องล็อกอิน',
                example: '493370cc-e31a-4105-a90d-5d1e3dbeecf0',
              },
              bookNo: { type: 'string', nullable: true, description: 'เล่มที่', example: '112' },
              orderNo: { type: 'string', description: 'เลขที่ใบงาน (Unique)', example: '5595' },
              receivedDate: { type: 'string', format: 'date-time', example: '2026-11-02T03:45:00.000Z' },
              jobType: { type: 'string', example: 'ซ่อม' },
              customerId: { type: 'integer', example: 1 },
              customer: { $ref: '#/components/schemas/Customer' },
              machineBrandModel: { type: 'string', example: 'เครื่องปั่น GEF A9+' },
              serialNumber: { type: 'string', nullable: true, example: 'GEF-A9P-00192' },
              warrantyStatus: { $ref: '#/components/schemas/WarrantyStatus' },
              warrantyExpDate: { type: 'string', format: 'date-time', nullable: true, example: null },
              customerReportedIssue: { type: 'string', example: 'แจ้งว่าเครื่องไม่ทำงาน' },
              technicianNote: { type: 'string', nullable: true, example: 'เช็คเฟืองดอกเห็ด' },
              accessories: { $ref: '#/components/schemas/Accessories' },
              hasLoanerMachine: { type: 'boolean', example: false },
              billingType: { $ref: '#/components/schemas/BillingType' },
              careInstructions: { type: 'object', nullable: true, example: null },
              warningNote: { type: 'string', nullable: true, example: null },
              operatingHours: { type: 'number', format: 'double', nullable: true, example: 1.5 },
              subTotal: { type: 'number', format: 'double', example: 815 },
              grandTotal: { type: 'number', format: 'double', example: 815 },
              currentStatus: { $ref: '#/components/schemas/RepairStatus' },
              receivedBy: { type: 'string', nullable: true, example: 'พนักงานหน้าร้าน' },
              technicianName: { type: 'string', nullable: true, example: 'ช่างประจำร้าน' },
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/RepairOrderItem' },
              },
              createdAt: { type: 'string', format: 'date-time', example: '2026-11-02T03:45:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2026-11-02T03:45:00.000Z' },
            },
          },
          CreateRepairOrderInput: {
            type: 'object',
            required: ['orderNo', 'machineBrandModel', 'customerReportedIssue', 'accessories'],
            properties: {
              bookNo: { type: 'string', nullable: true, description: 'เล่มที่ใบงาน', example: '112' },
              orderNo: { type: 'string', description: 'เลขที่ใบงาน (ห้ามซ้ำ)', example: '5596' },
              jobType: { type: 'string', default: 'ซ่อม', example: 'ซ่อม' },
              customer: {
                type: 'object',
                required: ['name', 'phone'],
                description: 'ข้อมูลลูกค้า (หากเบอร์โทรนี้ยังไม่มีในระบบ จะสร้างลูกค้าใหม่ให้อัตโนมัติ)',
                properties: {
                  name: { type: 'string', example: 'ร้านกาแฟหอมไกล สาขาบางแสน' },
                  phone: { type: 'string', example: '089-123-4567' },
                  address: { type: 'string', nullable: true, example: '99/1 ถ.ลงหาดบางแสน ต.แสนสุข อ.เมือง จ.ชลบุรี' },
                  isWeAreFriends: { type: 'boolean', default: false, example: true },
                },
              },
              machineBrandModel: { type: 'string', description: 'ยี่ห้อ/รุ่นเครื่อง', example: 'เครื่องปั่น GEF A9+' },
              serialNumber: { type: 'string', nullable: true, description: 'หมายเลขเครื่อง S/N', example: 'GEF-2025-8812' },
              warrantyStatus: { $ref: '#/components/schemas/WarrantyStatus' },
              customerReportedIssue: { type: 'string', description: 'อาการที่ลูกค้าแจ้ง', example: 'แจ้งว่าเครื่องไม่ทำงาน มอเตอร์มีกลิ่นไหม้' },
              accessories: { $ref: '#/components/schemas/Accessories' },
              hasLoanerMachine: { type: 'boolean', description: 'รับเครื่องสำรองใช้ระหว่างซ่อม', default: false, example: false },
              receivedBy: { type: 'string', nullable: true, description: 'ชื่อพนักงานรับงาน', example: 'แอดมินฝ้าย' },
            },
          },
          QuoteRepairOrderInput: {
            type: 'object',
            properties: {
              technicianNote: {
                type: 'string',
                description: 'บันทึกผลการตรวจเช็คจากช่าง',
                example: 'เช็คเฟืองดอกเห็ด พบว่าเฟืองสึกหรอ ต้องเปลี่ยนเฟืองดอกเห็ดใหม่และทำความสะอาดมอเตอร์',
              },
              technicianName: {
                type: 'string',
                description: 'ชื่อช่างผู้ตรวจเช็ค',
                example: 'ช่างต้น',
              },
              billingType: { $ref: '#/components/schemas/BillingType' },
              currentStatus: {
                type: 'string',
                enum: ['WAITING_APPROVAL', 'WAITING_PARTS', 'CHECKING'],
                description: 'สถานะหลังประเมินราคา (เช่น WAITING_APPROVAL หรือ WAITING_PARTS)',
                example: 'WAITING_APPROVAL',
              },
              operatingHours: {
                type: 'number',
                format: 'double',
                nullable: true,
                example: 1.5,
              },
              warningNote: {
                type: 'string',
                nullable: true,
                example: 'ไม่ควรปั่นน้ำแข็งก้อนใหญ่เกินไปโดยไม่ใส่น้ำหล่อเลี้ยง',
              },
              items: {
                type: 'array',
                description: 'รายการอะไหล่และค่าแรง (ระบบจะคำนวณ subTotal และ grandTotal ให้อัตโนมัติ)',
                items: { $ref: '#/components/schemas/RepairOrderItemInput' },
                example: [
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
          },
          UpdateRepairStatusInput: {
            type: 'object',
            required: ['currentStatus'],
            properties: {
              currentStatus: {
                $ref: '#/components/schemas/RepairStatus',
              },
              technicianNote: {
                type: 'string',
                nullable: true,
                description: 'อัปเดตบันทึกจากช่างเพิ่มเติม (ถ้ามี)',
                example: 'ดำเนินการเปลี่ยนเฟืองดอกเห็ดและทดสอบเดินเครื่องเรียบร้อย พร้อมส่งมอบ',
              },
              technicianName: {
                type: 'string',
                nullable: true,
                example: 'ช่างต้น',
              },
            },
            example: {
              currentStatus: 'READY_FOR_PAYMENT',
              technicianNote: 'ซ่อมและเทสต์เครื่องเสร็จเรียบร้อย รอลูกค้าชำระเงินและรับเครื่อง',
              technicianName: 'ช่างต้น',
            },
          },
          CustomerApproveInput: {
            type: 'object',
            required: ['action'],
            properties: {
              action: {
                type: 'string',
                enum: ['APPROVE', 'CANCEL'],
                description: 'APPROVE = ลูกค้ากดอนุมัติซ่อม (เปลี่ยนสถานะเป็น REPAIRING ทันที), CANCEL = ลูกค้ายกเลิกซ่อม (เปลี่ยนสถานะเป็น CANCELLED)',
                example: 'APPROVE',
              },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'ไม่พบข้อมูลที่ต้องการ' },
              details: { type: 'string', nullable: true, example: 'Not found' },
            },
          },
        },
      },
      paths: {
        '/api/catalog': {
          get: {
            tags: ['1. Catalog (รายการอะไหล่และบริการ)'],
            summary: 'ดึงรายการอะไหล่และบริการมาตรฐานทั้งหมด',
            description: 'ดึงรายการอะไหล่ (`PART`) และบริการ (`SERVICE`) ทั้งหมดในระบบ สามารถค้นหาจากชื่อหรือรหัสบาร์โค้ดได้',
            parameters: [
              {
                name: 'search',
                in: 'query',
                required: false,
                description: 'ค้นหาจากรหัสบาร์โค้ด (เช่น 1681573) หรือชื่อรายการ (เช่น เฟืองดอกเห็ด)',
                schema: { type: 'string' },
              },
              {
                name: 'itemType',
                in: 'query',
                required: false,
                description: 'กรองตามประเภท (PART หรือ SERVICE)',
                schema: { type: 'string', enum: ['PART', 'SERVICE'] },
              },
            ],
            responses: {
              '200': {
                description: 'สำเร็จ คืนค่ารายการอะไหล่และบริการทั้งหมด',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CatalogItem' },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['1. Catalog (รายการอะไหล่และบริการ)'],
            summary: 'เพิ่มรายการอะไหล่หรือบริการใหม่เข้าคลัง',
            description:
              'เพิ่มรายการอะไหล่หรือบริการมาตรฐานใหม่ เช่น รหัส `1681573` เฟืองดอกเห็ด ราคา `250`, ค่าบริการซ่อม `350`, ทำความสะอาดภายใน-ภายนอก `0`',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateCatalogItemInput' },
                  examples: {
                    partExample: {
                      summary: 'ตัวอย่างเพิ่มอะไหล่ (เฟืองดอกเห็ด)',
                      value: {
                        barcode: '1681573',
                        description: 'เฟืองดอกเห็ด',
                        defaultPrice: 250,
                        itemType: 'PART',
                      },
                    },
                    serviceRepairExample: {
                      summary: 'ตัวอย่างเพิ่มบริการ (ค่าบริการซ่อม 350)',
                      value: {
                        barcode: 'SRV-REPAIR-01',
                        description: 'ค่าบริการซ่อม',
                        defaultPrice: 350,
                        itemType: 'SERVICE',
                      },
                    },
                    serviceCleanExample: {
                      summary: 'ตัวอย่างเพิ่มบริการฟรี (ทำความสะอาดภายใน-ภายนอก 0)',
                      value: {
                        barcode: 'SRV-CLEAN-01',
                        description: 'ทำความสะอาดภายใน-ภายนอก',
                        defaultPrice: 0,
                        itemType: 'SERVICE',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'เพิ่มรายการอะไหล่/บริการสำเร็จ',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CatalogItem' },
                  },
                },
              },
              '400': {
                description: 'ข้อมูลไม่ถูกต้อง หรือรหัสบาร์โค้ดซ้ำ',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/repair-orders': {
          get: {
            tags: ['2. Repair Orders (จัดการใบแจ้งซ่อมสำหรับหน้าร้านและช่าง)'],
            summary: 'ดึงรายการใบซ่อมทั้งหมด (กรองตาม status หรือค้นหา search จากเลขใบงาน/เบอร์โทร)',
            description: 'ดึงรายการใบแจ้งซ่อมทั้งหมดพร้อมข้อมูลลูกค้าและรายการอะไหล่ เรียงลำดับจากใบงานล่าสุด',
            parameters: [
              {
                name: 'status',
                in: 'query',
                required: false,
                description: 'กรองตามสถานะใบงาน (เช่น RECEIVED, WAITING_APPROVAL, REPAIRING, COMPLETED)',
                schema: { $ref: '#/components/schemas/RepairStatus' },
              },
              {
                name: 'search',
                in: 'query',
                required: false,
                description: 'ค้นหาจากเลขใบงาน (เช่น 5595), เบอร์โทรลูกค้า (เช่น 093-446-8687) หรือชื่อลูกค้า',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'สำเร็จ คืนค่ารายการใบแจ้งซ่อม',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/RepairOrder' },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['2. Repair Orders (จัดการใบแจ้งซ่อมสำหรับหน้าร้านและช่าง)'],
            summary: 'พนักงานหน้าร้านสร้างใบรับซ่อมใหม่ (สร้างลูกค้าให้อัตโนมัติหากเบอร์โทรยังไม่เคยมี)',
            description:
              'รับข้อมูลลูกค้า + ข้อมูลเครื่อง + อุปกรณ์ที่ติดมากับเครื่องในครั้งเดียว ถ้าเบอร์โทรลูกค้ายังไม่เคยมีในระบบจะสร้าง Customer ใหม่ให้ทันที',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateRepairOrderInput' },
                },
              },
            },
            responses: {
              '201': {
                description: 'สร้างใบรับซ่อมใหม่สำเร็จ',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/RepairOrder' },
                  },
                },
              },
              '400': {
                description: 'ข้อมูลไม่ครบถ้วน หรือเลขที่ใบงานซ้ำ',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/repair-orders/{id}': {
          get: {
            tags: ['2. Repair Orders (จัดการใบแจ้งซ่อมสำหรับหน้าร้านและช่าง)'],
            summary: 'ดึงรายละเอียดใบซ่อมตาม ID (พร้อมข้อมูลลูกค้าและรายการอะไหล่ items)',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'รหัสใบแจ้งซ่อม (ID เช่น 1)',
                schema: { type: 'integer', example: 1 },
              },
            ],
            responses: {
              '200': {
                description: 'สำเร็จ คืนค่ารายละเอียดใบซ่อม',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/RepairOrder' },
                  },
                },
              },
              '404': {
                description: 'ไม่พบใบแจ้งซ่อม',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/repair-orders/{id}/quote': {
          patch: {
            tags: ['2. Repair Orders (จัดการใบแจ้งซ่อมสำหรับหน้าร้านและช่าง)'],
            summary: 'สำหรับช่างบันทึกผลการตรวจเช็ค อัปเดตรายการอะไหล่/ค่าแรง คำนวณยอดรวม และเปลี่ยนสถานะเป็นรออนุมัติ',
            description:
              'บันทึก `technicianNote`, แทนที่รายการอะไหล่/ค่าบริการ (`items`), คำนวณ `subTotal` และ `grandTotal` อัตโนมัติ พร้อมเปลี่ยนสถานะเป็น `WAITING_APPROVAL` หรือ `WAITING_PARTS`',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'รหัสใบแจ้งซ่อม (ID เช่น 1)',
                schema: { type: 'integer', example: 1 },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/QuoteRepairOrderInput' },
                },
              },
            },
            responses: {
              '200': {
                description: 'บันทึกผลตรวจเช็คและใบเสนอราคาสำเร็จ',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/RepairOrder' },
                  },
                },
              },
              '404': {
                description: 'ไม่พบใบแจ้งซ่อม',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/repair-orders/{id}/status': {
          patch: {
            tags: ['2. Repair Orders (จัดการใบแจ้งซ่อมสำหรับหน้าร้านและช่าง)'],
            summary: 'สำหรับช่าง/แอดมินกดเปลี่ยนสถานะงานซ่อมแบบเรียลไทม์',
            description:
              'เปลี่ยนสถานะใบงาน เช่น `REPAIRING` (กำลังซ่อม), `READY_FOR_PAYMENT` (ซ่อมเสร็จรอชำระเงิน), `COMPLETED` (ส่งมอบแล้ว)',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'รหัสใบแจ้งซ่อม (ID เช่น 1)',
                schema: { type: 'integer', example: 1 },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UpdateRepairStatusInput' },
                },
              },
            },
            responses: {
              '200': {
                description: 'เปลี่ยนสถานะงานซ่อมสำเร็จ',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/RepairOrder' },
                  },
                },
              },
              '404': {
                description: 'ไม่พบใบแจ้งซ่อม',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/track/{trackingUuid}': {
          get: {
            tags: ['3. Public Tracking (ลูกค้าติดตามสถานะและอนุมัติซ่อม)'],
            summary: 'ดึงข้อมูลสถานะใบงาน รายการอะไหล่ และยอดเงิน ด้วย trackingUuid สำหรับลูกค้า',
            description:
              'ดึงข้อมูลใบงานซ่อมแบบเรียลไทม์สำหรับหน้าเว็บของลูกค้าโดยไม่ต้องล็อกอิน (สามารถใส่ `trackingUuid` เช่น `493370cc-e31a-4105-a90d-5d1e3dbeecf0` หรือเลขใบงาน `5595` เพื่อทดสอบได้)',
            parameters: [
              {
                name: 'trackingUuid',
                in: 'path',
                required: true,
                description: 'Tracking UUID ของใบงาน (หรือเลขที่ใบงาน เช่น 5595)',
                schema: {
                  type: 'string',
                  example: '493370cc-e31a-4105-a90d-5d1e3dbeecf0',
                },
              },
            ],
            responses: {
              '200': {
                description: 'สำเร็จ คืนค่าข้อมูลสถานะใบงาน รายการอะไหล่ และยอดเงิน',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/RepairOrder' },
                  },
                },
              },
              '404': {
                description: 'ไม่พบข้อมูลใบงานซ่อม',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/track/{trackingUuid}/approve': {
          post: {
            tags: ['3. Public Tracking (ลูกค้าติดตามสถานะและอนุมัติซ่อม)'],
            summary: 'สำหรับลูกค้ากดปุ่ม "อนุมัติซ่อม" (APPROVE) หรือ "ยกเลิกซ่อม" (CANCEL)',
            description:
              'เมื่อลูกค้าส่ง `{"action": "APPROVE"}` ระบบจะเปลี่ยนสถานะใบงานเป็น `REPAIRING` ทันที หรือหากส่ง `{"action": "CANCEL"}` จะเปลี่ยนเป็น `CANCELLED`',
            parameters: [
              {
                name: 'trackingUuid',
                in: 'path',
                required: true,
                description: 'Tracking UUID ของใบงาน (หรือเลขที่ใบงาน เช่น 5595)',
                schema: {
                  type: 'string',
                  example: '493370cc-e31a-4105-a90d-5d1e3dbeecf0',
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CustomerApproveInput' },
                  examples: {
                    approveExample: {
                      summary: 'ลูกค้ากดปุ่ม "อนุมัติซ่อม" (เปลี่ยนเป็น REPAIRING)',
                      value: {
                        action: 'APPROVE',
                      },
                    },
                    cancelExample: {
                      summary: 'ลูกค้ากดปุ่ม "ยกเลิกซ่อม" (เปลี่ยนเป็น CANCELLED)',
                      value: {
                        action: 'CANCEL',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'ดำเนินการอนุมัติ/ยกเลิกซ่อมสำเร็จ',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'ลูกค้าอนุมัติการซ่อมเรียบร้อยแล้ว เปลี่ยนสถานะเป็นกำลังซ่อม (REPAIRING)',
                        },
                        repairOrder: { $ref: '#/components/schemas/RepairOrder' },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'ไม่พบข้อมูลใบงานซ่อม',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  return spec
}
