import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import Db from './Db';

interface HandlerResponseType {
  status: 'OK' | 'ERROR';
}

declare type HandlerType = <TReq, TRsp extends HandlerResponseType>(
  request: TReq,
) => Promise<TRsp>;

export default class HttpServer {
  expressApp: Application;
  port: number;
  db: Db;
  status: 'created' | 'started';

  constructor({ port, db }: { port: number; db: Db }) {
    this.port = port;
    this.db = db;
    this.status = 'created';

    this.expressApp = express();

    this.expressApp.use(cors({
      origin: ['http://localhost:3000', 'https://tranquil-garden-69631.herokuapp.com'],
      optionsSuccessStatus: 200 // For legacy browser support
    }));
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));

    this.expressApp.post(
      '/persons/add',
      async (req: Request, res: Response) => {
        // persons.push({...req.body, id: uuidv4()})
        await this.db.addPerson({
          person_name: req.body.name,
          birthday: req.body.birthday,
        });
        res.sendStatus(200);
      },
    );

    this.expressApp.post(
      '/persons/delete/:uuid',
      async (req: Request, res: Response) => {
        const {uuid} = req.params
        try {
        await this.db.deletePerson({
          id: uuid
        });
      } catch(error) {
        console.log(error)
      }
        res.sendStatus(200);
      },
    );

    this.expressApp.post(
      '/persons/flush',
      async (req: Request, res: Response) => {
        await this.db.flushPersons();
        res.sendStatus(200);
      },
    );

    this.expressApp.get('/persons', async (req: Request, res: Response) => {
      const personList = await this.db.personsList({ skip: 0, limit: 1000 });
      res.send(personList);
    });

    this.expressApp.get('/persons/:uuid', (req: Request, res: Response) => {
      res.send({});
    });
  }

  async start(): Promise<void> {
    if (this.status === 'started') {
      throw new Error('Already started');
    }

    return new Promise((resolve, reject) => {
      // @ts-ignore
      this.expressApp.listen(this.port, '0.0.0.0', (error) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(`app started ${this.port}`);
        resolve();
      });
      this.status = 'started';
    });
  }
}
