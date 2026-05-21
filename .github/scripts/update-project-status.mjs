import { readFileSync } from "node:fs";

const GH_TOKEN = process.env.GH_TOKEN;
const GITHUB_EVENT_NAME = process.env.GITHUB_EVENT_NAME;
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const ORGANIZATION = process.env.ORGANIZATION;
const PROJECT_NUMBER = process.env.PROJECT_NUMBER;
const STATUS_FIELD_NAME = process.env.STATUS_FIELD_NAME ?? "Status";
const READY_STATUS = process.env.READY_STATUS ?? "Ready";
const IN_PROGRESS_STATUS = process.env.IN_PROGRESS_STATUS ?? "In progress";
const IN_REVIEW_STATUS = process.env.IN_REVIEW_STATUS ?? "In review";
const DONE_STATUS = process.env.DONE_STATUS ?? "Done";
const TRACKED_ASSIGNEE = process.env.TRACKED_ASSIGNEE;

if (!GH_TOKEN) {
  throw new Error(
    "Missing GH_TOKEN. Configure PROJECT_APP_ID and PROJECT_APP_PRIVATE_KEY for the workflow.",
  );
}

if (!GITHUB_EVENT_NAME || !GITHUB_EVENT_PATH || !GITHUB_REPOSITORY) {
  throw new Error(
    "Missing required GitHub Actions event environment variables.",
  );
}

if (!ORGANIZATION || !PROJECT_NUMBER) {
  throw new Error("Missing ORGANIZATION or PROJECT_NUMBER.");
}

const event = JSON.parse(readFileSync(GITHUB_EVENT_PATH, "utf8"));
const [repositoryOwner, repositoryName] = GITHUB_REPOSITORY.split("/");

