export interface GithubConfig {
  clientId: string | undefined;
  clientSecret: string | undefined;
  redirectUri: string | undefined;
  callbackUrl: string;
}

export const GITHUB_CONFIG: GithubConfig = {
  clientId:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri:  process.env.GITHUB_REDIRECT_URI,
  callbackUrl:
    process.env.GITHUB_CALLBACK_URL ||
    `${process.env.GITHUB_REDIRECT_URI}/callback`,
};
