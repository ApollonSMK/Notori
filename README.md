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
- **`NEXT_PUBLIC_WORLD_ID_ACTION_ID`**: The Action ID for your "stake" action, created in the Developer Portal.
- **`DEV_PORTAL_API_KEY`**: Your API key from the Developer Portal, required for verifying payments and transactions on the backend.
- **`CONTRACT_ADDRESS`**: The deployed address of your `Staking.sol` contract (you will get this in the next step).
- **`TOKEN_ADDRESS`**: The address of the ERC-20 token used for staking (e.g., WLD).
- **`NEXT_PUBLIC_ALLOWED_RECIPIENTS`**: A comma-separated list of wallet addresses whitelisted for the `pay` command.

### 4. Deploy the Smart Contract with Remix

You will use the [Remix IDE](https://remix.ethereum.org/) to deploy your contract to the World Chain.

1.  **Open Remix**: Navigate to [remix.ethereum.org](https://remix.ethereum.org/) in your browser.
2.  **Load the Contract**:
    *   In the "File Explorers" tab, create a new file named `Staking.sol`.
    *   Copy the entire content of `contracts/Staking.sol` from this project and paste it into the new file in Remix.
3.  **Compile the Contract**:
    *   Go to the "Solidity Compiler" tab (the third icon on the left).
    *   Set the "Compiler" version to `0.8.20` to match the contract's pragma.
    *   Click the "Compile Staking.sol" button. A green checkmark will appear if successful.
4.  **Deploy to World Chain**:
    *   Go to the "Deploy & Run Transactions" tab (the fourth icon on the left).
    *   In the "ENVIRONMENT" dropdown, select **"Injected Provider - MetaMask"**. Your wallet will prompt you to connect; approve it.
    *   Make sure your wallet is connected to the **World Chain** network (or World Chain Sepolia for testing).
    *   In the "CONTRACT" dropdown, make sure "Staking - Staking.sol" is selected.
    *   In the "Deploy" section, you need to provide the constructor arguments: `_stakingToken` (the address of the token to be staked, e.g., WLD) and `_rewardsToken` (the address of the rewards token).
    *   Click the orange "Deploy" button.
    *   Your wallet will pop up to ask for confirmation. Confirm the transaction.
5.  **Get the Contract Address**:
    *   After the transaction is confirmed, the address of your newly deployed contract will appear under "Deployed Contracts" in Remix.
    *   Copy this address and paste it into the `CONTRACT_ADDRESS` variable in your `.env.local` file.

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
-   `/components`: Reusable React components.
    -   `/ui`: Components from shadcn/ui.
-   `/contracts`: Solidity smart contracts.
-   `/hooks`: Custom React hooks.
-   `/lib`: Utility functions.