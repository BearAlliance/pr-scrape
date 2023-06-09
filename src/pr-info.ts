import { Octokit } from "octokit";
import { PullRequest } from "@octokit/webhooks-types";

let octokit: Octokit;

// Authenticate with octokit
function getOctokit() {
  if (octokit) {
    return octokit;
  } else {
    const token = process.env.GH_TOKEN;
    console.log(token);
    octokit = new Octokit({
      auth: token,
    });
    return octokit;
  }
}

// verify octokit authentication
export async function isAPIKeyValid() {
  try {
    await getOctokit().rest.users.getAuthenticated();
    return true;
  } catch (error) {
    return false;
  }
}

// get all closed PRs for a given repo
export async function getMergedPRs(owner: string, repo: string) {
  const response = await getOctokit().rest.pulls.list({
    owner,
    repo,
    state: "closed",
    limit: 4,
  });
  return response.data;
}

// get the number of review comments on a PR
export async function getReviewComments(
  owner: string,
  repo: string,
  prNumber: number
) {
  const { data } = await getOctokit().rest.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  });
  return data.length;
}

// get the duration between a PR being opened and closed
export function getDuration(pr: PullRequest): string {
  const opened = new Date(pr.created_at);
  const closed = new Date(pr.closed_at || 0);
  const diff = closed.getTime() - opened.getTime();
  const days = diff / (1000 * 3600 * 24);
  return days.toFixed(0);
}

// get the number of PR approvers
export async function getApproverCount(
  owner: string,
  repo: string,
  prNumber: number
): Promise<number> {
  const { data } = await getOctokit().rest.pulls.listReviews({
    owner,
    repo,
    pull_number: prNumber,
  });
  const approvers = data.filter((review) => review.state === "APPROVED");
  return approvers.length;
}

// get the number of passing build checks for a PR
export async function getPassingBuildChecks(
  owner: string,
  repo: string,
  prNumber: number
): Promise<number> {
  const checks = await getBuildChecks(owner, repo, prNumber);
  const passingChecks = checks.filter(
    (check) => check.conclusion === "success"
  );
  return passingChecks.length;
}

// get the number of failed build checks for a PR
export async function getFailedBuildChecks(
  owner: string,
  repo: string,
  prNumber: number
) {
  const checks = await getBuildChecks(owner, repo, prNumber);
  const failedChecks = checks.filter((check) => check.conclusion === "failure");
  return failedChecks.length;
}

// get build checks for a PR
async function getBuildChecks(owner: string, repo: string, prNumber: number) {
  const { data } = await getOctokit().rest.checks.listForRef({
    owner,
    repo,
    ref: `pull/${prNumber}/head`,
  });
  return data.check_runs;
}
