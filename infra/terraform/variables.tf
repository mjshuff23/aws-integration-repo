variable "aws_region" {
  description = "AWS region for the learning stack."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project slug used in AWS resource names."
  type        = string
  default     = "auth-stack"
}

variable "environment" {
  description = "Short environment name."
  type        = string
  default     = "prod"
}

variable "github_repository" {
  description = "GitHub repository in OWNER/REPO format that can assume the deploy role."
  type        = string
}

variable "github_branch" {
  description = "Git branch allowed to deploy through GitHub OIDC."
  type        = string
  default     = "main"
}

variable "frontend_cpu" {
  description = "CPU units for the frontend ECS task."
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory in MiB for the frontend ECS task."
  type        = number
  default     = 512
}

variable "backend_cpu" {
  description = "CPU units for the backend ECS task."
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory in MiB for the backend ECS task."
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks."
  type        = number
  default     = 1
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks."
  type        = number
  default     = 1
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "app_db"
}

variable "db_username" {
  description = "PostgreSQL admin username."
  type        = string
  default     = "app_user"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GiB for RDS."
  type        = number
  default     = 20
}

variable "jwt_expires_in" {
  description = "JWT expiration duration string."
  type        = string
  default     = "7d"
}

variable "cookie_name" {
  description = "JWT cookie name."
  type        = string
  default     = "auth_token"
}

variable "log_retention_days" {
  description = "CloudWatch log retention for ECS services."
  type        = number
  default     = 7
}

variable "tags" {
  description = "Extra tags to merge into every tagged resource."
  type        = map(string)
  default     = {}
}
