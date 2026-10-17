# Evidence screenshots

Save authentic screenshots here as each step is actually run. Keep the terminal prompt visible
with its real user/host identity in command screenshots. Capture the full command and enough
output to prove success; do not type an identity into the terminal to simulate a prompt.

Suggested sequence:

| File | Evidence |
|---|---|
| `01-pytest.png` | `pytest -v` and all tests passing |
| `02-compose.png` | `docker compose ps` with healthy services |
| `03-application.png` | Campus Helpdesk dashboard with demo tickets |
| `04-api.png` | Swagger request/response or successful `curl` result |
| `05-git.png` | `git status` and commit history in the repository |
| `06-ci-run.png` | Successful GitHub Actions run and test/build jobs |
| `07-trivy.png` | Trivy results from the published-image workflow |
| `08-ghcr.png` | SHA-tagged backend/frontend GHCR packages |
| `09-terraform-plan.png` | Actual plan output for AWS infrastructure |
| `10-aws-vpc-eks.png` | AWS Console showing the created VPC and EKS cluster |
| `11-argocd.png` | Argo CD application synced and healthy |
| `12-kubernetes.png` | Pods, Services, Ingress, and Helm release |
| `13-ingress-app.png` | Application loaded from the cluster Ingress URL |
| `14-metrics.png` | Actual `/metrics` endpoint output |
| `15-prometheus-targets.png` | Prometheus target for Campus Helpdesk marked UP |
| `16-grafana.png` | Populated Grafana dashboard panel |
| `17-troubleshooting.png` | Broken resource diagnosis and recovery |
| `18-terraform-destroy.png` | Actual Terraform destroy completion |

Terminal logs from `scripts/run-evidence.sh` go into `docs/evidence/logs/` and are ignored by
Git. Review logs for sensitive output before sharing. Screenshots are not generated from logs;
capture each screenshot from the real terminal, browser, GitHub, AWS, or monitoring UI.
