import { adminClient, verifiedUser } from "@/lib/supabase/server";
import { evaluate } from "@/lib/eligibility/evaluate";
import { submissionSchema, validateAnswers } from "@/lib/eligibility/schema";
import { errorResponse, HttpError, limitRequests, requestBody, sameOrigin } from "@/lib/server/http";
import { deliverResultEmail } from "@/lib/server/email";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await verifiedUser();
    if (!user) throw new HttpError(401, "Sign in and verify your email to save and view your result.");
    const parsed = submissionSchema.safeParse(await requestBody(request));
    if (!parsed.success) throw new HttpError(400, "Please complete the checker and acknowledge how your answers will be used.");
    const { route, answers, submissionId } = parsed.data;
    try { validateAnswers(route, answers); } catch (error) { throw new HttpError(400, (error as Error).message); }
    await limitRequests(`assessment:${user.id}`, 20, 3600);
    const result = evaluate(route, answers);
    const saved = await adminClient().rpc("save_eligibility_assessment", { p_user_id: user.id, p_submission_id: submissionId, p_route: route, p_answers: answers, p_result: result, p_rules_version: result.rulesVersion });
    if (saved.error) throw new HttpError(saved.error.code === "23505" ? 409 : 503, "We couldn’t save your assessment. Your answers are still in this tab; please retry.");
    let emailStatus: "sent" | "pending" | "failed" = "pending";
    try { emailStatus = await deliverResultEmail(saved.data); } catch { console.error("Email remains queued", { assessmentId: saved.data }); }
    return Response.json({ id: saved.data, emailStatus }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
