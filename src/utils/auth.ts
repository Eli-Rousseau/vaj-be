export type Tokens = {
    accessToken: string;
    refreshToken: string;
};

type ConnectOptions = {
    enableRegister: boolean
}

export abstract class Auth<C> {
    protected readonly credentials: C;
    protected tokens: Tokens | null = null;
    protected readonly applicationUrl: string;

    constructor(credentials: C) {
        this.credentials = credentials;

        const applicationUrl = process.env.APPLICATION_URL;

        if (!applicationUrl) {
            throw new Error(
                "Missing required environment variable: APPLICATION_URL"
            );
        }

        this.applicationUrl = applicationUrl;
    }

    abstract register(): Promise<Tokens | null>;
    abstract login(): Promise<Tokens | null>;
    abstract refresh(): Promise<Tokens | null>;
    abstract accessTokenIsValid(): Promise<boolean>;
 
    async connect(options?: ConnectOptions): Promise<Tokens | null> {
        let tokens: Tokens | null = null;

        const accessToken = this.tokens?.accessToken;

        if (!accessToken) {

            tokens = await this.login();
            if (!tokens && options?.enableRegister) tokens = await this.register();

        } else {

            if (await this.accessTokenIsValid()) tokens = this.tokens;
            else tokens = await this.refresh();
        }

        return tokens;
    };
}