locals {
  name_prefix             = "${var.project_name}-${var.environment}"
  aws_name_prefix         = replace(lower("${var.project_name}-${var.environment}"), "_", "-")
  frontend_container_name = "frontend"
  backend_container_name  = "backend"
  availability_zones      = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnet_cidrs     = ["10.0.0.0/24", "10.0.1.0/24"]
  private_db_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]
  frontend_image          = "${aws_ecr_repository.frontend.repository_url}:latest"
  backend_image           = "${aws_ecr_repository.backend.repository_url}:latest"
  frontend_url            = "https://${aws_cloudfront_distribution.app.domain_name}"
  database_url            = "postgresql://${var.db_username}:${urlencode(random_password.db_password.result)}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${aws_db_instance.postgres.db_name}?schema=public"
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags,
  )
}
