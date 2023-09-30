import dotenv from "dotenv";
import { $ } from "execa";

console.time("deploy time");

dotenv.config();

const {
  GCP_PROJECT_ID,
  GCR_SERVICE_NAME,
  GCR_REGION,
} = process.env;

const buildArgs = [
  "builds", "submit",
  "--tag", `gcr.io/${GCP_PROJECT_ID}/${GCR_SERVICE_NAME}`,
  "--project", `${GCP_PROJECT_ID}`,
];

$({ stdio: "inherit" })`gcloud ${buildArgs}`.then(() => {
  const deployArgs = [
    "run", "deploy", `${GCR_SERVICE_NAME}`,
    `--image=gcr.io/${GCP_PROJECT_ID}/${GCR_SERVICE_NAME}`,
    `--allow-unauthenticated`,
    `--timeout=30`,
    `--memory=1Gi`,
    `--cpu-boost`,
    `--min-instances=0`,
    `--max-instances=3`,
    `--region=${GCR_REGION}`,
    `--project=${GCP_PROJECT_ID}`,
  ];

  $({ stdio: "inherit" })`gcloud ${deployArgs}`.then(() => {
    console.timeEnd("deploy time");
  });
});