import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { CreateIncomeDto, EditIncomeDto } from 'src/income/dto';
import { CreateExpenseDto, EditExpenseDto } from 'src/expense/dto';
import { CreateSavingDto, EditSavingDto } from 'src/saving/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    //compile all app modules
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    //init and listen the app to port 4444
    await app.init();
    await app.listen(5959);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:5959');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      firstName: 'Muhammad',
      lastName: 'Mubeen',
      email: 'mmubeen@gmail.com',
      password: '123',
    };
    describe('signup', () => {
      it('Should Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withForm({
            email: dto.email,
            password: dto.password,
            firstName: 'Mubeen',
            lastName: 'Memon',
          })
          .expectStatus(201);
      });
    });

    describe('signin', () => {
      it('Should Signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withForm({
            email: 'mmubeen@gmail.com',
            password: '123',
          })
          .inspect()
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('me', () => {
      it('Should return current user', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Authorization: 'Bearer $S{userAt}',
        });
      });
    });
  });

  describe('Incomes', () => {
    const dto: CreateIncomeDto = {
      name: 'I1',
      type: 'I1',
      amount: 30000,
      date: '2023-09-09',
      description: 'D1',
    };
    describe('Create Income', () => {
      it('Should create income', () => {
        return pactum
          .spec()
          .post('/incomes')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('incomeID', 'id');
      });
    });

    describe('Get Incomes', () => {
      it('Should get Incomes', () => {
        return pactum
          .spec()
          .get('/incomes')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Income by ID', () => {
      it('Should get Income by id', () => {
        return pactum
          .spec()
          .get('/incomes/{id}')
          .withPathParams('id', '$S{incomeID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit Income', () => {
      const dto: EditIncomeDto = {
        name: 'I11',
        type: 'I11',
        amount: 30000,
        date: '2023-09-09',
        description: 'D11',
      };
      it('Should edit Income', () => {
        return pactum
          .spec()
          .patch('/incomes/{id}')
          .withPathParams('id', '$S{incomeID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });

    // describe('Delete Income', () => {
    //   it('Should delete Income', () => {
    //     return pactum
    //       .spec()
    //       .delete('/incomes/{id}')
    //       .withPathParams('id', '$S{incomeID}')
    //       .withHeaders({
    //         Authorization: 'Bearer $S{userAt}',
    //       })
    //       .expectStatus(200);
    //   });

    //   it('Should get empty incomes', () => {
    //     return pactum
    //       .spec()
    //       .get('/incomes')
    //       .withHeaders({
    //         Authorization: 'Bearer $S{userAt}',
    //       })
    //       .expectStatus(200)
    //       .expectJsonLength(0);
    //   });
    // });
  });

  describe('Expenses', () => {
    const dto: CreateExpenseDto = {
      name: 'E1',
      type: 'E1',
      amount: 3000,
      date: '2023-09-09',
      description: 'D1',
      incomeID: 4,
    };
    describe('Create Expense', () => {
      it('Should create expense', () => {
        return pactum
          .spec()
          .post('/expense')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('expenseID', 'id');
      });
    });

    describe('Get Expenses', () => {
      it('Should get Expenses', () => {
        return pactum
          .spec()
          .get('/expense')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Expense by ID', () => {
      it('Should get Expense by id', () => {
        return pactum
          .spec()
          .get('/expense/{id}')
          .withPathParams('id', '$S{expenseID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit Expense', () => {
      const dto: EditExpenseDto = {
        name: 'E11',
        type: 'E11',
        amount: 3000,
        date: '2023-09-09',
        description: 'D11',
      };
      it('Should edit Expense', () => {
        return pactum
          .spec()
          .patch('/expense/{id}')
          .withPathParams('id', '$S{expenseID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });

    describe('Delete Expense', () => {
      it('Should delete Expense', () => {
        return pactum
          .spec()
          .delete('/expense/{id}')
          .withPathParams('id', '$S{expenseID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('Should get empty expense', () => {
        return pactum
          .spec()
          .get('/expense')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });

  describe('Savings', () => {
    const dto: CreateSavingDto = {
      source: 'S1',
      amount: 3000,
      deadline: '2023-09-09',
      description: 'D1',
      incomeID: 4,
    };
    describe('Create Saving', () => {
      it('Should create saving', () => {
        return pactum
          .spec()
          .post('/saving')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('savingID', 'id');
      });
    });

    describe('Get Savings', () => {
      it('Should get Savings', () => {
        return pactum
          .spec()
          .get('/saving')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Saving by ID', () => {
      it('Should get Saving by id', () => {
        return pactum
          .spec()
          .get('/saving/{id}')
          .withPathParams('id', '$S{savingID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit Saving', () => {
      const dto: EditSavingDto = {
        source: 'S11',
        amount: 3000,
        deadline: '2023-09-09',
        description: 'D11',
      };
      it('Should edit Saving', () => {
        return pactum
          .spec()
          .patch('/saving/{id}')
          .withPathParams('id', '$S{savingID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });

    describe('Delete Saving', () => {
      it('Should delete Saving', () => {
        return pactum
          .spec()
          .delete('/saving/{id}')
          .withPathParams('id', '$S{savingID}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('Should get empty savings', () => {
        return pactum
          .spec()
          .get('/saving')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
