import { MeshyClient as InternalMeshyClient } from './services/MeshyClient';

/**
 * Handles Meshy Client management
 */
export class MeshyClient {
  /**
   * Initializes MeshyDB to establish a client
   * @param accountName MeshyDB account name
   * @param publicKey Client Public key for default tenant
   */
  public static initialize = (accountName: string, publicKey: string): IMeshyClient => {
    return new InternalMeshyClient(accountName, publicKey);
  };

  /**
   * Initializes MeshyDB to establish a client
   * @param accountName MeshyDB account name
   * @param tenant Name of tenant to connect
   * @param publicKey Client Public key for specified tenant
   */
  public static initializeWithTenant = (accountName: string, tenant: string, publicKey: string): IMeshyClient => {
    return new InternalMeshyClient(accountName, publicKey, tenant);
  };

  /**
   * Gets current authenticated Meshy connection
   */
  public static get currentConnection(): IMeshyConnection | null {
    return InternalMeshyClient.currentConnection;
  }
}

/**
 * Defines MeshyDB connection
 */
export interface IMeshyClient {
  /**
   * Gets established client connection for user
   * @param username Username to log in with
   * @param password Password of user to log in with
   */
  login(username: string, password: string): Promise<IMeshyConnection>;
  /**
   * Gets established client connection for previously logged in user
   * @param persistanceToken Long living token to request login at a later time
   */
  loginWithPersistance(persistanceToken: string): Promise<IMeshyConnection>;
  /**
   * Registers a user within the system
   * @param user User to create
   */
  registerUser(user: IRegisterUser): Promise<IUserVerificationHash>;
  /**
   * Generates request for password recovery
   * @param username User name to  recover password for
   */
  forgotPassword(username: string, attempt?: number): Promise<IUserVerificationHash>;
  /**
   * Reserts password for user  based on hash  data
   * @param resetPassword Reset password request to verify user and set new password
   */
  resetPassword(resetPassword: IResetPassword): Promise<void>;
  /**
   * Gets established client connection for anonymous
   * @param username Optional username to log in with
   */
  loginAnonymously(username?: string): Promise<IMeshyConnection>;
  /**
   * Check hash of request to ensure correctness
   * @param userVerificationCheck Verification data to check request
   */
  checkHash(userVerificationCheck: IUserVerificationCheck): Promise<boolean>;
  /**
   * Verify user to allow access to application
   * @param userVerificationCheck Verification data to check request
   */
  verifyUser(userVerificationCheck: IUserVerificationCheck): Promise<void>;
}

/**
 * Defines service to manage meshes
 */
export interface IMeshesService {
  /**
   * Gets mesh data
   * @param meshName Name of mesh collection
   * @param id Id of mesh data to retrieve
   */
  get<T extends IMeshData>(meshName: string, id: string): Promise<T>;
  /**
   * Gets mesh data
   * @param meshName Name of mesh collection
   * @param query Query data for searching mesh data
   */
  search<T extends IMeshData>(
    meshName: string,
    query?: {
      filter?: any;
      orderby?: any;
      pageNumber?: number;
      pageSize?: number;
    },
  ): Promise<IPageResult<T>>;
  /**
   * Creates mesh data
   * @param meshName Name of mesh collection
   * @param data Mesh data to save
   */
  create<T extends IMeshData>(meshName: string, data: T): Promise<T>;
  /**
   * Updates mesh data
   * @param meshName Name of mesh collection
   * @param data Mesh data to save
   * @param id Id of mesh data to update
   */
  update<T extends IMeshData>(meshName: string, data: T, id?: string): Promise<T>;
  /**
   * Delete mesh data
   * @param meshName Name of mesh collection
   * @param id Id of mesh data to update
   */
  delete(meshName: string, id: string): Promise<void>;
  /**
   * Delete mesh collection
   * @param meshName Name of mesh collection
   */
  deleteCollection(meshName: string): Promise<void>;
}

/**
 * Defines MeshyDB client for authenticated user
 */
export interface IMeshyConnection {
  /**
   * Service to manage logged in user
   */
  usersService: IUsersService;
  /**
   * Service to manage meshes
   */
  meshesService: IMeshesService;
  /**
   * Update password for logged in user
   * @param previousPassword Previous password for user
   * @param newPassword New password for user
   */
  updatePassword(previousPassword: string, newPassword: string): Promise<void>;
  /**
   * Sign out currently logged in user
   */
  signout(): Promise<void>;
  /**
   * Retrieve Persistance token to be used for a later login
   */
  retrievePersistanceToken(): string | null;
  /**
   * Gets user info claims
   */
  getMyUserInfo(): Promise<any>;
}

