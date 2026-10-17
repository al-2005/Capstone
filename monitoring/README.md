# Monitoring

## Local Docker Compose

```bash
docker compose --profile observability up --build
```

The Compose Prometheus config scrapes `backend:8000/metrics`. Grafana is preconfigured to use
Prometheus and loads `grafana/dashboard.json` from the dashboard provider.

## Kubernetes

Install the Prometheus Operator chart and its discovery settings:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  -f monitoring/kube-prometheus-stack-values.yaml
```

Enable the ServiceMonitor in the application chart values, then sync/reconcile it through Argo CD:

```yaml
serviceMonitor:
  enabled: true
```

Confirm the target is healthy in Prometheus at **Status → Targets**. The API exposes standard
request and latency metrics from `prometheus-fastapi-instrumentator`.

The application Helm chart includes a labeled Grafana dashboard ConfigMap. The dashboards sidecar
in `kube-prometheus-stack` discovers it when the chart's ServiceMonitor integration is enabled.
