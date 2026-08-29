const { prisma } = require('./prisma-test');

async function test() {
  try {
    console.log('Testing prisma lookup...');
    const user = await prisma.user.findFirst({
      where: { email: 'admin@pharmadist.com' },
    });
    console.log('User found:', user);
  } catch (err) {
    console.error('Prisma test error:', err);
  }
}
test();
