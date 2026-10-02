import { z } from "zod";
import { questionsFor, type Answers, type Route } from "./questions-v1";

export const submissionSchema = z.object({
  submissionId: z.uuid(),
  route: z.enum(["digital-technology", "academia-research", "design"]),
  answers: z.record(z.string().max(40), z.string().max(40)),
  consent: z.literal(true),
}).strict();

export type Submission = z.infer<typeof submissionSchema>;

export function validateAnswers(route: Route, answers: Answers): void {
  const questions = questionsFor(route, answers);
  const expected = new Set(questions.map((question) => question.id));
  if (Object.keys(answers).some((key) => !expected.has(key))) throw new Error("Your answers include a field that does not belong to this pathway.");
  for (const question of questions) {
    if (!question.options.some((option) => option.value === answers[question.id])) {
      throw new Error(`Please answer: ${question.title}`);
    }
  }
}
