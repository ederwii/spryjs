export default {
  claims: [String],
  username: { type: String, immutable: true },
  password: String,
  isLocked: Boolean,
  failedAttempts: Number,
  lastSignIn: Date,
  name: String,
  lastName: String,
  meta: {
    age: Number,
    checked: Boolean
  }
}