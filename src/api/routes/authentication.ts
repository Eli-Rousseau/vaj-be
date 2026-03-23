import crypto from "crypto";
import { Router } from "express";
import { graphql } from "../../utils/graphql";
import { isValidEmail } from "../../utils/validators";
import { ShopUser } from "../../database/classes/transformer-classes";

type UserInput = {
    email: string;
    password: string;
    systemRole: string;
    systemAuthentication: string;
}

async function findUsersByEmail(email: string) {
    const users = graphql.execute({
        query: `
query findUsersByEmail($email: JSON) {
  result: getShopUsers(
    where:  {
       email:  {
          eq: $email
       }
    }
  ) {
    reference
  }
}
        `,
        variables: {
            email
        }
    });

    return users;
}

async function isEmailAlreadyAssigned(email: string) {
    const users = await findUsersByEmail(email);
    return users.length > 0;
}

async function createUser(input: UserInput) {
    const user = (await graphql.execute({
        query: `
mutation createUser($user: ShopUserMutationType!){
  result: insertShopUser(
    data: $user
  ) {
    reference
    sequentialId
    name
    email
    password
    systemRole
    systemAuthentication
  }
}        
        `,
        variables: {
            user: input
        }
    }))[0];

    return ShopUser.fromPlain(user);
}

const router = Router();

router.post("/internal/register", async (req, res) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({ 
            error: "Missing configuration", 
            errorMessage: "Missing required environmental variable: JWT_SECRET." 
        }).end();
        return;
    }

    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
        res.status(400).json({ 
            error: "Invalid request.", 
            errorMessage: "Provide email is invalid." 
        }).end();
        return;
    }

    if (!password || typeof password !== "string" || password.length >= 1) {
        res.status(400).json({ 
            error: "Invalid request.", 
            errorMessage: "Provide password is invalid." 
        }).end();
        return;
    }

    if (await isEmailAlreadyAssigned(email)) {
        res.status(400).json({ 
            error: "Invalid request.", 
            errorMessage: "The email is already in use." 
        }).end();
        return;
    }

    const user = await createUser({
        email,
        password,
        systemRole: "USER",
        systemAuthentication: "INTERNAL"
    });

    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = Buffer
        .from(JSON.stringify(header))
        .toString("base64url");

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        reference: user.reference,
        sequentialId: user.sequentialId,
        email: user.email,
        systemRole: user.systemRole,
        systemAuthentication: user.systemAuthentication,
        iat: now,
        exp: now + (60 * 20) // 20 minutes
    };

    const encodedPayload = Buffer
        .from(JSON.stringify(payload))
        .toString("base64url");

    const signature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    res.status(201).json({
        token,
        expiresIn: 3600
    }).end();
});

export default router;