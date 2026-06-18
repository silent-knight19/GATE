import { notFound } from "next/navigation"
import { syllabus } from "@/lib/data/syllabus"
import { SubjectDetail } from "./subject-detail"

export async function generateStaticParams() {
  return syllabus.map((s) => ({ id: s.id }))
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const subject = syllabus.find((s) => s.id === id)
  if (!subject) notFound()
  return <SubjectDetail subject={subject} />
}
