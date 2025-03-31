/*
 * <license header>
 */

import { Divider, Heading, View } from '@adobe/react-spectrum'
import React from 'react'
import { NavLink } from 'react-router-dom'

function SideBar() {
    return (
        <View>
            <Heading level={4}>Tools</Heading>
            <ul className="SideNav">
                <li className="SideNav-item">
                    <NavLink
                        className="SideNav-itemLink"
                        aria-current="page"
                        to="/"
                    >
                        Home
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        className="SideNav-itemLink"
                        aria-current="page"
                        to="/actions"
                    >
                        Your App Actions
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        className="SideNav-itemLink"
                        aria-current="page"
                        to="/about"
                    >
                        About App Builder
                    </NavLink>
                </li>
            </ul>
            <Divider size="M" />
            <Heading level={4}>App Builder Course</Heading>
            <ul className="SideNav">
                <li className="SideNav-item">
                    <NavLink
                        aria-current="page"
                        to="/AppBuilderCourse/Week1"
                        className="SideNav-itemLink"
                    >
                        Week 1
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        aria-current="page"
                        to="/AppBuilderCourse/Week2"
                        className="SideNav-itemLink"
                    >
                        Week 2
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        aria-current="page"
                        to="/AppBuilderCourse/Week3"
                        className="SideNav-itemLink"
                    >
                        Week 3
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        aria-current="page"
                        to="/AppBuilderCourse/Week4"
                        className="SideNav-itemLink"
                    >
                        Week 4
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        aria-current="page"
                        to="/AppBuilderCourse/Week5"
                        className="SideNav-itemLink"
                    >
                        Week 5
                    </NavLink>
                </li>
                <li className="SideNav-item">
                    <NavLink
                        aria-current="page"
                        to="/AppBuilderCourse/Week6"
                        className="SideNav-itemLink"
                    >
                        Week 6
                    </NavLink>
                </li>
            </ul>
        </View>
    )
}

export default SideBar
