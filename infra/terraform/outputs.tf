output "cloudfront_domain_name" {
  description = "Default CloudFront hostname for the application."
  value       = aws_cloudfront_distribution.app.domain_name
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name."
  value       = aws_lb.app.dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "frontend_service_name" {
  description = "Frontend ECS service name."
  value       = aws_ecs_service.frontend.name
}

output "backend_service_name" {
  description = "Backend ECS service name."
  value       = aws_ecs_service.backend.name
}

output "frontend_ecr_repository_url" {
  description = "Frontend ECR repository URL."
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  description = "Backend ECR repository URL."
  value       = aws_ecr_repository.backend.repository_url
}

output "github_actions_deploy_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC deployments."
  value       = aws_iam_role.github_actions_deploy.arn
}

output "database_url_secret_arn" {
  description = "Secrets Manager ARN holding DATABASE_URL."
  value       = aws_secretsmanager_secret.database_url.arn
}

output "jwt_secret_arn" {
  description = "Secrets Manager ARN holding JWT_SECRET."
  value       = aws_secretsmanager_secret.jwt_secret.arn
}
