import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma";

dotenv.config();

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({
  adapter,
} as unknown as ConstructorParameters<typeof PrismaClient>[0]);

const services = [
  {
    name: "Swedish Massage",
    description:
      "A classic full-body massage using long, gliding strokes to relax muscles, improve circulation, and ease tension. Perfect for first-time clients or those needing stress relief.",
    price: 8500, // $85.00
    duration: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  },
  {
    name: "Deep Tissue Massage",
    description:
      "Targets the deeper layers of muscle and connective tissue. Ideal for chronic pain, stiff necks, upper back pain, leg muscle tightness, and sore shoulders.",
    price: 10500, // $105.00
    duration: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80",
  },
  {
    name: "Hot Stone Massage",
    description:
      "Smooth, heated basalt stones are placed on key points of the body and used as massage tools. The warmth penetrates deep into muscles for profound relaxation.",
    price: 12000, // $120.00
    duration: 90,
    imageUrl:
      "https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&q=80",
  },
  {
    name: "Aromatherapy Facial",
    description:
      "A luxurious facial treatment combining essential oils tailored to your skin type. Includes deep cleansing, exfoliation, steam, extraction, and a calming mask.",
    price: 9500, // $95.00
    duration: 75,
    imageUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
  },
  {
    name: "Couples Massage",
    description:
      "Enjoy a side-by-side massage experience with your partner in our private couples suite. Both guests receive a customized full-body Swedish or deep tissue massage.",
    price: 18000, // $180.00
    duration: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80",
  },
  {
    name: "Sports Recovery",
    description:
      "Designed for athletes and active individuals. Combines deep tissue techniques with stretching and trigger point therapy to speed up recovery and prevent injury.",
    price: 11000, // $110.00
    duration: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  console.log(`✅ Seeded ${services.length} services`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
