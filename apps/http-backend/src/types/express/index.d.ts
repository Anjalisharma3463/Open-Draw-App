import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}


// | Line                                    | What It Means                                                                            |
// | --------------------------------------- | ---------------------------------------------------------------------------------------- |
// | `import "express"`                      | This line tells TypeScript that we’re about to add stuff to Express's types.             |
// | `declare global { ... }`                | You’re saying: “Hey TypeScript, I want to change something **globally**.”                |
// | `namespace Express { ... }`             | You’re going **inside the Express package** to add stuff.                                |
// | `interface Request { userId?: string }` | You’re saying: “From now on, the request object **can have a userId**, and that’s okay.” |
