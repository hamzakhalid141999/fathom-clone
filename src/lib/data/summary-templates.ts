import type {
  Meeting,
  SummaryBullet,
  SummarySection,
  SummaryTemplate,
  TranscriptSegment,
} from "@/lib/types/meeting";

function keywords(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4)
  );
}

/**
 * Derived summary lines have no authored timestamp, so link each one to the
 * transcript segment it shares the most distinctive words with.
 */
function matchSegment(text: string, transcript: TranscriptSegment[]) {
  const words = keywords(text);
  let best: { segment: TranscriptSegment; score: number } | undefined;

  for (const segment of transcript) {
    const segmentWords = keywords(segment.text);
    let score = 0;
    for (const word of words) if (segmentWords.has(word)) score += 1;
    if (!best || score > best.score) best = { segment, score };
  }

  return best && best.score >= 2 ? best.segment.startMs : undefined;
}

/** Seeded bullets are written as "Label: detail" where a short prefix reads as a label. */
function toBullet(raw: string, timestampMs?: number): SummaryBullet {
  const separator = raw.indexOf(": ");
  if (separator > 0 && separator <= 40) {
    return {
      label: raw.slice(0, separator),
      text: raw.slice(separator + 2),
      timestampMs,
    };
  }
  return { text: raw, timestampMs };
}

function enhancedTemplate(meeting: Meeting): SummaryTemplate {
  const { summary, actionItems, transcript } = meeting;
  const sections: SummarySection[] = [
    { heading: "Meeting Purpose", paragraph: summary.headline },
    {
      heading: "Key Takeaways",
      bullets: summary.bullets.map((b) => toBullet(b, matchSegment(b, transcript))),
    },
  ];

  if (summary.decisions?.length) {
    sections.push({
      heading: "Decisions",
      bullets: summary.decisions.map((d) => toBullet(d, matchSegment(d, transcript))),
    });
  }

  if (summary.nextSteps?.length) {
    sections.push({
      heading: "Next Steps",
      bullets: summary.nextSteps.map((step, index) =>
        toBullet(
          step,
          actionItems[index]?.sourceTimestampMs ?? matchSegment(step, transcript)
        )
      ),
    });
  }

  return {
    id: "enhanced",
    name: "Enhanced Summary",
    description: "Purpose, takeaways, decisions and next steps",
    sections,
  };
}

function generalTemplate(meeting: Meeting): SummaryTemplate {
  const { summary, participants, transcript, actionItems } = meeting;

  return {
    id: "general",
    name: "General Meeting",
    description: "Overview, discussion and follow-ups",
    sections: [
      { heading: "Overview", paragraph: summary.headline },
      {
        heading: "Attendees",
        bullets: participants.map((p) => ({
          label: p.name,
          text: p.role ?? "Participant",
          timestampMs: transcript.find((s) => s.speakerId === p.id)?.startMs,
        })),
      },
      {
        heading: "Discussion",
        bullets: transcript.slice(0, 6).map((segment) => ({
          label: segment.speakerName,
          text: segment.text,
          timestampMs: segment.startMs,
        })),
      },
      {
        heading: "Follow-ups",
        bullets: actionItems.map((item) => ({
          text: item.text,
          label: item.assigneeName,
          timestampMs: item.sourceTimestampMs,
        })),
      },
    ],
  };
}

function actionPlanTemplate(meeting: Meeting): SummaryTemplate {
  const { actionItems, summary, transcript } = meeting;
  const byAssignee = new Map<string, typeof actionItems>();

  for (const item of actionItems) {
    const key = item.assigneeName ?? "Unassigned";
    byAssignee.set(key, [...(byAssignee.get(key) ?? []), item]);
  }

  const sections: SummarySection[] = Array.from(byAssignee.entries()).map(
    ([assignee, items]) => ({
      heading: assignee,
      bullets: items.map((item) => ({
        text: item.text,
        label: item.dueDate ? `Due ${item.dueDate}` : undefined,
        timestampMs: item.sourceTimestampMs,
      })),
    })
  );

  if (summary.decisions?.length) {
    sections.unshift({
      heading: "Decisions to honour",
      bullets: summary.decisions.map((d) => toBullet(d, matchSegment(d, transcript))),
    });
  }

  return {
    id: "action-plan",
    name: "Action Plan",
    description: "Grouped by owner with due dates",
    sections,
  };
}

export function getSummaryTemplates(meeting: Meeting): SummaryTemplate[] {
  if (meeting.summaryTemplates?.length) return meeting.summaryTemplates;
  return [
    enhancedTemplate(meeting),
    generalTemplate(meeting),
    actionPlanTemplate(meeting),
  ];
}
