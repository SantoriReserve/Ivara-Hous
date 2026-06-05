import OpenAI from "openai";
import type { AssessmentAnswers } from "@/lib/assessment";
import {
  ASSESSMENT_SYSTEM_PROMPT,
  buildAssessmentUserPrompt,
} from "@/lib/assessment-prompt";
import {
  assessmentAnalysisSchema,
  clampScores,
  OPENAI_ASSESSMENT_JSON_SCHEMA,
  type AssessmentAnalysis,
} from "@/lib/assessment-schema";

const DEFAULT_MODEL = "gpt-4o-mini";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

function parseAnalysisContent(content: string): AssessmentAnalysis {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  const validated = assessmentAnalysisSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Assessment schema validation failed: ${validated.error.message}`);
  }

  return {
    ...validated.data,
    scores: clampScores(validated.data.scores),
  };
}

async function callOpenAI(answers: AssessmentAnswers): Promise<AssessmentAnalysis> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      { role: "system", content: ASSESSMENT_SYSTEM_PROMPT },
      { role: "user", content: buildAssessmentUserPrompt(answers) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "creator_assessment_analysis",
        strict: true,
        schema: OPENAI_ASSESSMENT_JSON_SCHEMA,
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return parseAnalysisContent(content);
}

export async function generateAssessmentAnalysis(
  answers: AssessmentAnswers
): Promise<AssessmentAnalysis> {
  try {
    return await callOpenAI(answers);
  } catch (firstError) {
    try {
      return await callOpenAI(answers);
    } catch {
      throw firstError;
    }
  }
}
