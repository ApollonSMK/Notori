# NotoriStake Mini App

This is a decentralized staking application (Mini App) designed to run on World Chain and integrate seamlessly with the World App ecosystem via MiniKit-JS. Users can stake ERC-20 tokens, earn rewards, and manage their assets in a secure, mobile-first interface.

## Features

- **Mobile-First UX**: Designed with a clean, bottom-tab navigation for intuitive use on mobile devices.
- **World ID Integration**: Sybil resistance is enforced through World ID verification (`verify` command), ensuring only unique humans can stake for the first time.
- **Wallet Authentication**: Secure login using Sign-in with Ethereum (SIWE) via MiniKit's `walletAuth`.
- **On-Chain Staking**: All staking, unstaking, and reward-claiming operations are handled by the `Staking.sol` smart contract on World Chain.
- **Gasless-like Experience**: Utilizes MiniKit's `sendTransaction` which can leverage features like gas sponsorship on World App.
- **No Approvals Needed**: Leverages `permit2` signature patterns when required by MiniKit, avoiding generic ERC20 `approve` calls.
- **Optional Boosts**: Includes a "Boosts" page demonstrating the `pay` command for in-app purchases with WLD or USDC.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Solidity, Remix IDE for deployment
- **Integration**: `@worldcoin/minikit-js` for communication with World App.

## Getting Started

Follow these steps to set up and run the project locally for development and testing.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [pnpm](https://pnpm.io/installation) (or your preferred package manager like npm/yarn)
- [Git](https://git-scm.com/)
- A browser with a crypto wallet extension like [MetaMask](https://metamask.io/).

### 2. Setup

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd notori-stake-mini-app
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of your project by copying the example file:

```bash
cp .env.example .env.local
```

Now, fill in the variables in `.env.local`:

- **`NEXT_PUBLIC_WORLD_ID_APP_ID`**: Your App ID from the [Worldcoin Developer Portal](https://developer.worldcoin.org/).
- **`NEXT_PUBLIC_WORLD_ID_ACTION_ID`**: The Action ID for your "verify" action, created in the Developer Portal.
- **`DEV_PORTAL_API_KEY`**: Your API key from the Developer Portal, required for verifying proofs on the backend.


### 4. Run the Application

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`. To test with MiniKit, you'll need to use a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet and then open the ngrok URL inside the World App.

## Mini App Approval Checklist

Before submitting your app to the World App store, ensure you meet these guidelines:

- [ ] **Mobile-First Design**: The UI is responsive, avoids long scrolling, and uses bottom-tab navigation.
- [ ] **Square App Icon**: The app icon is square and does not have a white background.
- [ ] **Fast Load Times**: Initial load is under 3 seconds, and subsequent actions are under 1 second.
- [ ] **No Chance-Based Games**: The app does not rely on random chance for rewards.
- [ ] **Backend Verification**: All `verify` commands are validated on the backend.
- [ ] **Clear Usernames**: Display MiniKit usernames (`MiniKit.user.username`) instead of public wallet addresses.

## Project Structure

-   `/app`: Frontend Next.js application.
    -   `/api`: Backend API routes for SIWE, verification, etc.
-   `/components`: Reusable React components.
    -   `/ui`: Components from shadcn/ui.
-   `/hooks`: Custom React hooks.
-   `/lib`: Utility functions.
