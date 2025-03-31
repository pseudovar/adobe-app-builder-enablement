import React from 'react'
import {
    Badge,
    Content,
    Flex,
    Heading,
    Link,
    Text,
    View,
} from '@adobe/react-spectrum'
import Card from '../../components/Atoms/Card'
export const Week2 = () => (
    <View>
        <Flex
            direction="column"
            gap="size-400"
            maxWidth="size-6000"
            marginX="auto"
        >
            <View marginBottom="size-400">
                <Heading level={1}>
                    Week 2: Environment Setup & First App
                </Heading>
                <Text marginTop="size-100">
                    Goal: Ensure participants can set up their environment,
                    install necessary tools, connect to Adobe IO, and run their
                    first App Builder project.
                </Text>
            </View>
            <Card>
                <Flex
                    gap="size-100"
                    alignItems="center"
                    marginBottom="size-100"
                >
                    <Badge variant="info" size="L">
                        1
                    </Badge>
                    <Heading level={2} marginTop={0} marginBottom={0}>
                        Getting Access to Adobe IO
                    </Heading>
                </Flex>
                <Text>
                    Before using Adobe App Builder, you need access to an Adobe
                    Developer Project.
                </Text>
                <Content marginTop="size-200">
                    <ol style={{ paddingLeft: '1.5rem' }}>
                        <li>
                            Go to the{' '}
                            <Link
                                href="https://developer.adobe.com/console/"
                                target="_blank"
                            >
                                Adobe Developer Console
                            </Link>
                            .
                        </li>
                        <li>
                            Click <strong>Create New Project</strong> →{' '}
                            <strong>Select App Builder</strong>.
                        </li>
                        <li>
                            Configure authentication:
                            <ul
                                style={{
                                    paddingLeft: '1.5rem',
                                    marginTop: '0.5rem',
                                }}
                            >
                                <li>
                                    Grant API Key & JWT authentication for
                                    secure API requests.
                                </li>
                                <li>
                                    Add any necessary Adobe services (e.g., API
                                    Mesh, I/O Events).
                                </li>
                            </ul>
                        </li>
                        <li>
                            Note down:
                            <ul
                                style={{
                                    paddingLeft: '1.5rem',
                                    marginTop: '0.5rem',
                                }}
                            >
                                <li>The Project ID.</li>
                                <li>
                                    Your Organization ID (found in the console
                                    under Overview).
                                </li>
                                <li>
                                    Your Technical Account ID and credentials
                                    for JWT authentication.
                                </li>
                            </ul>
                        </li>
                    </ol>
                </Content>
            </Card>
        </Flex>
    </View>
)
