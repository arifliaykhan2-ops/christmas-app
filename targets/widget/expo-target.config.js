/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'ChristmasWidget',
  displayName: 'Christmas Countdown',
  deploymentTarget: '17.0',
  colors: {
    $accent: '#e8c27a',
    $widgetBackground: '#7d0a1d',
    festiveTop: '#c8102e',
    festiveBottom: '#5a0614',
    gold: '#e8c27a',
    cream: '#fff6e6',
  },
  images: {
    tree: '../../assets/3d/christmas_tree.png',
    santa: '../../assets/3d/santa_claus.png',
  },
  entitlements: {
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
