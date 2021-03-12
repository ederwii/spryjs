import { Application } from "express";
import lservice from "../services/local.service";
import BaseController from "../base/base.controller";
import { DoRequest, DoPrivateRequest } from "../utils";
import IdentityService from "../services/identity.service";

const service = lservice.getInstance();
const BASE_API = "/api/user";

export class UserController extends BaseController {
  constructor(private app: Application, private userService: IdentityService) {
    // @ts-ignore
    super(app, BASE_API, userService, {
      auth: {
        getById: true,
        post: false,
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
          res.json({ token });
        }).catch((err) => {
          res.sendStatus(500);
          console.error(err);
        })
      });

    this.app
      .route(`${BASE_API}/password`)
      .put(DoPrivateRequest, async (req, res) => {
        // @ts-ignore
        const result = await userService.ChangePassword(req.body.user, req.body.password, req.body.newPassword);
        if (result) res.sendStatus(200);
        else res.send(403);
      })
  }
}
