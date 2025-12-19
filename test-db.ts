import { prisma } from './lib/prisma'

async function main() {
    try {
        const count = await prisma.user.count()
        console.log('User count:', count)
    } catch (e) {
        console.error('Test failed:', e)
    }
}

main()
