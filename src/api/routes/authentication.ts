import crypto from "crypto";
import { Router } from "express";
import { graphql } from "../../utils/graphql";
import { isValidEmail } from "../../utils/validators";
import { ShopUser } from "../../database/classes/transformer-classes";

async function findUsersByEmail(email: string): Promise<ShopUser[]> {
    const users = await graphql.execute({
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

    return users.map((user: unknown) => ShopUser.fromPlain(user));
}

async function isEmailAlreadyAssigned(email: string) {
    const users = await findUsersByEmail(email);
    return users.length > 0;
}

async function createUser(input: ShopUser) {
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

function generateJWTToken(payload: any, secret: string, expirationInSeconds: number): string {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = Buffer
        .from(JSON.stringify(header))
        .toString("base64url");

    const now = Math.floor(Date.now() / 1000);
    payload["iat"] = now;
    payload["exp"] = now + expirationInSeconds;

    const encodedPayload = Buffer
        .from(JSON.stringify(payload))
        .toString("base64url");

    const signature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    return token;
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

    let user: ShopUser;
    try {
        user = ShopUser.fromPlain(req.body?.user);
    } catch (error) {
        res.status(400).json({ 
            error: "Invalid request.", 
            errorMessage: `Invalid user:\n${error}`
        }).end();
        return;
    }

    if (!user.email || !isValidEmail(user.email)) {
        res.status(400).json({ 
            error: "Invalid request.", 
            errorMessage: `Invalid user email: ${user.email}`
        }).end();
        return;
    }

    if (await isEmailAlreadyAssigned(user.email)) {
        res.status(400).json({ 
            error: "Invalid request.", 
            errorMessage: "The email is already in use." 
        }).end();
        return;
    }

    try {
        user = await createUser(user);
    } catch  (error) {
        res.status(500).json({ 
            error: "Failed query.", 
            errorMessage: `Failed to create user:\n${error}`
        }).end();
        return;
    }

    const payload = {
        reference: user.reference,
        sequentialId: user.sequentialId,
        email: user.email,
        systemRole: user.systemRole,
        systemAuthentication: user.systemAuthentication,
    };
    const accessToken = generateJWTToken(payload, secret, 30 * 60);

    res.status(201).json({
        accessToken,
        expiresIn: 3600
    }).end();
});

export default router;