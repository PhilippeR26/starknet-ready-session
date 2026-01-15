"use client";
import { counterAbi } from "@/app/contracts/abis/counter-abi";
import styles from '@/app/page.module.css'
import { addrSTRK, ARGENT_SESSION_SERVICE_BASE_URL, CounterContractAddress, myFrontendProvidersV8, myFrontendProvidersV9 } from "@/utils/constants";
import { formatBalance, minutesToTimeWithSeconds } from "@/utils/utils";
import { Box, Center, Text, VStack, Button } from "@chakra-ui/react";
import { SquareMinus, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Account } from "starknet";
import { cairo, Contract, ec, num, stark, type Call, type Signature, type SuccessfulTransactionReceiptResponse } from "starknetV9";
import { useStoreWallet } from "../ConnectWallet/walletContext";
import { useFrontendProvider } from "../provider/providerContext";
import { DisplayTxH } from "./DisplayTxH";
import { sessionActionSponsoredTx } from "@/app/server/sponsoredTx";
import { buildSessionAccount, createSession, createSessionRequest, type CreateSessionParams, type SessionKey, createOutsideExecutionCall, type Session } from "@argent/x-sessions";


const maxFee: bigint = (2n * 10n ** 17n); // session fees in fri
const durationInMinutes: number = 5; // session duration in minutes

export default function SponsoredSession() {
    const { myWalletAccount } = useStoreWallet();
    const { currentFrontendProviderIndex } = useFrontendProvider();
    const myProvider = myFrontendProvidersV8[currentFrontendProviderIndex];
    const myProviderV9 = myFrontendProvidersV9[currentFrontendProviderIndex];

    const [isSessionSigned, setIsSessionSigned] = useState<boolean>(false);
    const [sessionKey, setSessionKey] = useState<SessionKey | undefined>(undefined);
    const [sessionAccount, setSessionAccount] = useState<Account | undefined>(undefined);
    const [session, setSession] = useState<Session | undefined>(undefined);

    const [dateEndSession, setDateEndSession] = useState<number | undefined>(undefined);
    const [counter, setCounter] = useState<bigint>(0n);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [remainingFee, setRemainingFee] = useState<bigint>(maxFee);
    const [isNewTxAuthorized, setIsNewTxAuthorized] = useState<boolean>(true);
    const [txText, setTxText] = useState<string>("");


    const contract = new Contract({ abi: counterAbi, address: CounterContractAddress, providerOrAccount: myProviderV9 });

    async function increase() {
        if (contract !== undefined && myWalletAccount !== undefined && sessionKey !== undefined && session !== undefined) {
            setIsNewTxAuthorized(false);
            const increaseCall: Call = contract?.populate("increase", []);
            try {
                console.log("try to increase...")
                if (sessionAccount) {
                    console.log("Increase...");
                    const sessionCall: Call = await createOutsideExecutionCall({
                        session,
                        sessionKey,
                        calls: [increaseCall],
                        argentSessionServiceUrl: ARGENT_SESSION_SERVICE_BASE_URL,
                        network:
                            currentFrontendProviderIndex === 2 ? "sepolia" : "mainnet",
                    });
                    const res = await sessionActionSponsoredTx(sessionCall);
                    console.log("increase", { res });
                    setTxText("Inc " + counter + " " + num.toHex64(res.transaction_hash) + "\n" + txText);
                    const txR = await myProvider.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
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
        if (contract !== undefined && myWalletAccount !== undefined && sessionKey !== undefined && session !== undefined) {
            setIsNewTxAuthorized(false);
            const decreaseCall: Call = contract.populate("decrease", []);
            try {
                console.log("try to decrease...")
                if (sessionAccount) {
                    console.log("Decrease...");
                    const sessionCall: Call = await createOutsideExecutionCall({
                        session,
                        sessionKey,
                        calls: [decreaseCall],
                        argentSessionServiceUrl: ARGENT_SESSION_SERVICE_BASE_URL,
                        network:
                            currentFrontendProviderIndex === 2 ? "sepolia" : "mainnet",
                    });
                    const res = await sessionActionSponsoredTx(sessionCall);
                    console.log("increase", { res });
                    setTxText("Dec " + counter + " " + num.toHex64(res.transaction_hash) + "\n" + txText);
                    const txR = await myProvider.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
                    setIsNewTxAuthorized(true);
                    if (txR.isSuccess()) {
                        setRemainingFee(remainingFee - BigInt((txR.value as SuccessfulTransactionReceiptResponse).actual_fee.amount));
                    }
                }
            } catch (err: any) {
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
                const resp = await myProvider.getBlock();
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
                const chId = await myProvider.getChainId();
                console.log({ chId });
                const sessionRequest = createSessionRequest({
                    sessionParams,
                    chainId: chId
                });
                console.log("sessionRequest:", sessionRequest);
                const authorizationSignature = await myWalletAccount.signMessage(sessionRequest.sessionTypedData);
                console.log("signature", authorizationSignature);
                const session: Session = await createSession({
                    sessionRequest, // SessionRequest
                    address: myWalletAccount.address, // Account address
                    chainId: chId, // StarknetChainId
                    authorisationSignature: authorizationSignature // Signature
                })
                setSession(session);
                const sessionAccount0: Account = await buildSessionAccount({
                    useCacheAuthorisation: false, // optional and defaulted to false, will be added in future developments
                    session,
                    sessionKey,
                    provider: myProvider,

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
                                Session with sponsored fees.
                                <br></br>
                                Remaining fees in this session : {" "}
                                <span className={remainingFee < (10n ** 13n) ? styles.red : ""}>
                                    {formatBalance(remainingFee, 18) + " "}
                                    STRK
                                </span>
                                <br></br>
                                Remaining time :{" "}<span className={remainingTime < 2 * 60 ? styles.red : ""}>
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
                        Approve amount in Braavos wallet...
                    </Center>
                )
            }
        </>
    )
}