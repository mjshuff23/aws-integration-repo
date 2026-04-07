data "aws_availability_zones" "available" {
  state = "available"
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
