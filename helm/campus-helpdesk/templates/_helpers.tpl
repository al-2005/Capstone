{{- define "helpdesk.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "helpdesk.labels" -}}
app.kubernetes.io/name: {{ include "helpdesk.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "helpdesk.selectorLabels" -}}
app.kubernetes.io/name: {{ include "helpdesk.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
