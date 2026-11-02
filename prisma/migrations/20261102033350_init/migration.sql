-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `isWeAreFriends` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatalogItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barcode` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `defaultPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `itemType` VARCHAR(191) NOT NULL DEFAULT 'PART',

    UNIQUE INDEX `CatalogItem_barcode_key`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trackingUuid` VARCHAR(191) NOT NULL,
    `bookNo` VARCHAR(191) NULL,
    `orderNo` VARCHAR(191) NOT NULL,
    `receivedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `jobType` VARCHAR(191) NOT NULL DEFAULT 'ซ่อม',
    `customerId` INTEGER NOT NULL,
    `machineBrandModel` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NULL,
    `warrantyStatus` ENUM('IN_WARRANTY', 'OUT_OF_WARRANTY') NOT NULL DEFAULT 'OUT_OF_WARRANTY',
    `warrantyExpDate` DATETIME(3) NULL,
    `customerReportedIssue` TEXT NOT NULL,
    `technicianNote` TEXT NULL,
    `accessories` JSON NOT NULL,
    `hasLoanerMachine` BOOLEAN NOT NULL DEFAULT false,
    `billingType` ENUM('OUT_OF_WARRANTY_PAID', 'IN_WARRANTY_FREE', 'IN_WARRANTY_PAID') NULL,
    `careInstructions` JSON NULL,
    `warningNote` TEXT NULL,
    `operatingHours` DECIMAL(5, 2) NULL,
    `subTotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `currentStatus` ENUM('RECEIVED', 'CHECKING', 'WAITING_APPROVAL', 'WAITING_PARTS', 'REPAIRING', 'READY_FOR_PAYMENT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'RECEIVED',
    `receivedBy` VARCHAR(191) NULL,
    `technicianName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RepairOrder_trackingUuid_key`(`trackingUuid`),
    UNIQUE INDEX `RepairOrder_orderNo_key`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairOrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairOrderId` INTEGER NOT NULL,
    `itemOrder` INTEGER NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RepairOrder` ADD CONSTRAINT `RepairOrder_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepairOrderItem` ADD CONSTRAINT `RepairOrderItem_repairOrderId_fkey` FOREIGN KEY (`repairOrderId`) REFERENCES `RepairOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
