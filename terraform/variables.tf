variable "aws_region" {
  description = "AWS region for Campus Helpdesk infrastructure."
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "EKS cluster name."
  type        = string
  default     = "campus-helpdesk"
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version."
  type        = string
  default     = "1.32"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS managed workers."
  type        = list(string)
  default     = ["t3.medium"]
}
