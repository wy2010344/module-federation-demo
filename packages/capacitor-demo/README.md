## Created with Capacitor Create App

This app was created using [`@capacitor/create-app`](https://github.com/ionic-team/create-capacitor-app),
and comes with a very minimal shell for building an app.

### Running this example

To run the provided example, you can use `npm start` command.

```bash
npm start
```

直接加载远程，如在
capacitor.config.json 里添加

```json
{
  ...
  "server": {
    "url": "https://capacitor-demo.pages.dev/",
    "cleartext": true
  },
  "ios": {
    "scheme": "app"
  },
  "android": {
    "webContentsDebuggingEnabled": true
  },
  ...
}
```

不太好，特别是本地图片展示等问题
所以本地宿主是必要的，特别是离线下的展示。
远程使用 module_fedoration 来加载在线业务，如果远程异常，再展示本地的东西。