function normalize(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function extractIssueNumberFromText(text = "") {
  const closingReference = text.match(
    /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/i,
  );

  if (closingReference) {
    return Number(closingReference[1]);
  }

  const looseReference = text.match(/#(\d+)\b/);
  return looseReference ? Number(looseReference[1]) : null;
}

const ISSUE_BRANCH_TYPES = new Set([
  "bugfix",
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "feature",
  "fix",
  "hotfix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
]);

function extractIssueNumberFromBranch(branchName = "") {
  const explicitReference = branchName.match(/(?:^|[/-])#(\d+)(?=$|[/-])/);

  if (explicitReference) {
    return Number(explicitReference[1]);
  }

  const issuePrefixReference = branchName.match(
    /(?:^|[/-])(?:issue|issues|gh)-(\d+)(?=$|[/-])/i,
  );

  if (issuePrefixReference) {
    return Number(issuePrefixReference[1]);
  }

  const conventionalReference = branchName.match(/^([a-z]+)\/(\d+)(?=$|[-/])/i);

  if (
    conventionalReference &&
    ISSUE_BRANCH_TYPES.has(conventionalReference[1].toLowerCase())
  ) {
    return Number(conventionalReference[2]);
  }

  return null;
}

function resolveTarget() {
  if (GITHUB_EVENT_NAME === "issues") {
    if (event.action === "assigned") {
      const assignee = event.assignee?.login;

      if (TRACKED_ASSIGNEE && assignee !== TRACKED_ASSIGNEE) {
        return null;
      }

      return {
        issueNumber: event.issue?.number,
        statusName: READY_STATUS,
        reason: `issue assigned to ${assignee ?? "an assignee"}`,
      };
    }

    if (event.action === "closed") {
      return {
        issueNumber: event.issue?.number,
        statusName: DONE_STATUS,
        reason: "issue closed",
      };
    }
  }

  if (GITHUB_EVENT_NAME === "create") {
    if (event.ref_type !== "branch") {
      return null;
    }

    return {
      issueNumber: extractIssueNumberFromBranch(event.ref),
      statusName: IN_PROGRESS_STATUS,
      reason: `branch created: ${event.ref}`,
    };
  }

  if (
    GITHUB_EVENT_NAME === "pull_request" ||
    GITHUB_EVENT_NAME === "pull_request_target"
  ) {
    const pullRequest = event.pull_request;

    const issueNumber =
      extractIssueNumberFromText(pullRequest?.body ?? "") ??
      extractIssueNumberFromBranch(pullRequest?.head?.ref ?? "");

    if (event.action === "closed") {
      if (!pullRequest?.merged) {
        return null;
      }

      return {
        issueNumber,
        statusName: DONE_STATUS,
        reason: `pull request merged: #${pullRequest.number}`,
      };
    }

    return {
      issueNumber,
      statusName: IN_REVIEW_STATUS,
      reason: `pull request ${event.action}: #${pullRequest?.number}`,
    };
  }

  return null;
}

async function graphql(query, variables = {}) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${GH_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "linka-project-automation",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    throw new Error(JSON.stringify(payload.errors ?? payload, null, 2));
  }

  return payload.data;
}

async function getProjectData() {
  const data = await graphql(
    `
      query GetProjectData($organization: String!, $projectNumber: Int!) {
        organization(login: $organization) {
          projectV2(number: $projectNumber) {
            id
            fields(first: 100) {
              nodes {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      organization: ORGANIZATION,
      projectNumber: Number(PROJECT_NUMBER),
    },
  );

  const project = data.organization?.projectV2;

  if (!project) {
    throw new Error(`Project ${ORGANIZATION}/${PROJECT_NUMBER} was not found.`);
  }

  const statusField = project.fields.nodes.find(
    (field) => field && normalize(field.name) === normalize(STATUS_FIELD_NAME),
  );

  if (!statusField) {
    throw new Error(`Project field "${STATUS_FIELD_NAME}" was not found.`);
  }

  return { project, statusField };
}

async function getIssue(issueNumber, projectId) {
  const data = await graphql(
    `
      query GetIssue($owner: String!, $name: String!, $issueNumber: Int!) {
        repository(owner: $owner, name: $name) {
          issue(number: $issueNumber) {
            id
            number
            title
            url
            projectItems(first: 100) {
              nodes {
                id
                project {
                  id
                }
              }
            }
          }
        }
      }
    `,
    {
      owner: repositoryOwner,
      name: repositoryName,
      issueNumber,
    },
  );

  const issue = data.repository?.issue;

  if (!issue) {
    throw new Error(`Issue #${issueNumber} was not found.`);
  }

  const existingItem = issue.projectItems.nodes.find(
    (item) => item.project.id === projectId,
  );

  return { issue, existingItem };
}

async function addIssueToProject(projectId, issueId) {
  const data = await graphql(
    `
      mutation AddIssueToProject($projectId: ID!, $issueId: ID!) {
        addProjectV2ItemById(
          input: { projectId: $projectId, contentId: $issueId }
        ) {
          item {
            id
          }
        }
      }
    `,
    { projectId, issueId },
  );

  return data.addProjectV2ItemById.item.id;
}

async function updateStatus(projectId, itemId, fieldId, optionId) {
  await graphql(
    `
      mutation UpdateStatus(
        $projectId: ID!
        $itemId: ID!
        $fieldId: ID!
        $optionId: String!
      ) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: { singleSelectOptionId: $optionId }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `,
    { projectId, itemId, fieldId, optionId },
  );
}

const target = resolveTarget();

if (!target?.issueNumber || !target.statusName) {
  console.log("No project status update required for this event.");
  process.exit(0);
}

const { project, statusField } = await getProjectData();
const option = statusField.options.find(
  (candidate) => normalize(candidate.name) === normalize(target.statusName),
);

if (!option) {
  throw new Error(
    `Status option "${target.statusName}" was not found in field "${STATUS_FIELD_NAME}".`,
  );
}

const { issue, existingItem } = await getIssue(target.issueNumber, project.id);
const itemId =
  existingItem?.id ?? (await addIssueToProject(project.id, issue.id));

await updateStatus(project.id, itemId, statusField.id, option.id);

console.log(
  `Moved issue #${issue.number} (${issue.title}) to "${option.name}" because ${target.reason}.`,
);
