# volebni-kalkulacka-2022-generator

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

## Project Setup

### Instal dependencies

```sh
npm install
```

### Create Service Account

Since we are using Google Spreasheets and Google Forms you have to have [Service Account](https://console.cloud.google.com/apis/credentials/serviceaccountkey.) Store the provided file as `service_account.json` in this folder. Do not commit this file!

### Setup Environmental Variables

We are using two different libraries:

- https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication?id=service-account
- https://www.npmjs.com/package/googleapis#service-account-credentials

you have to fill in more environmental variables. It expects that the environmental variables - `GOOGLE_PRIVATE_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_APPLICATION_CREDENTIALS` are populated.

You can use following commands:

```sh
export GOOGLE_PRIVATE_KEY=$(jq .private_key service_account.json | sed -r 's/\\n/\\\n/g;s/\\//g;s/"//g');
export GOOGLE_SERVICE_ACCOUNT_EMAIL=$(jq .client_email service_account.json | sed -r 's/\\n/\\\n/g;s/\\//g;s/"//g');
export GOOGLE_APPLICATION_CREDENTIALS=$(realpath service_account.json);
```

### Run Script

```sh
npm run generate
```

#### Options

- `--cache-dir` (default: `.cache`) - folder where should be downloaded JSON representation of used Google Spreadsheets stored. This is useful for development.
- `--cache-lifetime` (default: `86400`, 1 day) - for how long should should we use the downloaded version.
- `--calculators-url` (default: `https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw/view#gid=0`) - URL of the calculators

Used values are produced at the beginning of the script execution.

## Workflow

1. Create form similar to the - https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw/edit?usp=sharing
2. Keep columns - `Questions form - candidates` and `Questions form - experts` empty.
3. Run the script for generating the data - `npm run generate -- --calculators-url "https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw/"`
4. It will give you forms' URLs for candidates and experts.
5. Update corresponding cells with those values.
6. Send forms to the candidates
7. Run the same script as in 3) to update the resul files.

### Commands

- do not use cached version, download google sheet again - `npm run generate -- --cache-lifetime 0 --calculators-url "https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw"`
- quickly experiment with the JSON generator
  - keep recompiling the code - `npm run dev:compile`
  - run the code generation - `npm run dev:generate`
- quickly experiment with Google Spreadsheet content
  - keep recompiling the code - `npm run dev:compile`
  - run the code generation - `npm run dev:generate -- --cache-lifetime 0`

## Spreadsheet Description

### Calculators Spreadsheet

Example: https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw/

## Other Useful Commands

### Development - compile

Compile with `--watch` to speed up development:

```sh
npm run dev:compile
```

### Development - run

Run the compiled version:

```sh
npm run dev:generate
```

### Development - run in a loop

Run the script every 15s:

```sh
npm run dev:generate-loop
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

Lint and fix:

```sh
npm run lint:fix
```

### Prettify other files

```sh
npx prettier --check .
```

Check and fix:

```sh
npx prettier --write .
```

## Used API/Libraries

- Google Auth Library - https://www.npmjs.com/package/google-auth-library
- Google APIs - https://www.npmjs.com/package/googleapis
  - We use Service Account - https://console.cloud.google.com/apis/credentials/serviceaccountkey
- Google Forms API - https://developers.google.com/forms/api/guides
  - `create` - https://developers.google.com/forms/api/reference/rest/v1/forms/create
  - `batchUpdate` - https://developers.google.com/forms/api/reference/rest/v1/forms/batchUpdate
