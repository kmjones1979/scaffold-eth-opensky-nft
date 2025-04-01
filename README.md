# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

-   ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
-   🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
-   🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
-   🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
-   🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

-   [Node (>= v20.18.3)](https://nodejs.org/en/download/)
-   Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
-   [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

-   Edit your smart contracts in `packages/hardhat/contracts`
-   Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
-   Edit your deployment scripts in `packages/hardhat/deploy`

## Flight Tracker NFT Implementation

This implementation adds a flight tracking system with NFT minting capabilities to Scaffold-ETH 2.

### Smart Contract

The NFT contract (`YourContract.sol`) handles flight data minting:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourContract is ERC721, Ownable {
    uint256 private _tokenId;

    constructor() ERC721("Flight NFT", "FLIGHT") Ownable(msg.sender) {}

    function mint(address to, uint256 altitude) public {
        _tokenId++;
        _safeMint(to, _tokenId);
    }

    function tokenId() public view returns (uint256) {
        return _tokenId;
    }
}
```

### API Routes

The application uses a Next.js API route (`/api/flight/route.ts`) to fetch real-time flight data from OpenSky Network:

```typescript
// Fetches real-time flight data with 1-minute caching
const response = await fetch("https://opensky-network.org/api/states/all", {
    next: { revalidate: 60 },
});

// Transforms flight data for frontend use
const flights = data.states.map((state: any[]) => ({
    callsign: state[1]?.trim() || "",
    icao24: state[0]?.trim() || "",
    origin_country: state[2] || "Unknown",
    longitude: state[5] || 0,
    latitude: state[6] || 0,
    altitude: state[7] || 0,
    on_ground: state[8] || false,
    velocity: state[9] || 0,
    true_track: state[10] || 0,
    vertical_rate: state[11] || 0,
}));
```

### React Hooks

The application uses scaffold-eth hooks for contract interaction:

```typescript
// Contract interaction
const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract(
    {
        contractName: "YourContract",
    }
);

// Wallet connection
const { address: connectedAddress } = useAccount();
```

#### Contract Interaction Hooks

The application leverages scaffold-eth's powerful contract interaction hooks:

1. **useScaffoldWriteContract**

    - Used for sending transactions to the smart contract
    - Provides type-safe contract function calls
    - Handles transaction state management
    - Example usage:

    ```typescript
    const { writeContractAsync } = useScaffoldWriteContract({
        contractName: "YourContract",
    });

    // Calling the mint function
    await writeContractAsync({
        functionName: "mint",
        args: [connectedAddress, BigInt(altitude)],
    });
    ```

2. **useScaffoldReadContract**
    - Used for reading data from the smart contract
    - Provides real-time updates of contract state
    - Handles loading and error states
    - Example usage:
    ```typescript
    const { data: tokenId } = useScaffoldReadContract({
        contractName: "YourContract",
        functionName: "tokenId",
    });
    ```

Key features of these hooks:

-   Automatic type inference from contract ABI
-   Built-in error handling and loading states
-   Transaction confirmation handling
-   Gas estimation
-   Network state management
-   Automatic contract address resolution

The hooks are built on top of wagmi and provide additional features:

-   Simplified contract interaction syntax
-   Type safety with TypeScript
-   Automatic contract address management
-   Integration with scaffold-eth's contract deployment system

### Data Flow

1. User enters a flight number
2. Frontend calls the API route
3. API fetches data from OpenSky Network
4. Frontend displays matching flights
5. User selects a flight
6. User can mint an NFT using the flight's altitude data
7. Smart contract mints the NFT with the altitude value

### Additional Dependencies

-   OpenSky Network API
-   TailwindCSS
-   Heroicons

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
