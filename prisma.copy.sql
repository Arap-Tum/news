model Article {
  id             String      @id @default(cuid()) // Unique article ID
  slug           String      @unique             // URL-friendly identifier
  title          String                          // Main headline/title
  subtitle       String?                         // Optional secondary headline
  content        String                          // Full body (rich text/HTML/Markdown)
  excerpt        String?                         // Short preview/summary

  // Metadata
  keywords       String[]                        // SEO keywords/tags
  status         ArticleStatus @default(DRAFT)   // Draft, Published, Archived
  visibility     Visibility     @default(PUBLIC) // Public, Private, Members-only

  // Relations
  authorId       String
  author         User         @relation(fields: [authorId], references: [id])
  categories     Category[]                       // Many-to-many categories
  tags           Tag[]                            // Many-to-many tags
  comments       Comment[]                        // Related comments
  media          Media[]                          // Linked images, videos

  // SEO / Social
  metaTitle      String?                         // Custom meta title
  metaDescription String?                        // Custom meta description
  coverImageUrl  String?                         // Thumbnail / cover photo
  canonicalUrl   String?                         // Canonical link

  // Engagement
  viewCount      Int           @default(0)
  likeCount      Int           @default(0)
  shareCount     Int           @default(0)
  rating         Float?                           // Optional rating

  // Scheduling
  scheduledAt    DateTime?                       // When to auto-publish
  publishedAt    DateTime?                       // When article goes live
  updatedAt      DateTime     @updatedAt
  createdAt      DateTime     @default(now())

  // Flags
  isFeatured     Boolean       @default(false)   // Highlighted article
  isPinned       Boolean       @default(false)   // Sticky/pinned article
  isDeleted      Boolean       @default(false)   // Soft delete
}

enum ArticleStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

enum Visibility {
  PUBLIC
  PRIVATE
  MEMBERS
}

// Supporting models
model User {
  id        String     @id @default(cuid())
  name      String
  email     String     @unique
  articles  Article[]
}

model Category {
  id        String     @id @default(cuid())
  name      String     @unique
  articles  Article[]
}

model Tag {
  id        String     @id @default(cuid())
  name      String     @unique
  articles  Article[]
}

model Comment {
  id        String     @id @default(cuid())
  content   String
  authorId  String
  author    User       @relation(fields: [authorId], references: [id])
  articleId String
  article   Article    @relation(fields: [articleId], references: [id])
  createdAt DateTime   @default(now())
}

model Media {
  id        String   @id @default(cuid())
  url       String
  type      MediaType
  articleId String?
  article   Article? @relation(fields: [articleId], references: [id])
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
}
