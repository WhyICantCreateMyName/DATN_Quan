-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "MemberProfile" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "fingerprintId" TEXT,
    "avatarUrl" TEXT,
    "remainingPtSessions" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainerProfile" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "specialization" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    CONSTRAINT "TrainerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainerAvailability" (
    "id" SERIAL PRIMARY KEY,
    "trainerId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "TrainerAvailability_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "ptSessions" INTEGER NOT NULL DEFAULT 0,
    "tag" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MemberSubscription" (
    "id" SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "remainingPtSessions" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "MemberSubscription_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MemberSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyMetric" (
    "id" SERIAL PRIMARY KEY,
    "memberId" INTEGER,
    "trainerId" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BodyMetric_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BodyMetric_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupClass" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL,
    "trainerId" INTEGER,
    "groupClassId" INTEGER,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_groupClassId_fkey" FOREIGN KEY ("groupClassId") REFERENCES "GroupClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "energyLevel" TEXT,
    "nutrition" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutLog_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkoutLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" SERIAL PRIMARY KEY,
    "workoutLogId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    CONSTRAINT "WorkoutExercise_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL,
    "checkInTime" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    CONSTRAINT "CheckIn_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL PRIMARY KEY,
    "cashierId" INTEGER NOT NULL,
    "memberId" INTEGER,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL PRIMARY KEY,
    "invoiceId" INTEGER NOT NULL,
    "planId" INTEGER,
    "productId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subTotal" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffShift" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommissionRate" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,
    "applyTo" TEXT NOT NULL,
    "planId" INTEGER,
    CONSTRAINT "CommissionRate_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffKPI" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "achievedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "StaffKPI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommissionLog" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "invoiceItemId" INTEGER,
    "bookingId" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommissionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LockerRow" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "colCount" INTEGER NOT NULL,
    "layout" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_userId_key" ON "MemberProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_fingerprintId_key" ON "MemberProfile"("fingerprintId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_userId_key" ON "TrainerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerAvailability_trainerId_dayOfWeek_startTime_key" ON "TrainerAvailability"("trainerId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLog_bookingId_key" ON "WorkoutLog"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionRate_planId_key" ON "CommissionRate"("planId");

