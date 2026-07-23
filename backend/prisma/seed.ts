import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { name: "ADIU Communication Service PLC" },
    update: {},
    create: {
      name: "ADIU Communication Service PLC",
      legalName: "ADIU Communication Service PLC",
      primaryDomain: "adiu.example.com",
    },
  });

  const roles = [
    ["learner", "Learner"],
    ["hr_admin", "HR Admin"],
    ["manager", "Manager"],
    ["creator", "Course Creator"],
    ["admin", "System Admin"],
  ];

  for (const [code, name] of roles) {
    await prisma.role.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const levels = ["Beginner", "Intermediate", "Advanced"];
  for (const [displayOrder, name] of levels.entries()) {
    await prisma.courseLevel.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name,
        },
      },
      update: { displayOrder },
      create: {
        organizationId: organization.id,
        name,
        displayOrder,
      },
    });
  }

  const contentTypes = [
    ["video", "Video", "MP4, MOV, AVI"],
    ["document", "Document", "PDF, DOCX, PPTX"],
    ["quiz", "Quiz", "Built-in quiz"],
    ["assignment", "Assignment", "File, text, link"],
    ["survey", "Survey", "Feedback form"],
    ["live_session", "Live Session", "Virtual or in-person"],
  ];

  for (const [code, name, allowedFormats] of contentTypes) {
    await prisma.contentType.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code,
        },
      },
      update: { name, allowedFormats },
      create: {
        organizationId: organization.id,
        code,
        name,
        allowedFormats,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
