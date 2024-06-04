import PropTypes from 'prop-types'
import React, { Component } from 'react'
import NavBar from '../components/navbar'


function HomePage({ isLoggedin }) {
  return (
    <div>
      <NavBar isLoggedin={isLoggedin} />
    </div>
  )
}

export default HomePage