/**
 * Defines service to manage users
 */
export interface IUsersService {
  /**
   * Get logged in user
   */
  getSelf(): Promise<IUser>;
  /**
   * Update logged in user
   * @param user User data to be updated
   */
  updateSelf(user: IUser): Promise<IUser>;
  /**
   * Update security questions for user
   * @param questionUpdate Questions to be updated for user
   */
  updateSecurityQuestion(questionUpdate: ISecurityQuestionUpdate): Promise<void>;
}

/**
 * Defines Mesh Data
 */
export interface IMeshData {
  /**
   * System field representing the id of an item
   */
  _id?: string | undefined;

  /**
   * System field representing the reference id of an item
   */
  _rid?: string | undefined;
}

/**
 * Defines user
 */
export interface IUser {
  /**
   * Id representing a user
   */
  id: string | undefined;
  /**
   * Name representing a user
   */
  username: string;
  /**
   * Optional field for first name
   */
  firstName?: string | null | undefined;
  /**
   * Optional field for last name
   */
  lastName?: string | null | undefined;
  /**
   * Identifies if a user has been verified
   */
  verified: boolean;
  /**
   * Identifies if a user is considered active
   */
  isActive: boolean;
  /**
   * Optional field for phone number
   */
  phoneNumber?: string | null | undefined;
  /**
   * Optional field defining a users set of roles
   */
  roles: string[] | undefined;
  /**
   * Collection identifying security questions for user verification
   */
  securityQuestions?: ISecurityQuestionHash[];
  /**
   * Identifies if user is considered to be anonymous
   */
  anonymous: boolean;
  /**
   * Optional field for email address
   */
  emailAddress?: string | null | undefined;
}

/**
 * Defines a new user
 */
export interface IRegisterUser {
  /**
   * Name representing a user
   */
  username: string;
  /**
   * New password for user
   */
  newPassword: string;
  /**
   * Optional field for first name
   */
  firstName?: string | null | undefined;
  /**
   * Optional field for last name
   */
  lastName?: string | null | undefined;
  /**
   * Optional field for phone number
   */
  phoneNumber?: string | null;
  /**
   * Email address for user
   */
  emailAddress?: string | null | undefined;
  /**
   * Collection identifying security questions for user verification
   */
  securityQuestions?: ISecurityQuestion[];
}

/**
 * Defines Security Question with answer hash
 */
export interface ISecurityQuestionHash {
  /**
   * Question hint for user verification
   */
  question: string;
  /**
   * Answer hash to question for verification
   */
  answerHash: string;
}
/**
 * Defines Security Question with answer text
 */
export interface ISecurityQuestion {
  /**
   * Question hint for user verification
   */
  question: string;
  /**
   * Answer to question for verification
   */
  answer: string;
}
/**
 * Defines Security Questions to be updated for user
 */
export interface ISecurityQuestionUpdate {
  /**
   * Collection of questions and answers to be used for verification
   */
  securityQuestions: ISecurityQuestion[];
}
/**
 * Defines a user verification hash request
 */
export interface IUserVerificationHash {
  /**
   * Username requested password reset
   */
  username: string;
  /**
   * Identifies when the hash will expire
   */
  expires: Date;
  /**
   * System generated hash for password reset parity
   */
  hash: string;
  /**
   * Hint for request to help the user recognize the request
   */
  hint: string;
  /**
   * Attempt number for request hint.
   */
  attempt: number;
}

/**
 * Defines a page result for a search
 */
export interface IPageResult<T> {
  /**
   * Defines results of data
   */
  results: T[];
  /**
   * Defines which page of data
   */
  page: number;
  /**
   * Defines the size of the page returned
   */
  pageSize: number;
  /**
   * Defines how many records were returned
   */
  totalRecords: number;
}

/**
 * Defines a user verification check
 */
export interface IUserVerificationCheck extends IUserVerificationHash {
  /**
   * Verification code for hash parity
   */
  verificationCode: string;
}

/**
 * Defines a password reset for a user
 */
export interface IResetPassword extends IUserVerificationCheck {
  /**
   * New password for user to be set
   */
  newPassword: string;
}
