import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Return a lightweight health status for load balancers',
  })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHealth() {
    return { status: 'ok' };
  }
}
