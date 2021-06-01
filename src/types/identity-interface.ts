export default interface IIdentity {
  _id: string;
  username: string;
  password: string;
  failedAttempts: number;
  isLocked: boolean;
  claims: string[];
  lastSignIn: Date;
}