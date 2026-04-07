/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */

import cookieParser from 'cookie-parser';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type MockUser = User;

type MockPrismaService = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

function cloneUser(user: MockUser | null) {
  return user ? { ...user } : null;
}

function createPrismaMock(): MockPrismaService {
  const users = new Map<string, MockUser>();

  return {
    user: {
      findUnique: jest.fn(
        async ({ where }: { where: { id?: string; email?: string } }) => {
          if (where.id) {
            return cloneUser(users.get(where.id) ?? null);
          }

          if (where.email) {
            const user =
              [...users.values()].find(
                (candidate) => candidate.email === where.email,
              ) ?? null;

            return cloneUser(user);
          }

          return null;
        },
      ),
      create: jest.fn(
        async ({
          data,
        }: {
          data: { email: string; name?: string; passwordHash: string };
        }) => {
          const now = new Date();
          const user: MockUser = {
            id: randomUUID(),
            email: data.email,
            name: data.name ?? null,
            passwordHash: data.passwordHash,
            createdAt: now,
            updatedAt: now,
          };

          users.set(user.id, user);
          return cloneUser(user);
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { email?: string; name?: string | null; passwordHash?: string };
        }) => {
          const existingUser = users.get(where.id);

          if (!existingUser) {
            throw new Error('User not found');
          }

          const updatedUser: MockUser = {
            ...existingUser,
            email: data.email ?? existingUser.email,
            name:
              typeof data.name === 'undefined' ? existingUser.name : data.name,
            passwordHash: data.passwordHash ?? existingUser.passwordHash,
            updatedAt: new Date(),
          };

          users.set(updatedUser.id, updatedUser);
          return cloneUser(updatedUser);
        },
      ),
      delete: jest.fn(async ({ where }: { where: { id: string } }) => {
        const existingUser = users.get(where.id);

        if (!existingUser) {
          throw new Error('User not found');
        }

        users.delete(where.id);
        return cloneUser(existingUser);
      }),
    },
  };
}

describe('Auth and Users API (e2e)', () => {
  let app: INestApplication;
  let prismaMock: MockPrismaService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.COOKIE_NAME = 'auth_token';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';

    prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports signup, login, me, update, logout, delete, and stale-session rejection', async () => {
    const signedUpUser = await request(app.getHttpServer())
      .post('/auth/signup')
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
      .post('/auth/signup')
      .send({
        email: 'casey@example.com',
        password: 'P@ssw0rd123',
      })
      .expect(409);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'casey@example.com',
        password: 'wrong-password',
      })
      .expect(401);

    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({
        email: 'casey@example.com',
        password: 'P@ssw0rd123',
      })
      .expect(200);

    const meResponse = await agent.get('/auth/me').expect(200);
    expect(meResponse.body.email).toBe('casey@example.com');

    const updatedUser = await agent
      .patch('/users/me')
      .send({
        name: 'Casey Morgan',
        password: 'N3wP@ssw0rd123',
      })
      .expect(200);

    expect(updatedUser.body.name).toBe('Casey Morgan');

    await agent.post('/auth/logout').expect(200);
    await agent.get('/auth/me').expect(401);

    const relogin = await agent
      .post('/auth/login')
      .send({
        email: 'casey@example.com',
        password: 'N3wP@ssw0rd123',
      })
      .expect(200);

    expect(relogin.body.name).toBe('Casey Morgan');

    const deletedUser = await agent.delete('/users/me').expect(200);
    expect(deletedUser.body.email).toBe('casey@example.com');

    await agent.get('/users/me').expect(401);
  });
});
