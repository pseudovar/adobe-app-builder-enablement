import React from 'react'
import { Flex, View, Heading, Content } from '@adobe/react-spectrum'

export const Welcome = () => {
    return (
        <View>
            <Flex direction="column" gap="size-100">
                <Heading level={1}>Welcome to Adobe App Builder</Heading>
                <Content>
                    <p>
                        This is a simple page using React Spectrum for layout.
                    </p>
                </Content>
            </Flex>
        </View>
    )
}
