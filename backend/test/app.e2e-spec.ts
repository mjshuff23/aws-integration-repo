/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth and Users API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/app_db?schema=public';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.COOKIE_NAME = 'auth_token';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('supports signup, login, me, update, logout, delete, and stale-session rejection', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);

    const signedUpUser = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'casey@example.com',
        password: 'P@ssw0rd123',
        name: 'Casey',
      })
      .expect(201);

    expect(signedUpUser.body).toMatchObject({
      email: 'casey@example.com',
      name: 'Casey',
    });
    expect(signedUpUser.body.passwordHash).toBeUndefined();

    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'casey@example.com',
        password: 'P@ssw0rd123',
      })
      .expect(409);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'casey@example.com',
        password: 'wrong-password',
      })
      .expect(401);

    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/auth/login')
      .send({
        email: 'casey@example.com',
        password: 'P@ssw0rd123',
      })
      .expect(200);

    const meResponse = await agent.get('/api/auth/me').expect(200);
    expect(meResponse.body.email).toBe('casey@example.com');

    const updatedUser = await agent
      .patch('/api/users/me')
      .send({
        name: 'Casey Morgan',
        password: 'N3wP@ssw0rd123',
      })
      .expect(200);

    expect(updatedUser.body.name).toBe('Casey Morgan');

    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);

    const relogin = await agent
      .post('/api/auth/login')
      .send({
        email: 'casey@example.com',
        password: 'N3wP@ssw0rd123',
      })
      .expect(200);

    expect(relogin.body.name).toBe('Casey Morgan');

    const deletedUser = await agent.delete('/api/users/me').expect(200);
    expect(deletedUser.body.email).toBe('casey@example.com');

    await agent.get('/api/users/me').expect(401);
  });
});
