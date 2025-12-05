import { Outlet } from '@modern-js/runtime/router'

export default function Layout() {
  return (
    <div className="bg-red">
      <Outlet />
    </div>
  )
}
