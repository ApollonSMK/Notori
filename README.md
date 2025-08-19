
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
- **Blockchain**: Solidity, Hardhat, World Chain
- **Integration**: `@worldcoin/minikit-js` for communication with World App.

## Getting Started

Follow these steps to set up and run the project locally for development and testing.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [pnpm](https://pnpm.io/installation) (or your preferred package manager like npm/yarn)
- [Git](https://git-scm.com/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) or [Hardhat](https://hardhat.org/getting-started/) for Solidity development.

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
- **`NEXT_PUBLIC_WORLD_ID_ACTION_ID`**: The Action ID for your "stake" action, created in the Developer Portal.
- **`DEV_PORTAL_API_KEY`**: Your API key from the Developer Portal, required for verifying payments and transactions on the backend.
- **`WORLDCHAIN_RPC_URL`**: An RPC URL for World Chain (e.g., from Alchemy).
- **`CONTRACT_ADDRESS`**: The deployed address of your `Staking.sol` contract.
- **`TOKEN_ADDRESS`**: The address of the ERC-20 token used for staking (e.g., WLD).
- **`NEXT_PUBLIC_ALLOWED_RECIPIENTS`**: A comma-separated list of wallet addresses whitelisted for the `pay` command.

### 4. Deploy the Smart Contract

The `contracts/` directory contains the `Staking.sol` contract.

1.  **Configure Hardhat**: Update `hardhat.config.js` with your World Chain RPC URL and a deployer private key.
2.  **Deploy**:
    ```bash
    npx hardhat run scripts/deploy.js --network worldchain
    ```
3.  Update `CONTRACT_ADDRESS` and `TOKEN_ADDRESS` in your `.env.local` file with the deployed addresses.

### 5. Run the Application

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
- [ ] **Backend Verification**: All `verify` and `pay` commands are validated on the backend.
- [ ] **Clear Usernames**: Display MiniKit usernames (`MiniKit.user.username`) instead of public wallet addresses.
- [ ] **No Generic Approvals**: Smart contracts do not use `approve`. Use `permit2` patterns if token transfers are initiated from the contract.

## Project Structure

-   `/app`: Frontend Next.js application.
    -   `/api`: Backend API routes for SIWE, verification, etc.
    -   `/(tabs)`: Route group for pages with the bottom navigation.
-   `/components`: Reusable React components.
    -   `/ui`: Components from shadcn/ui.
-   `/contracts`: Solidity smart contracts.
    -   `/scripts`: Deployment scripts.
-   `/hooks`: Custom React hooks.
-   `/lib`: Utility functions.
```# Notori
