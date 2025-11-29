import './App.css'
import Provider from 'provider'
import { SplashScreen } from '@capacitor/splash-screen'
import { Camera, CameraResultType } from '@capacitor/camera'

import { useEffect, useState } from 'react'
const App = () => {
  useEffect(() => {
    SplashScreen.hide()
  }, [])
  const [img, setImg] = useState<string>()
  return (
    <div className="content">
      <button
        onClick={async () => {
          try {
            const photo = await Camera.getPhoto({
              resultType: CameraResultType.Uri,
            })

            setImg(photo.webPath)
          } catch (e) {
            console.warn('User cancelled', e)
          }
        }}
      >
        Take Photo
      </button>
      <img src={img} />
      <Provider />
    </div>
  )
}

export default App
