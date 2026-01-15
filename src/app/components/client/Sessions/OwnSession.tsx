"use client";
import { counterAbi } from "@/app/contracts/abis/counter-abi";
import styles from '@/app/page.module.css'
import { addrSTRK, CounterContractAddress, FeeForSignatureValidation, myFrontendProvidersV8, myFrontendProvidersV9 } from "@/utils/constants";
import { formatBalance, minutesToTimeWithSeconds } from "@/utils/utils";
import { Box, Center, Text, VStack, Button } from "@chakra-ui/react";
import { SquareMinus, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Contract, ec, num, stark, type Call, type EstimateFeeResponseOverhead, type SuccessfulTransactionReceiptResponse, type ResourceBoundsBN } from "starknetV9";
import { Account, } from "starknet";
import { useStoreWallet } from "../ConnectWallet/walletContext";
import { useFrontendProvider } from "../provider/providerContext";
import { DisplayTxH } from "./DisplayTxH";
import { buildSessionAccount, createSession, createSessionRequest, type CreateSessionParams, type SessionKey } from "@argent/x-sessions";


const maxFee: bigint = (2n * 10n ** 17n); // session fees in fri
const durationInMinutes: number = 5; // session duration in minutes

export default function OwnSession() {
    const { myWalletAccount } = useStoreWallet();
    const { currentFrontendProviderIndex } = useFrontendProvider();
    const myProviderV8 = myFrontendProvidersV8[currentFrontendProviderIndex];
    const myProviderV9 = myFrontendProvidersV9[currentFrontendProviderIndex];

    const [sessionKey, setSessionKey] = useState<SessionKey | undefined>(undefined);
    const [isSessionSigned, setIsSessionSigned] = useState<boolean>(false);
    const [sessionAccount, setSessionAccount] = useState<Account | undefined>(undefined);
    const [dateEndSession, setDateEndSession] = useState<number | undefined>(undefined);
    const [counter, setCounter] = useState<bigint>(0n);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [remainingFee, setRemainingFee] = useState<bigint>(maxFee);
    const [isNewTxAuthorized, setIsNewTxAuthorized] = useState<boolean>(true);
    const [txText, setTxText] = useState<string>("");

    const contract = new Contract({ abi: counterAbi, address: CounterContractAddress ,providerOrAccount:myProviderV9});


    async function increase() {
        if (contract !== undefined) {
            setIsNewTxAuthorized(false);
            const increaseCall: Call = contract?.populate("increase", []);
            try {
                console.log("try to increase...")
                if (sessionAccount) {
                    console.log("Increase...")
                    const estimationFees: EstimateFeeResponseOverhead = await sessionAccount.estimateInvokeFee(increaseCall);
                    console.log("estimationFees =", estimationFees);
                    const resourceBounds: ResourceBoundsBN = {
                        ...estimationFees.resourceBounds,
                        l2_gas: {
                            max_price_per_unit: estimationFees.resourceBounds.l2_gas.max_price_per_unit,
                            max_amount: estimationFees.resourceBounds.l2_gas.max_amount + FeeForSignatureValidation
                        }
                    };
                    const res = await sessionAccount.execute(increaseCall, { resourceBounds });
                    console.log("increase", { res });
                    setTxText("Inc " + counter + " " + num.toHex64(res.transaction_hash) + "\n" + txText);
                    const txR = await myProviderV8.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
                    setIsNewTxAuthorized(true);
                    if (txR.isSuccess()) {
                        setRemainingFee(remainingFee - BigInt((txR.value as SuccessfulTransactionReceiptResponse).actual_fee.amount));
                    }
                }
            } catch (err: any) {
                console.error((err as any).cause, err.message)
                setIsNewTxAuthorized(true);
                if (err.message.includes("INVALID_FEE")) {
                    setTxText("Inc " + counter + " INVALID FEE" + "\n" + txText);
                }
                if (err.message.includes("INVALID_TIMESTAMP")) {
                    setTxText("Inc " + counter + " INVALID TIMESTAMP" + "\n" + txText);
                }
                if (err.message.includes("Sign session error")) {
                    if (err.cause.includes("sessionExpired"))
                        setTxText("Inc " + counter + " sessionExpired" + "\n" + txText);
                    if (err.cause.includes("gasExceedsLimit"))
                        setTxText("Inc " + counter + " gasExceedsLimit" + "\n" + txText);
                }
                throw new Error(err);
            }
        }
    }

    async function decrease() {
        if (contract !== undefined) {
            setIsNewTxAuthorized(false);
            const decreaseCall: Call = contract.populate("decrease", []);
            console.log("decrease call=", decreaseCall);
            try {
                console.log("try to decrease...")
                if (sessionAccount) {
                    console.log("Decrease...")
                    const estimationFees = await sessionAccount.estimateInvokeFee(decreaseCall);
                    console.log("estimationFees", estimationFees);
                    const resourceBounds: ResourceBoundsBN = {
                        ...estimationFees.resourceBounds,
                        l2_gas: {
                            max_price_per_unit: estimationFees.resourceBounds.l2_gas.max_price_per_unit,
                            max_amount: estimationFees.resourceBounds.l2_gas.max_amount + FeeForSignatureValidation
                        }
                    };
                    const res = await sessionAccount.execute(decreaseCall, { resourceBounds });
                    console.log("decrease", { res });
                    setTxText("Dec " + counter + " " + num.toHex64(res.transaction_hash) + "\n" + txText);
                    const txR = await myProviderV8.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
                    setIsNewTxAuthorized(true);
                    if (txR.isSuccess()) {
                        setRemainingFee(remainingFee - BigInt((txR.value as SuccessfulTransactionReceiptResponse).actual_fee.amount));
                    }
                }
            } catch (err: any) {
                setIsNewTxAuthorized(true);
                if (err.message.includes("INVALID_FEE")) {
                    setTxText("Dec " + counter + " INVALID FEE" + "\n" + txText);
                }
                if (err.message.includes("INVALID_TIMESTAMP")) {
                    setTxText("Dec " + counter + " INVALID TIMESTAMP" + "\n" + txText);
                }
                if (err.message.includes("gasExceedsLimit")) {
                    setTxText("Dec " + counter + " INVALID FEE" + "\n" + txText);
                }
                if (err.message.includes("Sign session error")) {
                    if (err.cause.includes("sessionExpired"))
                        setTxText("Dec " + counter + " sessionExpired" + "\n" + txText);
                    if (err.cause.includes("gasExceedsLimit"))
                        setTxText("Dec " + counter + " gasExceedsLimit" + "\n" + txText);
                }
                throw new Error(err);
            }
        }
    }

    // creation of session key
    useEffect(() => {
        const privateKey = stark.randomAddress();
        const sessionKey: SessionKey = {
            privateKey, //string
            publicKey: ec.starkCurve.getStarkKey(privateKey), //string
        };
        console.log("Session key =", sessionKey);
        setSessionKey(sessionKey);

        return () => { }
    },
        []
    );

    // initialization of session
    useEffect(() => {
        async function sessionReq() {
            if ((myWalletAccount !== undefined) && (sessionKey !== undefined)) {
                const resp = await myProviderV8.getBlock();
                console.log("Starknet time =", resp.timestamp);
                const beforeDate: Date = new Date(Date.now() + durationInMinutes * 60 * 1000);
                console.log("Before:", beforeDate); // ms
                const endDate: number = Math.floor(beforeDate.getTime() / 1000);
                console.log("endDate:", endDate); // sec
                setDateEndSession(endDate);
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
                    expiry: BigInt(endDate),
                    sessionKey: sessionKey,
                    metaData: {
                        projectID: "localhost",
                        txFees: [{
                            tokenAddress: addrSTRK,
                            maxAmount: maxFee.toString()
                        }]
                    }
                }
                console.log({ sessionParams });
                const chId = await myProviderV8.getChainId();
                console.log({ chId });
                const sessionRequest = createSessionRequest({
                    sessionParams,
                    chainId: chId
                });
                console.log("sessionRequest:", sessionRequest);
                const authorizationSignature = await myWalletAccount.signMessage(sessionRequest.sessionTypedData);
                console.log("signature", authorizationSignature);
                const session = await createSession({
                    sessionRequest, // SessionRequest
                    address: myWalletAccount.address, // Account address
                    chainId: chId, // StarknetChainId
                    authorisationSignature: authorizationSignature // Signature
                })
                const sessionAccount0: Account = await buildSessionAccount({
                    useCacheAuthorisation: false, // optional and defaulted to false, will be added in future developments
                    session,
                    sessionKey,
                    provider: myProviderV8,

                });
                const txV = sessionAccount0.transactionVersion;
                console.log("tx version =", txV);
                setSessionAccount(sessionAccount0);

                console.log("sessionAccount Created");
                setIsSessionSigned(true);
            }
        }
        sessionReq().catch(console.error);
        return () => { }
    },
        [myWalletAccount, sessionKey]
    );

    // timer for remaining time of session
    useEffect(() => {
        async function sessionTimer() {
            // console.log("sessionTimer");
            if (dateEndSession) {
                const now = Date.now();
                setRemainingTime(dateEndSession - now / 1000);
            }
            const bal = await contract.get_counter();
            setCounter(bal);
        }
        sessionTimer()
        const tim = setInterval(() => {
            sessionTimer()
            console.log("remaining timerId=", tim);
        }
            , 5 * 1_000 //ms
        );
        console.log("remaining startTimer", tim);

        return () => {
            clearInterval(tim);
            console.log("remaining stopTimer", tim);
        }
    }
        , [dateEndSession]);


    return (
        <>
            {isSessionSigned ?
                (
                    <Center>
                        <VStack>
                            <Text textAlign={"center"}>
                                <br></br>
                                Session using fees from your own account.
                                <br></br>
                                Remaining fees in this session : {" "}
                                <span className={remainingFee < (10n ** 13n) ? styles.red : ""}>
                                    {formatBalance(remainingFee, 18) + " "}
                                    STRK
                                </span>
                                <br></br>
                                Remaining time :{" "}<span className={remainingTime < 2 ? styles.red : ""}>
                                    {remainingTime > 0 ? minutesToTimeWithSeconds(remainingTime / 60) : "Ended"}
                                </span>
                            </Text>
                            <Box
                                bgColor={"beige"}
                                w={"250px"}
                                textAlign={"center"}
                                fontSize={"30px"}
                                fontWeight={"bold"}
                                color={"sienna"}
                                p={4}
                                borderWidth={4}
                                borderRadius={"xl"}
                                borderColor={"tan"}
                            >
                                Counter : {" "}
                                {counter.toString()}
                            </Box>
                            <Button
                                p={3}
                                colorPalette={"green"}
                                variant={"surface"}
                                disabled={
                                    (counter === 2n ** 128n)
                                    || (remainingFee < 10n ** 13n)
                                    || !isNewTxAuthorized
                                }
                                fontWeight={"bold"}
                                onClick={() => increase()}
                            >
                                <SquarePlus />
                                increase counter
                            </Button>
                            <Button
                                p={3}
                                colorPalette={"green"}
                                variant={"surface"}
                                disabled={
                                    (counter === 0n)
                                    || (remainingFee < 10n ** 13n)
                                    || !isNewTxAuthorized
                                }
                                fontWeight={"bold"}
                                onClick={() => decrease()}
                            >
                                <SquareMinus />
                                decrease counter
                            </Button>
                            {txText.length > 0 &&
                                <DisplayTxH txText={txText}></DisplayTxH>
                            }
                        </VStack>
                    </Center>
                )
                :
                (
                    <Center color={"red"}>
                        Approve amount in Ready wallet...
                    </Center>
                )
            }
        </>
    )
}