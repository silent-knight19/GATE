import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { syllabus } from "@/lib/data/syllabus"
import { SubjectDetail } from "./subject-detail"

export const dynamicParams = false

export async function generateStaticParams() {
  return syllabus.map((s) => ({ id: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const subject = syllabus.find((s) => s.id === id)
  if (!subject) {
    return {
      title: "Subject Not Found",
    }
  }
  return {
    title: `${subject.name} Weightage & Syllabus Tracker | GATE CSE 2027`,
    description: `Complete syllabus analysis, average marks, topic-wise weightage, priority topics, and recommended study hours for ${subject.name} in GATE CSE 2027.`,
    keywords: [
      `GATE 2027 ${subject.name}`,
      `GATE CSE ${subject.name} syllabus`,
      `${subject.name} weightage GATE`,
      "GATE 2027 preparation",
      "GATE CSE syllabus"
    ],
  }
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
