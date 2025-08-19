# **App Name**: NotoriStake Mini

## Core Features:

- Wallet Authentication: Authenticate users with walletAuth (SIWE) via MiniKit-JS and store minimal user data (address, username).  Always display username instead of address.
- Identity Verification: Verify user identity using Incognito Action via MiniKit's `verify` command before allowing staking.
- Token Staking: Enable users to stake and unstake ERC-20 tokens using `sendTransaction` with `permit2` placeholders for gasless transactions, managed with MiniKit-JS.
- Claim Rewards: Allow users to claim staking rewards accrued over time using the `claimRewards` function and MiniKit's `sendTransaction` feature.
- Dashboard Overview: Display staking balance, APR (fixed), accumulated rewards, and event history for users. Use MiniKit’s `useWaitForTransactionReceipt` to update information as transactions resolve.
- Purchase Options: Display a 'Buy XP/Boost' screen, implementing payments using the pay function with WLD/USDC, verifying transactions via the backend.
- Push Notifications: Request permission to send users functional notifications through MiniKit, managing the calls to `/api/v2/minikit/send-notification` within usage limits.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) evoking trust and sophistication relevant to financial applications.
- Background color: Very light purple (#F2EFF7), almost white, providing a clean, uncluttered backdrop for key information.
- Accent color: Blue (#49A1F1) to draw the user's eye to key actionable UI elements and guide them in using the interface.
- Body and headline font: 'Inter', a grotesque-style sans-serif font for a modern, machined, objective, neutral look that maintains excellent readability.
- Employ a mobile-first design using bottom navigation tabs for primary app sections, and anchor action buttons at the bottom of the screen to reduce scrolling.
- Utilize minimalist icons to represent different actions and sections of the app to facilitate quick recognition and navigation.
- Incorporate subtle transitions and loading animations to enhance the user experience without overwhelming the interface.