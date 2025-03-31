import { Badge, Flex, Heading, Text, View } from '@adobe/react-spectrum'
import DevicePhone from '@spectrum-icons/workflow/DevicePhone'
import Mailbox from '@spectrum-icons/workflow/Mailbox'
import React from 'react'
import { Avatar } from '@adobe/react-spectrum'

const FlightCard = ({ flight }) => {
    return (
        <View
            borderColor={'dark'}
            borderWidth={'thin'}
            padding={'size-200'}
            borderRadius={'medium'}
        >
            <Flex direction={'column'} gap={'size-200'} width={'100%'}>
                <View>
                    <Flex width={'100%'} justifyContent={'space-between'}>
                        <Text>Flight #{flight.flightNumber}</Text>
                        <Badge variant={'info'}>
                            {flight.departure.iataCode} →{' '}
                            {flight.arrival.iataCode}
                        </Badge>
                    </Flex>
                </View>
                <View>
                    <Heading level={3}>Passenger</Heading>
                    <Flex direction={'column'} gap={'size-100'}>
                        <Flex gap={'size-100'} alignItems={'center'}>
                            <Avatar
                                size={'avatar-size-100'}
                                src={`https://i.pravatar.cc/150?u=${flight.email}`}
                            />
                            <Text>{flight.name}</Text>
                        </Flex>
                        <Flex gap={'size-100'} alignItems={'center'}>
                            <Mailbox width={18} />
                            <Text>{flight.email}</Text>
                        </Flex>
                        <Flex gap={'size-100'} alignItems={'center'}>
                            <DevicePhone width={18} />
                            <Text>{flight.phone}</Text>
                        </Flex>
                    </Flex>
                </View>
                <View>
                    <Heading level={3}>Route</Heading>
                    <Flex direction={'column'} gap={'size-100'}>
                        <Flex gap={'size-100'}>
                            <Flex gap={'size-100'} alignItems={'start'}>
                                <div
                                    style={{
                                        marginTop: '0.5rem',
                                        height: '0.5rem',
                                        width: '0.5rem',
                                        borderRadius: '100%',
                                        backgroundColor:
                                            'var(--spectrum-semantic-informative-color-background, var(--spectrum-global-color-static-blue-700))',
                                    }}
                                />
                                <Flex direction={'column'} gap={'size-100'}>
                                    <span style={{ fontWeight: '600' }}>
                                        {flight.departure.name}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            color: '#6B7280',
                                        }}
                                    >
                                        {flight.departure.iataCode}
                                    </span>
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex>
                            <div
                                style={{
                                    marginLeft: '10px',
                                    height: '2rem',
                                    borderStyle: 'dashed',
                                    borderColor: 'gray',
                                    display: 'block',
                                }}
                            />
                        </Flex>
                        <Flex gap={'size-100'}>
                            <Flex gap={'size-100'} alignItems={'start'}>
                                <div
                                    style={{
                                        marginTop: '0.5rem',
                                        height: '0.5rem',
                                        width: '0.5rem',
                                        borderRadius: '100%',
                                        backgroundColor:
                                            'var(--spectrum-semantic-informative-color-background, var(--spectrum-global-color-static-blue-700))',
                                    }}
                                />
                                <Flex direction={'column'} gap={'size-100'}>
                                    <span style={{ fontWeight: '600' }}>
                                        {flight.arrival.name}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            color: '#6B7280',
                                        }}
                                    >
                                        {flight.arrival.iataCode}
                                    </span>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>

                    <div className="flex items-start gap-2"></div>
                </View>
            </Flex>
        </View>
    )
}

export default FlightCard
