import type { CustomerRequestBundle } from '@/components/dashboard/customer-request-types'

/** Prisma-Request → serialisierbares Objekt für Tab-Client-Komponente. */
export function toCustomerBundle(req: any): CustomerRequestBundle {
  const accepted = req.offers.find((o: any) => o.status === 'ACCEPTED') ?? null

  const serializeOffer = (o: any) => ({
    id: o.id,
    amount: o.amount,
    description: o.description,
    status: o.status,
    attachmentUrl: o.attachmentUrl,
    companyId: o.companyId,
    executionDate: o.executionDate ? o.executionDate.toISOString() : null,
    company: {
      name: o.company.name,
      profile: o.company.profile,
    },
  })

  return {
    id: req.id,
    status: req.status,
    title: req.title,
    description: req.description,
    expertId: req.expertId,
    expert: req.expert
      ? {
          id: req.expert.id,
          name: req.expert.name,
          profile: req.expert.profile,
        }
      : null,
    framework: req.framework
      ? {
          budget: req.framework.budget,
          timeline: req.framework.timeline,
          description: req.framework.description,
          attachmentUrl: req.framework.attachmentUrl,
        }
      : null,
    images: (req.images || []).map((img: any) => ({ id: img.id, url: img.url })),
    messages: (req.messages || []).map((m: any) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      senderId: m.senderId,
      receiverId: m.receiverId,
    })),
    offers: (req.offers || []).map(serializeOffer),
    acceptedOffer: accepted ? serializeOffer(accepted) : null,
  }
}
