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
