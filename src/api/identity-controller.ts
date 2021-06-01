import { Application } from "express";
import ControllerBase from "./base/controller-base";
import { doRequest, doPrivateRequest } from "../business/helpers/request-helper";
import IdentityService from "../business/identity";
import IIdentity from "../types/identity-interface";

export default class UserController extends ControllerBase<IIdentity> {
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
      .post(doRequest, async (req, res) => {
        this.identityService.DoLogin(req.body.username, req.body.password).then((token) => {
          res.json({ token });
        }).catch(() => {
          res.sendStatus(401);
        })
      });

    this.app
      .route(`${this.route}/password`)
      .post(doPrivateRequest, async (req, res) => {
        // @ts-ignore
        const result = await this.identityService.ChangePassword(req.body.user.id, req.body.password, req.body.newPassword);
        if (result) res.sendStatus(200);
        else res.sendStatus(403);
      })
  }
}
