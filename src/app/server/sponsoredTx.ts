"use server";

import { FeeForSignatureValidation, myFrontendProvidersV9 } from "@/utils/constants";
import { Account, type Call, type EstimateFeeResponseOverhead, type ResourceBoundsBN } from "starknetV9";

const currentFrontendProviderIndex = 2; // Testnet
const myProvider = myFrontendProvidersV9[currentFrontendProviderIndex];

export async function sessionActionSponsoredTx(call: Call): Promise<{ transaction_hash: string }> {
    console.log("call:",call);
    const account0 = new Account({
        provider: myProvider,
        address: process.env.NEXT_PUBLIC_SPONSOR_ACCOUNT_ADDRESS ?? "",
        signer: process.env.SPONSOR_ACCOUNT_PRIVATE ?? "",
    });
    const estimationFees: EstimateFeeResponseOverhead = await account0.estimateInvokeFee(call);
    console.log("estimationFees =", estimationFees);
    const resourceBounds: ResourceBoundsBN = {
        ...estimationFees.resourceBounds,
        l2_gas: {
            max_price_per_unit: estimationFees.resourceBounds.l2_gas.max_price_per_unit,
            max_amount: estimationFees.resourceBounds.l2_gas.max_amount + FeeForSignatureValidation
        }
    };
    const txRes = await account0.execute(call, { resourceBounds });
    console.log({ txRes });
    return txRes
}