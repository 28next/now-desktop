// Packages
import {shell, autoUpdater} from 'electron'

// Ours
import {deploy, share, error} from './dialogs'

// Determine if an update is ready to be installed
// Based on an environment variable
const updateAvailable = process.env.UPDATE_AVAILABLE || false

export default async (app, tray, config, deployments) => {
  let hasDeployments = false

  if (Array.isArray(deployments) && deployments.length > 0) {
    hasDeployments = true
  }

  return [
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      role: 'about'
    },
    {
      type: 'separator'
    },
    {
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      click: async () => await share(tray)
    },
    {
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      click: async () => await deploy(tray)
    },
    {
      type: 'separator'
    },
    {
      label: 'Deployments',

      // We need this because electron otherwise keeps the item alive
      // Even if the submenu is just an empty array
      type: hasDeployments ? 'submenu' : 'normal',

      submenu: hasDeployments ? deployments : [],
      visible: hasDeployments
    },
    {
      type: 'separator'
    },
    {
      label: 'Account',
      submenu: [
        {
          label: config.get('now.user.email') || 'No user defined',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout',
          click() {
            config.delete('now.user')
            const existent = config.has('now.user')

            if (existent) {
              error('Couldn\'t log out')
            }

            // Restart the application
            app.relaunch()
            app.exit(0)
          }
        }
      ]
    },
    {
      label: 'Documentation...',
      click: () => shell.openExternal('https://zeit.co/now')
    },
    {
      type: 'separator'
    },
    {
      label: 'Update available',
      enabled: false,
      visible: updateAvailable
    },
    {
      label: 'Install',
      click: () => autoUpdater.quitAndInstall(),
      visible: updateAvailable
    },
    {
      type: 'separator'
    },
    {
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      click: app.quit,
      role: 'quit'
    }
  ]
}
