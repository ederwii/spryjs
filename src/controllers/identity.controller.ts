import { Application } from "express";
import IdentityService from "../services/identity.service";
import lservice from "../services/local.service";
import BaseController from "../base/base.controller";
import { DoRequest } from "../utils";

const service = lservice.getInstance();
const BASE_API = "/api/user";
const userService = new IdentityService(service.tokenSecret, service.salt);

export class UserController extends BaseController {
  constructor(private app: Application) {
    super(app, userService, BASE_API, {
      auth: {
        get: true,
        getById: true,
        post: false,
        patch: true,
        delete: true,
        put: true,
      },
    });
    this.registerPrivateRoutes();
    this.registerRoutes();
  }

  registerPrivateRoutes() {
    this.app
      .route(`${BASE_API}/login`)
      .post(DoRequest, async (req, res) => {
        service.authenticate(req.body.username, req.body.password).then((token) => {
          res.send(token);
        }).catch((err) => {
          res.sendStatus(500);
          console.error(err);
        })
      });
  }
}
