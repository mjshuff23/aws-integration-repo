data "aws_ec2_managed_prefix_list" "cloudfront_origin_facing" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
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
