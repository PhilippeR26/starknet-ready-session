# Starknet-Ready-session

> [!IMPORTANT]
> Stars are appreciated!

## Presentation

This small project demonstrates how to create a DAPP that uses the sessions of Ready wallet.
It can be used only with Ready smart accounts.

Analyze the code to see how to create a such DAPP (start [here](src/app/page.tsx))  

The DAPP is made in the Next.js framework. Coded in Typescript. Using React, Zustand context & Chaka-ui components.

## Getting Started 🚀
Create a `.env.local` file, based on `.env.local.example`.

Run the development server:

```bash
pnpm install # or yarn install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.  

## How it works?
> [!IMPORTANT] 
> - The Ready sessions are available in both Starknet Sepolia Testnet and Mainnet, but the DAPP needs to be whitelisted by the Ready team. Contact them and provides the contracts addresses and the function names that will be used by your DAPP sessions.
> - Only smart-accounts can handle sessions. Do not use any standard Ready account. 

### Non gas sponsored session  

After an authorization in the Ready wallet, you can execute some transactions without any approbation in the wallet, simplifying the user experience.   

Ask to the user to accept the session parameters:
```ts
const sessionParams: CreateSessionParams = {
    allowedMethods: [{
        "Contract Address": CounterContractAddress,
        selector: "increase"
    },
    {
        "Contract Address": CounterContractAddress,
        selector: "decrease"
    }
    ],
    expiry: BigInt(endDate), // sec
    sessionKey: sessionKey,
    metaData: {
        projectID: "localhost",
        txFees: [{
            tokenAddress: addrSTRK,
            maxAmount: maxFee.toString()
        }]
    }
}
const chId = await myProvider.getChainId();
const sessionRequest = createSessionRequest({
    sessionParams,
    chainId: chId
});
const authorizationSignature = await myWalletAccount.signMessage(sessionRequest.sessionTypedData);
```

Create a special `Account` instance:
```ts
const session = await createSession({
    sessionRequest, 
    address: myWalletAccount.address, 
    chainId: chId, 
    authorisationSignature: authorizationSignature // Signature
})
const sessionAccount0: Account = await buildSessionAccount({
    useCacheAuthorisation: false, // defaulted to false, will be added in future developments
    session,
    sessionKey,
    provider: myProvider,
});
```

### Gas sponsored session

Same logical, but a backend account instance will execute the transactions (and pay the fees).

In the frontEnd, at initialization:
```ts
const sessionParams: CreateSessionParams = {
    allowedMethods: [{
        "Contract Address": CounterContractAddress,
        selector: "increase"
    },
    {
        "Contract Address": CounterContractAddress,
        selector: "decrease"
    }
    ],
    expiry: BigInt(endDate), // sec
    sessionKey: sessionKey,
    metaData: {
        projectID: "localhost",
        txFees: [{
            tokenAddress: addrSTRK,
            maxAmount: maxFee.toString()
        }]
    }
}
const chId = await myProvider.getChainId();
const sessionRequest = createSessionRequest({
    sessionParams,
    chainId: chId
});
const authorizationSignature = await myWalletAccount.signMessage(sessionRequest.sessionTypedData);
```
![](./Images/sponsored.png)

Still in the frontend, when you want to execute a transaction:
```ts
const increaseCall: Call = contract.populate("increase", []);
const sessionCall = await createOutsideExecutionCall({
    session, 
    sessionKey, 
    calls: [decreaseCall],
    argentSessionServiceUrl: ARGENT_SESSION_SERVICE_BASE_URL,
    network:
        currentFrontendProviderIndex === 2 ? "sepolia" : "mainnet",
});
```
Then execute the transaction in the server with this `Call`:
```ts
const txRes = await account0.execute(sessionCall);
```

> [!TIP]
> If necessary, increase the l2 amount, to have enough fees to validate this complex signature.

This account instance can be used as a normal account:
```ts
const decreaseCall: Call = contract.populate("decrease", []);
const res = await sessionAccount0.execute(decreaseCall);
```

## Deploy on Vercel 🎊

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

> You can test this DAPP ; it's already deployed at [https://starknet-session.vercel.app/](https://starknet-session.vercel.app/).
