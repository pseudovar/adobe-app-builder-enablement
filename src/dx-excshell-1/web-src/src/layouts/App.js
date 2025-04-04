/*
 * <license header>
 */

import React from 'react'
import { Provider, defaultTheme, Grid, View } from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import SideBar from '../components/SideBar'
import ActionsForm from '../pages/ActionsForm'
import { Home } from '../pages/Home'
import { About } from '../pages/About'
import { Welcome } from '../pages/Welcome'
import { Tickets } from '../pages/Tickets'
import { Week1 } from '../pages/AppBuilderCourse/Week1'
import { Week2 } from '../pages/AppBuilderCourse/Week2'
import { Week3 } from '../pages/AppBuilderCourse/Week3'
import { Week4 } from '../pages/AppBuilderCourse/Week4'
import { Week5 } from '../pages/AppBuilderCourse/Week5'
import { Week6 } from '../pages/AppBuilderCourse/Week6'

function App(props) {
    console.log('runtime object:', props.runtime)
    console.log('ims object:', props.ims)

    // use exc runtime event handlers
    // respond to configuration change events (e.g. user switches org)
    props.runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
        console.log('configuration change', { imsOrg, imsToken, locale })
    })
    // respond to history change events
    props.runtime.on('history', ({ type, path }) => {
        console.log('history change', { type, path })
    })

    return (
        <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
            <Router>
                <Provider theme={defaultTheme} colorScheme={'light'}>
                    <Grid
                        areas={['sidebar content']}
                        columns={['256px', '3fr']}
                        rows={['auto']}
                        minHeight="100vh"
                        gap="size-100"
                    >
                        <View
                            gridArea="sidebar"
                            backgroundColor="gray-200"
                            padding="size-200"
                        >
                            <SideBar></SideBar>
                        </View>
                        <View gridArea="content" padding="size-200">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/actions"
                                    element={
                                        <ActionsForm
                                            runtime={props.runtime}
                                            ims={props.ims}
                                        />
                                    }
                                />
                                <Route path="/about" element={<About />} />
                                <Route path="/welcome" element={<Welcome />} />
                                <Route path="/tickets" element={<Tickets />} />
                                <Route
                                    path="/AppBuilderCourse/Week1"
                                    element={<Week1 />}
                                />
                                <Route
                                    path="/AppBuilderCourse/Week2"
                                    element={<Week2 />}
                                />
                                <Route
                                    path="/AppBuilderCourse/Week3"
                                    element={<Week3 />}
                                />
                                <Route
                                    path="/AppBuilderCourse/Week4"
                                    element={<Week4 />}
                                />
                                <Route
                                    path="/AppBuilderCourse/Week5"
                                    element={<Week5 />}
                                />
                                <Route
                                    path="/AppBuilderCourse/Week6"
                                    element={<Week6 />}
                                />
                            </Routes>
                        </View>
                    </Grid>
                </Provider>
            </Router>
        </ErrorBoundary>
    )

    // Methods

    // error handler on UI rendering failure
    function onError(e, componentStack) {
        console.error(e)
        console.error(componentStack)
    }

    // component to show if UI fails rendering
    function fallbackComponent({ componentStack, error }) {
        return (
            <React.Fragment>
                <h1 style={{ textAlign: 'center', marginTop: '20px' }}>
                    Something went wrong :(
                </h1>
                <pre>{componentStack + '\n' + error.message}</pre>
            </React.Fragment>
        )
    }
}

export default App
