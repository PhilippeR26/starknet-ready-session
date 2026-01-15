"use client";

import { Box } from "@chakra-ui/react";
import { useStoreWallet } from "../ConnectWallet/walletContext";

type Props = { txText: string };
export function DisplayTxH({ txText }: Props) {
    const {
        isConnected
    } = useStoreWallet();

    return (
        <>
            <Box
                bgColor={"beige"}
                w={"370px"}
                textAlign={"left"}
                fontSize={"8px"}
                fontWeight={"bold"}
                color={"grey"}
                p={3}
                borderWidth={2}
                borderRadius={"xl"}
                borderColor={"tan"}
                whiteSpace="pre-line"
            >
                {txText}
            </Box>

        </>
    )
}