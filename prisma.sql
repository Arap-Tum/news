generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
//  New enum for verification
enum VerificationStatus {
  PENDING     // waiting for admin review
  APPROVED    // admin approved publishing
  REJECTED    // admin rejected
}

enum UserRole {
  USER
  AUTHOR
  EDITOR
  ADMIN
}

model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  role      String    @default("author")
  createdAt DateTime  @default(now())
  articles  Article[]
}

model Article {
  id             String      @id @default(uuid())
  slug           String?     @unique             // URL-friendly identifier

  title          String
  subtitle       String?                         // Optional secondary headline
  content        String
  excerpt        String?                         // Short preview/summary

  verificationStatus VerificationStatus @default(PENDING)
  verifiedAt     DateTime? 


  imageUrl       String?
  category       Category?      @relation(fields: [categoryId], references: [id])
  categoryId Int?

  author     User     @relation(fields: [authorId], references: [id])
  authorId   String

  // County classification (Nandi, Nakuru, or Other)
  countyId    Int?
  county      County?    @relation(fields: [countyId], references: [id])

  isTrending Boolean  @default(false)
  isFeatured Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  articles Article[]
}

model County {
  id        Int    @id @default(autoincrement())
  name      String    @unique   // e.g. Nandi, Uasin Gishu, Nakuru
  articles  Article[]
}



-- npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/baseline/migration.sql