"use client";

import { VStack, Text } from "@chakra-ui/react";
import ConnectWallet from "./ConnectWallet/ConnectWallet";
import SessionManager from "./SessionManagement";
import { useStoreWallet } from "./ConnectWallet/walletContext";

export function DisplayConnected() {
    const {
        isConnected
    } = useStoreWallet();


    return (
        <>
            <VStack>
                <Text
                    color={"steelblue"}
                    fontWeight={"bold"}
                >
                    Use only smart account
                </Text>
                <ConnectWallet></ConnectWallet>
            </VStack>
            {isConnected && (
                <SessionManager></SessionManager>
            )
            }
        </>
    )
}