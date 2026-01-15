"use client";

import { useStoreWallet } from './walletContext';
import { Center, Button } from "@chakra-ui/react";
import SelectWallet from './SelectWallet';

export default function ConnectWallet() {
    const {
        isConnected,
        setConnected,
        address: addressAccount,
        displaySelectWalletUI,
        setSelectWalletUI,
    } = useStoreWallet();




    return (
        <>
            {!isConnected ? (
                <>
                    <Button
                        variant="surface"
                        ml={4}
                        px={5}
                        fontWeight='bold'
                        onClick={() => {
                            console.log("a");
                            setSelectWalletUI(true)
                        }}
                    >
                        Connect Wallet
                    </Button>
                    {displaySelectWalletUI && <SelectWallet></SelectWallet>}
                </>
            ) : (
                <>
                    <Center>
                        <Button
                            variant="surface"
                            ml={4}
                            px={5}
                            fontWeight='bold'
                            onClick={() => {
                                setConnected(false);
                                setSelectWalletUI(false);
                            }}
                        >
                            {addressAccount
                                ? `Your wallet : ${addressAccount?.slice(0, 7)}...${addressAccount?.slice(-4)} is connected`
                                : "No Account"}
                        </Button>
                    </Center>

                </>
            )
            }
        </>
    )
}
