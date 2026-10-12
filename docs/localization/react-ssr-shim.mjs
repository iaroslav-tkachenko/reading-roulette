import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const React = require('react')
const jsxRuntime = require('react/jsx-runtime')
const jsxDevRuntime = require('react/jsx-dev-runtime')

export const createContext = React.createContext
export const useContext = React.useContext
export const useEffect = React.useEffect
export const useLayoutEffect = React.useLayoutEffect
export const useRef = React.useRef
export const useState = React.useState
export const Fragment = React.Fragment
export const jsx = jsxRuntime.jsx
export const jsxs = jsxRuntime.jsxs
export const jsxDEV = jsxDevRuntime.jsxDEV
