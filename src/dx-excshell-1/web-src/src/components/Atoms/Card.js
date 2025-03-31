import { View } from '@adobe/react-spectrum'
import React from 'react'

const Card = ({ children }) => {
    return (
        <View
            borderWidth={'thin'}
            borderColor={'dark'}
            borderRadius={'medium'}
            padding={'size-200'}
        >
            {children}
        </View>
    )
}

export default Card
