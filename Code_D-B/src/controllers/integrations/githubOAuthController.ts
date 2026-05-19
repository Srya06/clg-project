import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User, Integration } from '../../models';

export const githubConnect = async (req: Request, res: Response) => {
  // Use query param OR authenticated user ID
  const userId = (req.query.userId as string) || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to connect GitHub',
    });
  }

  const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '10m',
  });

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
    `&scope=read:user repo` +
    `&state=${state}`;

  return res.redirect(url);
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    // Guard: missing OAuth params
    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message:
          'Missing OAuth params (code or state). Please initiate the GitHub connect flow from the app.',
      });
    }

    const decoded = jwt.verify(
      state as string,
      process.env.JWT_SECRET as string
    ) as any;
    const userId = decoded.userId;

    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const githubToken = tokenRes.data.access_token;

    if (!githubToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid code or token exchange failed' });
    }

    const profileRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/json',
      },
    });

    const reposRes = await axios.get(
      'https://api.github.com/user/repos?per_page=100',
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/json',
        },
      }
    );

    const profile = profileRes.data;
    const repos = reposRes.data;

    const githubData = {
      githubConnected: true,
      githubUsername: profile.login,
      githubProfileUrl: profile.html_url,
      githubAvatar: profile.avatar_url,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      repoCount: repos.length,
      lastGithubSync: new Date(),
    };

    await User.findByIdAndUpdate(userId, {
      ...githubData,
    });

    await Integration.findOneAndUpdate(
      { studentId: userId },
      { githubToken, githubSyncedAt: new Date(), lastSyncedAt: new Date() },
      { new: true, upsert: true }
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/student/profile?github=success`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('GitHub OAuth Error:', msg);
    return res.status(500).json({
      success: false,
      message: 'OAuth failed',
    });
  }
};
