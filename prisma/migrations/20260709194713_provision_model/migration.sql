-- CreateTable
CREATE TABLE "SchoolProvision" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "clerkUserId" TEXT NOT NULL,
    "generatedPassword" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolProvision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProvision_requestId_key" ON "SchoolProvision"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProvision_schoolId_key" ON "SchoolProvision"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProvision_subscriptionId_key" ON "SchoolProvision"("subscriptionId");

-- AddForeignKey
ALTER TABLE "SchoolProvision" ADD CONSTRAINT "SchoolProvision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SchoolRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolProvision" ADD CONSTRAINT "SchoolProvision_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolProvision" ADD CONSTRAINT "SchoolProvision_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
