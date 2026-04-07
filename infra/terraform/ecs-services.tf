resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-cluster"
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
