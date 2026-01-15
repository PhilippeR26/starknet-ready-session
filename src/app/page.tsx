"use server";

import Image from 'next/image'
import styles from './page.module.css'
import { Center, Text } from '@chakra-ui/react';
import starknetJsImg from "../public/Images/StarkNet-JS_logo.png";
import readyImg from "../public/Images/ReadyLogo.png";
import starknetReactImg from "../public/Images/starknet-react.png";
import { DisplayConnected } from './components/client/DisplayConnected';
import LowerBanner from './components/client/LowerBanner';

export default async function Page() {
    return (
        <div>
            <p className={styles.bgText}>
                Test Starknet session
            </p>
            <Center>
                <Image src={starknetJsImg} alt='starknet.js' height={100} />
            </Center>
            <Center pt="3">
                <Image src={readyImg} alt='ArgentX' height={65} />
            </Center>
            <p className={styles.bgText}>
                Please connect a Ready smart wallet, created in Starknet Testnet network
            </p>
            <div>
                <DisplayConnected></DisplayConnected>
            </div>
            <LowerBanner></LowerBanner>
        </div >
    )
}

