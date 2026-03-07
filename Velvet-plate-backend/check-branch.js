const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const branches = await prisma.branch.findMany();
    console.log('Branches in DB:', JSON.stringify(branches, null, 2));

    if (branches.length > 0) {
        const firstBranch = branches[0];
        console.log('Ensuring first branch is verified and visible...');
        await prisma.branch.update({
            where: { id: firstBranch.id },
            data: {
                storeStatus: 'verified',
                isVisible: true,
                branchName: firstBranch.branchName || 'Main Store',
                city: firstBranch.city || 'Chennai'
            }
        });
        console.log('Updated branch:', firstBranch.id);
    } else {
        console.log('No branches found in DB. Please onboard a branch first.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
