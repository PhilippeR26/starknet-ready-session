import { RpcProvider as RpcProviderV9 } from "starknetV9";
import { RpcProvider as RpcProviderV8 } from "starknet";

export const addrETH = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as const;
export const addrSTRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d" as const;
export const addrTEST = "0x07394cBe418Daa16e42B87Ba67372d4AB4a5dF0B05C6e554D158458Ce245BC10" as const;
export const addrLORDtestnet = "0x019c92fa87f4d5e3bE25C3DD6a284f30282a07e87cd782f5Fd387B82c8142017" as const;
export const addrLORDmainnet = "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49" as const;

export const addrTestContract = "0x6a109c64aefc6f0e337f8996baec2db09e209d12fd329843327a0f442e04d84" as const; // sepolia testnet

export const RejectContractAddress: string[] = [
    "0x541b0409e65bf546ff6c3090f4c07c53938b20c1f659250b84ce5eb66d4485e", // mainnet
    "0x00", // testnet deprecated
    "0x4d0f60ba43be97d44257a77e6123f11df89350396480af6ed0cbc81c8179592", // sepolia
];

// OpenZeppelin 0.8.1. Exists in Mainnet & Sepolia
export const accountClass = "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f" as const;

export const compatibleApiVersions: string[] = ["0.7"];

export const CounterContractAddress = "0x0ec8f6c6e19d39d0c809b5cc721329d6e1263989bbd4bdc56c9c9f987f853bb" as const;

const providersUrl = [
    "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_9/" + process.env.NEXT_PUBLIC_PROVIDER_URL,
    "xxx", // Goerli deprecated
    "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/" + process.env.NEXT_PUBLIC_PROVIDER_URL
];
export const myFrontendProvidersV8: RpcProviderV8[] = providersUrl.map((url) => new RpcProviderV8({ nodeUrl: url }));
export const myFrontendProvidersV9: RpcProviderV9[] = providersUrl.map((url) => new RpcProviderV9({ nodeUrl: url }));

export const FeeForSignatureValidation = 2n * 10n ** 5n;

export const ARGENT_SESSION_SERVICE_BASE_URL = "https://cloud.argent-api.com/v1"
