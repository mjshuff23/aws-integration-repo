data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host_header" {
  name = "Managed-AllViewerExceptHostHeader"
}

data "aws_ec2_managed_prefix_list" "cloudfront_origin_facing" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

data "aws_iam_policy_document" "ecs_task_execution_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "github_oidc_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:environment:${var.github_environment_name}"]
    }
  }
}

data "aws_iam_policy_document" "ecs_task_execution_secrets" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
    ]

    resources = [
      aws_secretsmanager_secret.database_url.arn,
      aws_secretsmanager_secret.jwt_secret.arn,
    ]
  }
}

data "aws_iam_policy_document" "github_actions_deploy" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
    ]

    resources = ["*"]
  }

  statement {
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]

    resources = [
      aws_ecr_repository.frontend.arn,
      aws_ecr_repository.backend.arn,
    ]
  }

  statement {
    actions = [
      "ecs:DescribeClusters",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:DescribeTasks",
      "ecs:ListTasks",
      "ecs:RegisterTaskDefinition",
      "ecs:RunTask",
      "ecs:StopTask",
      "ecs:TagResource",
      "ecs:UpdateService",
    ]

    resources = ["*"]
  }

  statement {
    actions = ["iam:PassRole"]

    resources = [
      aws_iam_role.ecs_task_execution.arn,
    ]
  }
}

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

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-igw"
  })
}

resource "aws_subnet" "public" {
  for_each = {
    for index, cidr in local.public_subnet_cidrs :
    index => {
      cidr = cidr
      az   = local.availability_zones[index]
    }
  }

  vpc_id                  = aws_vpc.main.id
  availability_zone       = each.value.az
  cidr_block              = each.value.cidr
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-${each.key + 1}"
    Tier = "public"
  })
}

resource "aws_subnet" "private_db" {
  for_each = {
    for index, cidr in local.private_db_subnet_cidrs :
    index => {
      cidr = cidr
      az   = local.availability_zones[index]
    }
  }

  vpc_id            = aws_vpc.main.id
  availability_zone = each.value.az
  cidr_block        = each.value.cidr

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-${each.key + 1}"
    Tier = "database"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_db_subnet_group" "database" {
  name       = "${local.name_prefix}-database"
  subnet_ids = [for subnet in aws_subnet.private_db : subnet.id]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-database"
  })
}

resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb"
  description = "Allow only CloudFront origin traffic to the ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "CloudFront origin-facing traffic"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront_origin_facing.id]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb"
  })
}

resource "aws_security_group" "frontend_service" {
  name        = "${local.name_prefix}-frontend"
  description = "Allow ALB access to the frontend task"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "ALB to frontend"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-frontend"
  })
}

resource "aws_security_group" "backend_service" {
  name        = "${local.name_prefix}-backend"
  description = "Allow ALB access to the backend task"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "ALB to backend"
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend"
  })
}

resource "aws_security_group" "database" {
  name        = "${local.name_prefix}-database"
  description = "Allow database access from the backend task"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Backend to PostgreSQL"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_service.id]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-database"
  })
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${local.name_prefix}-frontend"
  force_delete         = true
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-frontend"
  })
}

resource "aws_ecr_repository" "backend" {
  name                 = "${local.name_prefix}-backend"
  force_delete         = true
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend"
  })
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${local.name_prefix}/backend/DATABASE_URL"
  recovery_window_in_days = 0

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}/backend/DATABASE_URL"
  })
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${local.name_prefix}/backend/JWT_SECRET"
  recovery_window_in_days = 0

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}/backend/JWT_SECRET"
  })
}

resource "aws_db_instance" "postgres" {
  identifier              = "${local.name_prefix}-postgres"
  engine                  = "postgres"
  engine_version          = "18"
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_allocated_storage
  storage_type            = "gp3"
  db_name                 = var.db_name
  username                = var.db_username
  password                = random_password.db_password.result
  db_subnet_group_name    = aws_db_subnet_group.database.name
  vpc_security_group_ids  = [aws_security_group.database.id]
  multi_az                = false
  publicly_accessible     = false
  storage_encrypted       = true
  backup_retention_period = 0
  deletion_protection     = false
  skip_final_snapshot     = true
  apply_immediately       = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-postgres"
  })
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${local.name_prefix}/frontend"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name = "/ecs/${local.name_prefix}/frontend"
  })
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name_prefix}/backend"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name = "/ecs/${local.name_prefix}/backend"
  })
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${local.name_prefix}-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name   = "${local.name_prefix}-ecs-task-secrets"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.ecs_task_execution_secrets.json
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  tags = local.common_tags
}

resource "aws_iam_role" "github_actions_deploy" {
  name               = "${local.name_prefix}-github-actions-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_oidc_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "${local.name_prefix}-github-actions-deploy"
  role   = aws_iam_role.github_actions_deploy.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}

resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-cluster"
  })
}

resource "aws_lb" "app" {
  name               = substr("${local.aws_name_prefix}-alb", 0, 32)
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [for subnet in aws_subnet.public : subnet.id]
  idle_timeout       = 60

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb"
  })
}

resource "aws_lb_target_group" "frontend" {
  name        = substr("${local.aws_name_prefix}-frontend", 0, 32)
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    matcher             = "200-399"
    path                = "/"
    timeout             = 5
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-frontend"
  })
}

resource "aws_lb_target_group" "backend" {
  name        = substr("${local.aws_name_prefix}-backend", 0, 32)
  port        = 4000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    matcher             = "200-399"
    path                = "/api/health"
    timeout             = 5
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend"
  })
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api", "/api/*"]
    }
  }
}

resource "aws_cloudfront_distribution" "app" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${local.name_prefix} learning distribution"
  price_class     = "PriceClass_100"

  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host_header.id
    target_origin_id         = "alb-origin"
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-cloudfront"
  })
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${local.name_prefix}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.frontend_cpu)
  memory                   = tostring(var.frontend_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = local.frontend_container_name
      image     = local.frontend_image
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "NEXT_TELEMETRY_DISABLED"
          value = "1"
        },
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = "/api"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.frontend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-frontend"
  })
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name_prefix}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.backend_cpu)
  memory                   = tostring(var.backend_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = local.backend_container_name
      image     = local.backend_image
      essential = true
      portMappings = [
        {
          containerPort = 4000
          hostPort      = 4000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "4000"
        },
        {
          name  = "FRONTEND_URL"
          value = local.frontend_url
        },
        {
          name  = "JWT_EXPIRES_IN"
          value = var.jwt_expires_in
        },
        {
          name  = "COOKIE_NAME"
          value = var.cookie_name
        }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend"
  })
}

resource "aws_ecs_service" "frontend" {
  name                              = "${local.name_prefix}-frontend"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.frontend.arn
  desired_count                     = var.frontend_desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 60

  deployment_controller {
    type = "ECS"
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = local.frontend_container_name
    container_port   = 3000
  }

  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.frontend_service.id]
    subnets          = [for subnet in aws_subnet.public : subnet.id]
  }

  depends_on = [aws_lb_listener.http]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-frontend"
  })
}

resource "aws_ecs_service" "backend" {
  name                              = "${local.name_prefix}-backend"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.backend.arn
  desired_count                     = var.backend_desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 60

  deployment_controller {
    type = "ECS"
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = local.backend_container_name
    container_port   = 4000
  }

  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.backend_service.id]
    subnets          = [for subnet in aws_subnet.public : subnet.id]
  }

  depends_on = [aws_lb_listener_rule.backend_api]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend"
  })
}
