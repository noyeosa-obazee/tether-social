require("dotenv").config();
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  const users = [];
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("👥 Creating users...");
  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        bio: faker.person.bio(),
        avatarUrl: faker.image.avatar(),
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  console.log("🔗 Creating follow relationships...");
  let followCount = 0;
  for (let i = 0; i < users.length; i++) {
    const followCount_user = faker.number.int({ min: 3, max: 7 });

    for (let j = 0; j < followCount_user; j++) {
      const randomIdx = faker.number.int({ min: 0, max: users.length - 1 });
      const targetUser = users[randomIdx];
      if (targetUser.id !== users[i].id) {
        try {
          await prisma.follow.create({
            data: {
              followerId: users[i].id,
              followingId: targetUser.id,
            },
          });
          followCount++;
        } catch (err) {
          // Skip if follow relationship already exists
        }
      }
    }
  }
  console.log(`✅ Created ${followCount} follow relationships`);

  console.log("📝 Creating posts...");
  const posts = [];
  for (let i = 0; i < 40; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const post = await prisma.post.create({
      data: {
        content: faker.lorem.paragraph(),
        imageUrl: Math.random() > 0.5 ? faker.image.url() : null,
        authorId: randomUser.id,
      },
    });
    posts.push(post);
  }
  console.log(`✅ Created ${posts.length} posts`);

  console.log("💬 Creating comments...");
  let commentCount = 0;
  for (const post of posts) {
    const commentCount_post = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < commentCount_post; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentence(),
          authorId: randomUser.id,
          postId: post.id,
        },
      });
      commentCount++;
    }
  }
  console.log(`✅ Created ${commentCount} comments`);

  console.log("👍 Creating likes...");
  let likeCount = 0;
  for (const post of posts) {
    const likeCount_post = faker.number.int({ min: 2, max: 10 });
    const shuffled = users.sort(() => Math.random() - 0.5);

    for (let i = 0; i < likeCount_post; i++) {
      try {
        await prisma.like.create({
          data: {
            userId: shuffled[i].id,
            postId: post.id,
          },
        });
        likeCount++;
      } catch (err) {}
    }
  }
  console.log(`✅ Created ${likeCount} likes`);

  console.log("💌 Creating conversations and messages...");
  let conversationCount = 0;
  let messageCount = 0;

  for (let i = 0; i < 10; i++) {
    const user1 = users[Math.floor(Math.random() * users.length)];
    const user2 = users[Math.floor(Math.random() * users.length)];

    if (user1.id !== user2.id) {
      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              connect: [{ id: user1.id }, { id: user2.id }],
            },
          },
        });
        conversationCount++;

        const messageCount_conv = faker.number.int({ min: 3, max: 8 });
        for (let j = 0; j < messageCount_conv; j++) {
          const sender = Math.random() > 0.5 ? user1 : user2;
          await prisma.message.create({
            data: {
              content: faker.lorem.sentence(),
              senderId: sender.id,
              conversationId: conversation.id,
            },
          });
          messageCount++;
        }
      } catch (err) {}
    }
  }
  console.log(`✅ Created ${conversationCount} conversations`);
  console.log(`✅ Created ${messageCount} messages`);

  console.log("\n✨ Database seeding completed successfully!");
  console.log(`
📊 Summary:
   - Users: ${users.length}
   - Follow relationships: ${followCount}
   - Posts: ${posts.length}
   - Comments: ${commentCount}
   - Likes: ${likeCount}
   - Conversations: ${conversationCount}
   - Messages: ${messageCount}
  `);
}

main()
  .catch((err) => {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
