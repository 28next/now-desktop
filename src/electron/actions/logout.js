// Native
import os from 'os'
import path from 'path'

// Packages
import Config from 'electron-config'
import fetch from 'node-fetch'
import fs from 'fs-promise'
import log from 'electron-log'

// Ours
import {error as showError} from '../dialogs'

const endpoint = 'https://zeit.co/api/www/user/tokens/'

const requestHeaders = token => {
  return {
    headers: {
      Authorization: `bearer ${token}`
    }
  }
}

const getTokenId = async token => {
  let result

  try {
    result = await fetch(endpoint, requestHeaders(token))
  } catch (err) {
    showError('Could not fetch token id for revoking it on logout', err)
    return
  }

  const tokenList = await result.json()

  if (!tokenList.tokens) {
    return
  }

  const tokenInfo = tokenList.tokens.find(t => token === t.token)

  if (!tokenInfo) {
    return
  }

  return tokenInfo.id
}

const revokeToken = async (token, tokenId) => {
  const details = {
    method: 'DELETE'
  }

  Object.assign(details, requestHeaders(token))

  let result

  try {
    result = await fetch(endpoint + encodeURIComponent(tokenId), details)
  } catch (err) {
    showError('Could not revoke token on logout', err)
    return
  }

  if (!result.ok) {
    console.error('Not able to log out')
  }
}

export default async (app, tutorial) => {
  const config = new Config()

  const status = process.env.LOGOUT_STATUS

  const noUser = config.has('now.user') === false
  const offline = process.env.CONNECTION === 'offline'
  const logOutRunning = status === 'running' || status === 'done'

  // The app shouldn't log out if an error occurs while offline
  // Only do that while online
  if (offline || noUser || logOutRunning) {
    return
  }

  process.env.LOGOUT_STATUS = 'running'

  // Cache user information
  const userDetails = config.get('now.user')

  // Remove configuration information
  config.clear()

  const existent = config.has('now.user')

  if (existent) {
    showError('Couldn\'t log out')
  }

  const configCLI = path.join(os.homedir(), '.now.json')

  try {
    await fs.remove(configCLI)
  } catch (err) {
    log.info(err)
  }

  if (tutorial) {
    // Prepare the tutorial by reloading its contents
    tutorial.reload()

    // Once the content has loaded again, show it
    tutorial.once('ready-to-show', () => tutorial.show())
  }

  let tokenId

  try {
    tokenId = await getTokenId(userDetails.token)
  } catch (err) {
    showError('Not able to get token id on logout', err)
    return
  }

  if (!tokenId) {
    return
  }

  try {
    await revokeToken(userDetails.token, tokenId)
  } catch (err) {
    showError('Could not revoke token on logout', err)
    return
  }

  process.env.LOGOUT_STATUS = 'done'
}
