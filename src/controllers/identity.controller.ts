import { Application } from "express";
import BaseController from "../base/base.controller";
import { DoRequest, DoPrivateRequest } from "../utils";
import IdentityService from "../services/identity.service";

export class UserController extends BaseController {
  constructor(private app: Application, private identityService: IdentityService, private route = "/api/user") {
    // @ts-ignore
    super(app, route, identityService, {
      getById: {
        isPrivate: true
      },
      delete: {
        isPrivate: true
      },
      put: {
        isPrivate: true
      }
    });
    this.registerPrivateRoutes();
    this.registerRoutes();
  }

  registerPrivateRoutes() {
    this.app
      .route(`${this.route}/login`)
      .post(DoRequest, async (req, res) => {
        this.identityService.DoLogin(req.body.username, req.body.password).then((token) => {
          res.json({ token });
        }).catch((err) => {
          res.sendStatus(500);
          console.error(err);
        })
      });

    this.app
      .route(`${this.route}/password`)
      .put(DoPrivateRequest, async (req, res) => {
        // @ts-ignore
        const result = await this.identityService.ChangePassword(req.body.user, req.body.password, req.body.newPassword);
        if (result) res.sendStatus(200);
        else res.send(403);
      })
  }
}
