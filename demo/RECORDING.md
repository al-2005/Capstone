# Submission recording checklist

The capstone video must be an actual screen recording with narration. Do not create a mock video
or claim that cloud resources, CI, or GitOps ran if they did not.

## Suggested video order

1. Present the slides in `presentation.pptx`: project purpose, architecture, and stack.
2. Show the repository layout and key API, UI, tests, Docker, workflow, Terraform, Helm, and
   Argo CD files.
3. Trigger a safe push or use the most recent push and show the complete GitHub Actions run:
   tests, image build, Trivy scan, and GHCR push.
4. Show the real Terraform plan and AWS Console VPC/EKS cluster.
5. Show Argo CD with the application Synced and Healthy.
6. Run `kubectl get pods,services,ingress -n campus-helpdesk` and `helm list -n campus-helpdesk`.
7. Open the app through Ingress and submit/update one support request.
8. Show the Prometheus Targets page with the app UP, then the populated Grafana dashboard.
9. If time permits, diagnose one deliberately broken troubleshooting-lab resource.
10. State honestly which pieces were run locally and which used AWS.

## Recording notes

- Keep the terminal prompt with the real terminal username/host visible in command shots.
- Use `docs/screenshots/README.md` as the capture list. Capture evidence during each real step.
- Avoid exposing credentials, access tokens, kubeconfig, personal student data, or private
  repository settings.
- Save the final MP4 in this `demo/` directory as `campus-helpdesk-demo.mp4`.
- The recording, AWS screenshots, CI screenshots, and PPT must all be reviewed before submission.

## Submission

Submit the repository URL using the course form:
<https://forms.gle/XWAP1vAumDJgAPM1A>
