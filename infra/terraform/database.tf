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
