/** Für Client-Komponenten (Tabs): serialisierbar, keine Prisma-Dates. */
export type SerializedMessage = {
  id: string
  content: string
  createdAt: string
  senderId: string
  receiverId: string
}

export type SerializedOffer = {
  id: string
  amount: number
  description: string
  status: string
  attachmentUrl: string | null
  companyId: string
  executionDate: string | null
  company: {
    name: string
    profile: { avatarUrl: string | null } | null
  }
}

export type CustomerRequestBundle = {
  id: string
  status: string
  title: string
  description: string
  expertId: string | null
  expert: {
    id: string
    name: string
    profile: { avatarUrl: string | null } | null
  } | null
  framework: {
    budget: number | null
    timeline: string | null
    description: string
    attachmentUrl: string | null
  } | null
  images: { id: string; url: string }[]
  messages: SerializedMessage[]
  offers: SerializedOffer[]
  acceptedOffer: SerializedOffer | null
}
