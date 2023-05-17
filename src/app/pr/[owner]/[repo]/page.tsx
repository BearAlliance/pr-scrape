import {
  getApproverCount,
  getDuration,
  getMergedPRs,
  getReviewComments,
} from "@/pr-info";
import { PullRequest } from "@octokit/webhooks-types";

// uppercase first letter of a word
function ucFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function tableData(content: string) {
  return (
    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
      {content}
    </td>
  );
}

export default async function Page({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const prs = await getMergedPRs(params.owner, params.repo);
  let prInfoPromises = prs.map(async (pr) => ({
    name: pr.title,
    number: pr.number,
    href: pr.html_url,
    reviews: await getReviewComments(params.owner, params.repo, pr.number),
    duration: getDuration(pr as PullRequest),
    approvals: await getApproverCount(params.owner, params.repo, pr.number),
  }));

  const prInfo = await Promise.all(prInfoPromises);

  const headings = ["number", "name", "approvals", "duration", "reviews"];

  return (
    <div>
      <header aria-label="Page Header">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                PRs for{" "}
                <code>
                  {params.owner}/{params.repo}
                </code>
              </h1>

              <p className="mt-1.5 text-sm text-gray-500">
                Something about a table
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="ltr:text-left rtl:text-right">
                    <tr>
                      {headings.map((heading, key) => (
                        <th
                          key={key}
                          className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                          {ucFirst(heading)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {prInfo.map((pr, index) => {
                      return (
                        <tr key={index}>
                          {tableData(pr.number.toString())}
                          {tableData(pr.name)}
                          {tableData(pr.duration)}
                          {tableData(pr.reviews.toString())}
                          {tableData(pr.approvals.toString())}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
