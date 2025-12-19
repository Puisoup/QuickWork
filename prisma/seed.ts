import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'Max Mustermann',
            password: 'password',
            role: 'CUSTOMER',
        },
    })

    const expert = await prisma.user.upsert({
        where: { email: 'expert@example.com' },
        update: {},
        create: {
            email: 'expert@example.com',
            name: 'Erika Expertin',
            password: 'password',
            role: 'EXPERT',
        },
    })

    const company = await prisma.user.upsert({
        where: { email: 'company@example.com' },
        update: {},
        create: {
            email: 'company@example.com',
            name: 'Top Bau AG',
            password: 'password',
            role: 'COMPANY',
        },
    })

    const admin = await prisma.user.upsert({
        where: { email: 'admin@quickwork.com' },
        update: {},
        create: {
            email: 'admin@quickwork.com',
            name: 'QuickWork Boss',
            password: 'password',
            role: 'ADMIN',
        },
    })

    console.log({ customer, expert, company, admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
