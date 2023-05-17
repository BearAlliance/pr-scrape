import { NextResponse } from "next/server";
import {
  getApproverCount,
  getDuration,
  getMergedPRs,
  getReviewComments,
} from "@/pr-info";
import { PullRequest } from "@octokit/webhooks-types";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { owner: string; repo: string };
  }
) {
  const prs = await getMergedPRs(params.owner, params.repo);

  //
  const prInfo = prs.map(async (pr) => {
    return {
      name: pr.title,
      number: pr.number,
      href: pr.html_url,
      reviews: await getReviewComments(params.owner, params.repo, pr.number),
      duration: getDuration(pr as PullRequest),
      approvers: await getApproverCount(params.owner, params.repo, pr.number),
      // passingChecks: await getPassingBuildChecks(params.owner, params.repo, pr.number),
    };
  });

  return NextResponse.json({
    owner: params.owner,
    repo: params.repo,
    prInfo: await Promise.all(prInfo),
  });
}
