import passport from 'passport';
import { sign } from 'jsonwebtoken';
import express, { Express, Request, Response, NextFunction } from 'express';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import type { Profile } from 'passport';
import { prisma } from '../../src/server/prisma';
import { assignAnswerToUser } from '../../src/server/answers';
import ms from 'ms';
import { respond404 } from '../../src/server/errors';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

const app: Express = express();

const PUBLIC_URL = process.env.PUBLIC_URL
  ? process.env.PUBLIC_URL
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || PUBLIC_URL;

if (!PUBLIC_URL) {
  throw new Error('PUBLIC_URL is not defined');
}

if (!process.env['SESSION_SECRET']) {
  throw new Error('SESSION_SECRET is not defined');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  prisma.user.findUnique({ where: { id: id as string } }).then((user) => {
    done(null, user);
  });
});

const providers = {
  facebook: {
    strategy: () => {
      return new FacebookStrategy(
        {
          clientID: process.env['OAUTH_FACEBOOK_CLIENT_ID'] as string,
          clientSecret: process.env['OAUTH_FACEBOOK_CLIENT_SECRET'] as string,
          profileFields: ['id', 'displayName', 'email'],
          callbackURL: `${OAUTH_CALLBACK_URL}/api/auth/facebook/callback`,
        },
        getStrategyCallback('facebook')
      );
    },
    enabled: !!(
      process.env['OAUTH_FACEBOOK_CLIENT_ID'] &&
      process.env['OAUTH_FACEBOOK_CLIENT_SECRET']
    ),
    scope: ['email', 'public_profile'],
  },
  google: {
    strategy: () => {
      return new GoogleStrategy(
        {
          clientID: process.env['OAUTH_GOOGLE_CLIENT_ID'] as string,
          clientSecret: process.env['OAUTH_GOOGLE_CLIENT_SECRET'] as string,
          callbackURL: `${OAUTH_CALLBACK_URL}/api/auth/google/callback`,
          scope: ['profile', 'email'],
        },
        getStrategyCallback('google')
      );
    },
    enabled: !!(
      process.env['OAUTH_GOOGLE_CLIENT_ID'] &&
      process.env['OAUTH_GOOGLE_CLIENT_SECRET']
    ),
    scope: ['profile', 'email'],
  },
  twitter: {
    strategy: () => {
      return new TwitterStrategy(
        {
          consumerKey: process.env['TWITTER_CONSUMER_KEY'] as string,
          consumerSecret: process.env['TWITTER_CONSUMER_SECRET'] as string,
          callbackURL: `${OAUTH_CALLBACK_URL}/api/auth/twitter/callback`,
          userProfileURL:
            'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
        },
        getStrategyCallback('twitter')
      );
    },
    enabled: !!(
      process.env['TWITTER_CONSUMER_KEY'] &&
      process.env['TWITTER_CLIENT_SECRET']
    ),
    scope: ['offline_access', 'profile'],
  },
};

const getStrategyCallback = (strategy: string) => {
  return async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: (error: any, user?: any, info?: any) => void
  ) => {
    const email = profile.emails && profile.emails[0].value;
    if (!email) {
      // This is for facebook user, which doesn't have email
      try {
        const user = await prisma.user.upsert({
          where: {
            authProviderId: profile.id,
          },
          update: {
            authProvider: strategy,
            authProviderId: profile.id,
            displayName: profile.displayName,
          },
          create: {
            email: null,
            displayName: profile.displayName,
            authProvider: strategy,
            authProviderId: profile.id,
          },
        });
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
    try {
      const user = await prisma.user.upsert({
        where: {
          email: email,
        },
        update: {
          authProvider: strategy,
          authProviderId: profile.id,
          displayName: profile.displayName,
        },
        create: {
          email: email,
          displayName: profile.displayName,
          authProvider: strategy,
          authProviderId: profile.id,
        },
      });
      return cb(null, user);
    } catch (err) {
      try {
        // Existing user currently stored without email now returning with email
        // Edge case - handled here
        const user = await prisma.user.update({
          where: {
            authProviderId: profile.id,
          },
          data: {
            email: email,
            displayName: profile.displayName,
            authProvider: strategy,
            authProviderId: profile.id,
          },
        });
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  };
};

const redirectAfterCallback = (returnTo: string, res: Response) => {
  if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
    return res.redirect(returnTo);
  }
  return res.redirect('/');
};

const callback = (provider: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(provider, { session: true }, (err, user, info) => {
      if (err || !user) {
        return res.redirect('/' + '?error=' + err?.message);
      }
      req.login(user, { session: true }, async (err) => {
        if (err) {
          console.error(err);
          return res.status(400).send({ err: err?.message || err });
        }
        try {
          const payload = {
            iss: PUBLIC_URL,
            sub: user.id,
            email: user.email || undefined,
          };
          const token = sign(
            payload,
            Buffer.from(process.env.JWT_SECRET as string, 'base64'),
            {
              expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            }
          );
          const cookiePayload = { token };
          const expiresInDate = new Date(
            Date.now() + ms(process.env.JWT_EXPIRES_IN || '7d')
          );
          res.cookie('auth', JSON.stringify(cookiePayload), {
            domain: process.env.DOMAIN_NAME,
            path: '/api',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict',
            expires: expiresInDate,
          });
        } catch (err) {
          console.error(err);
          return res.status(400).send({ err: err?.message || err });
        }

        const { state } = req.query;
        if (state) {
          const { returnTo, updateToken, answerId } = JSON.parse(
            Buffer.from(state as string, 'base64').toString()
          );
          if (updateToken && answerId) {
            await assignAnswerToUser({
              answerId,
              updateToken,
              userId: user.id,
            });
          }
          return redirectAfterCallback(returnTo, res);
        }
        redirectAfterCallback('/', res);
      });
    })(req, res, next);
  };
};

const authenticate = (options: { provider: string; scope: string[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { provider, scope } = options;
    const { returnTo, updateToken, answerId } = req.query;
    const state =
      returnTo || (updateToken && answerId)
        ? Buffer.from(
            JSON.stringify({ returnTo, updateToken, answerId })
          ).toString('base64')
        : undefined;
    const authenticator = passport.authenticate(provider, {
      state,
      scope,
    });
    return authenticator(req, res, next);
  };
};

app.set('trust proxy', 1);
app.use(
  session({
    secret: process.env['SESSION_SECRET'] as string,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    saveUninitialized: true,
    resave: true,
    cookie: { secure: process.env.VERCEL_ENV === 'production' },
  })
);

for (const provider in providers) {
  if (providers[provider].enabled) {
    // Initialize routes for each provider
    passport.use(providers[provider].strategy());
    const scope = providers[provider].scope;
    app.get(`/api/auth/${provider}`, authenticate({ provider, scope }));
    app.get(`/api/auth/${provider}/callback`, callback(provider));
  }
}

app.get('/api/auth/logout', (req, res) => {
  let redirect = req.query.returnTo;
  if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
    redirect = '/';
  } else {
    redirect = decodeURIComponent(redirect);
  }
  res.clearCookie('auth', {
    domain: process.env.DOMAIN_NAME,
    path: '/api',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
  res.redirect(decodeURIComponent(redirect));
});

app.get('/*', (req, res) => {
  respond404(res, req.url);
});

export default app;
