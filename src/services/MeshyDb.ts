import { v4 as guid } from 'uuid';
import { MeshyDBClient, RequestService, TokenService, UserService } from '.';
import { IMeshyDB, IMeshyDBClient, INewUser, IPasswordResetHash } from '..';
import { Constants, ForgotPassword } from '../models';

export class MeshyDB implements IMeshyDB {
  private constants: Constants;
  private userService: UserService;
  private tokenService: TokenService;
  private requestService: RequestService;
  constructor(clientKey: string, publicKey: string, tenant?: string) {
    if (!clientKey) {
      throw new TypeError('Empty parameter: clientkey.');
    }

    if (!publicKey) {
      throw new TypeError('Empty parameter: publickey.');
    }

    this.constants = new Constants(clientKey, publicKey, tenant);
    this.tokenService = new TokenService(this.constants);
    this.requestService = new RequestService(this.constants, this.tokenService);
    this.userService = new UserService(this.requestService);
  }

  public login = (username: string, password: string) => {
    if (!username) {
      throw new TypeError('Missing required parameter: username');
    }

    if (!password) {
      throw new TypeError('Missing required parameter: password');
    }

    return new Promise<IMeshyDBClient>((resolve, reject) => {
      this.tokenService
        .generateAccessToken(username, password)
        .then(authId => {
          resolve(new MeshyDBClient(authId, this.constants, this.tokenService));
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  public loginWithPersistance = (persistanceToken: string) => {
    if (!persistanceToken) {
      throw new TypeError('Missing required parameter: persistanceToken');
    }

    return new Promise<IMeshyDBClient>((resolve, reject) => {
      this.tokenService
        .generateAccessTokenWithRefreshToken(persistanceToken)
        .then(authId => {
          resolve(new MeshyDBClient(authId, this.constants, this.tokenService));
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  public createUser = (newUser: INewUser) => {
    if (!newUser.username) {
      throw new TypeError('Missing required field: username');
    }

    if (!newUser.newPassword) {
      throw new TypeError('Missing required field: newPassword');
    }

    return this.userService.createUser(newUser);
  };

  public forgotPassword = (username: string) => {
    if (!username) {
      throw new TypeError('Missing required parameter: username');
    }

    const forgotPassword = new ForgotPassword();
    forgotPassword.username = username;

    return this.userService.forgotPassword(forgotPassword);
  };

  public resetPassword = (passwordResetHash: IPasswordResetHash, newPassword: string) => {
    if (!newPassword) {
      throw new TypeError('Missing required parameter: newPassword');
    }

    return this.userService.resetPassword(passwordResetHash, newPassword);
  };

  public loginAnonymously = (username?: string) => {
    const anonUser: INewUser = {
      firstName: null,
      id: '',
      isActive: true,
      lastName: null,
      newPassword: 'nopassword',
      phoneNumber: null,
      roles: [],
      username: username || guid(),
      verified: true,
    };

    return new Promise<IMeshyDBClient>((resolve, reject) => {
      this.userService
        .createUser(anonUser)
        .then(user => {
          if (user.username) {
            this.tokenService
              .generateAccessToken(user.username, 'nopassword')
              .then(authId => {
                resolve(new MeshyDBClient(authId, this.constants, this.tokenService));
              })
              .catch(err => {
                reject(err);
              });
          } else {
            reject('Missing required field: username');
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };
}
