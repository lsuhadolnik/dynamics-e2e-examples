# Dynamics 365 UI E2E tests using Playwright

## Setup

- Clone
- `npm i`

- Create a new user with a Dynamics license.
- Setup the user's MFA to use External Authenticator's code - copy the TOTP token into your ENV
- Enter the userrname and password of the test user to your ENV.

You need .env like this:

```
DYNAMICS_URL=https://xxx.crm4.dynamics.com
TOTP_SECRET=
MS_USERNAME=
MS_PASSWORD=
```

Promise: Video coming soon :)
