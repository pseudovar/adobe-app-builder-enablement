/*
 * <license header>
 */

import React, { useEffect, useState } from 'react'
import {
    Button,
    ButtonGroup,
    Content,
    Flex,
    Grid,
    Heading,
    IllustratedMessage,
    View,
} from '@adobe/react-spectrum'
import FlightCard from '../components/Tickets/FlightCard'
import NotFound from '@spectrum-icons/illustrations/NotFound'
import { fetchData } from '../lib/utils'

export const Tickets = () => {
    const startingFlightDataQuantity = 10
    const [flightData, setFlightData] = useState([])

    async function fetchFlightData() {
        const result = await fetchData('dx-excshell-1/generate-flight')

        setFlightData((prev) => [result, ...prev])
    }

    useEffect(() => {
        for (let i = 0; i < startingFlightDataQuantity; i++) {
            fetchFlightData()
        }
    }, [])

    return (
        <View width="100%">
            <Flex
                direction={'row'}
                gap={'size-100'}
                alignItems={'center'}
                width={'100%'}
                justifyContent={'space-between'}
                marginBottom={'size-400'}
            >
                <Flex direction={'column'}>
                    <Heading level={1} marginBottom={0}>
                        Tickets
                    </Heading>
                    <Heading
                        level={5}
                        marginTop={0}
                        UNSAFE_style={{ color: 'var(--spectrum-gray-500)' }}
                    >
                        Total Tickets: {flightData.length}
                    </Heading>
                </Flex>
                <View>
                    <ButtonGroup>
                        <Button
                            variant={'negative'}
                            onPress={() => setFlightData([])}
                            isDisabled={flightData.length === 0}
                        >
                            Clear Tickets
                        </Button>
                        <Button
                            variant={'cta'}
                            onPress={() => fetchFlightData()}
                        >
                            Create a Ticket
                        </Button>
                    </ButtonGroup>
                </View>
            </Flex>
            {flightData.length === 0 ? (
                <IllustratedMessage>
                    <NotFound />
                    <Heading>No tickets found</Heading>
                    <Content>Try fetching some</Content>
                </IllustratedMessage>
            ) : (
                <Grid columns={['1fr', '1fr']} gap="size-100">
                    {flightData.map((flight, index) => (
                        <FlightCard key={index} flight={flight} />
                    ))}
                </Grid>
            )}
        </View>
    )
}
