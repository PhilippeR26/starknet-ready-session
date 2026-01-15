"use client";

import { Box, Center, HStack, Button} from "@chakra-ui/react";
import { useState } from "react";
import OwnSession from "./Sessions/OwnSession";
import SponsoredSession from "./Sessions/SponsoredSession";

export default function SessionManager() {
    const [choice, setChoice] = useState<number>(0);

    return (
        <Box
            pt="4"
            
            mb={55}
            pb={3}
        >
            {choice == 0 ? (
                <>
                    <Center>
                        <HStack>
                            <Button
                                variant="surface"
                                ml={4}
                                px={5}
                                fontWeight='bold'
                                onClick={() => { setChoice(1) }}
                            >
                                Start your own session
                            </Button>
                            <Button
                                variant="surface"
                                ml={4}
                                px={5}
                                fontWeight='bold'
                                onClick={() => { setChoice(2) }}
                            >
                                Start a free trial session
                            </Button>
                        </HStack>
                    </Center>
                </>
            ) : (<>
                {choice == 1 ? (
                    <>
                        <OwnSession></OwnSession>
                    </>
                ) : (
                    <>
                    <Center>
                        <SponsoredSession></SponsoredSession>
                        </Center>
                    </>
                )}
                <Center>
                    <Button
                        variant="surface"
                        mt={3}
                        px={5}
                        fontWeight='bold'
                        onClick={() => { setChoice(0) }}
                    >
                        Close Session
                    </Button>
                    <div>
                    </div>
                </Center>
            </>
            )}
        </Box>
    )
}