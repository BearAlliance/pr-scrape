import { Octokit } from "octokit";

// Authenticate with octokit
const octokit = new Octokit({
  auth: "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",
});

// get all closed PRs for a given repo
async function getMergedPRs(owner, repo) {
  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "closed",
    limit: 4,
  });
  return data;
}

// get the number of review comments on a PR
async function getReviewComments(owner, repo, prNumber) {
  const { data } = await octokit.rest.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  });
  return data.length;
}

// get the duration between a PR being opened and closed
function getDuration(pr) {
  const opened = new Date(pr.created_at);
  const closed = new Date(pr.closed_at);
  const diff = closed.getTime() - opened.getTime();
  const days = diff / (1000 * 3600 * 24);
  return days.toFixed(0);
}

// get the number of PR approvers
async function getApproverCount(owner, repo, prNumber) {
  const { data } = await octokit.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: prNumber,
  });
  const approvers = data.filter((review) => review.state === "APPROVED");
  return approvers.length;
}

// get the number of passing build checks for a PR
async function getPassingBuildChecks(owner, repo, prNumber) {
  const checks = await getBuildChecks(owner, repo, prNumber);
  const passingChecks = checks.filter(
    (check) => check.conclusion === "success"
  );
  return passingChecks.length;
}

// get the number of failed build checks for a PR
async function getFailedBuildChecks(owner, repo, prNumber) {
  const checks = await getBuildChecks(owner, repo, prNumber);
  const failedChecks = checks.filter((check) => check.conclusion === "failure");
  return failedChecks.length;
}

// get build checks for a PR
async function getBuildChecks(owner, repo, prNumber) {
  const { data } = await octokit.rest.checks.listForRef({
    owner,
    repo,
    ref: `pull/${prNumber}/head`,
  });
  return data;
}

// print prs
async function printPRs(owner, repo) {
  const prs = await getMergedPRs(owner, repo);
  printHeader();
  // console.log(JSON.stringify(prs[0], null, 2));
  for (const pr of prs) {
    const reviewCommentsCount = await getReviewComments(owner, repo, pr.number);
    const approverCount = await getApproverCount(owner, repo, pr.number);
    console.log(
      `| ${pr.number} | ${pr.title} | ${
        getDuration(pr) + " days"
      } | ${reviewCommentsCount} | ${approverCount} |`
    );
  }
}

// print a Markdown table header
function printHeader() {
  console.log("| Number | Title | Open duration | Comments | Approvals ");
  console.log("| --- | --- | --- | --- | --- |");
}

printPRs("facebook", "react");
