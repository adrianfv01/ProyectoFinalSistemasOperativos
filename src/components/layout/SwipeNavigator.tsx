import { ReactNode, useRef } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { FREE_MODE_ROUTES, getRouteIndex } from './routesConfig'

interface Props {
  children: ReactNode
}

const SWIPE_OFFSET_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 400

export default function SwipeNavigator({ children }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const startTargetRef = useRef<EventTarget | null>(null)

  const currentIndex = getRouteIndex(location.pathname)

  function isInsideNoSwipe(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false
    return Boolean(target.closest('[data-no-swipe]'))
  }

  function handleDragStart(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    startTargetRef.current = (info.point as unknown as { target?: EventTarget }).target ?? null
  }

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (currentIndex < 0) return
    if (isInsideNoSwipe(startTargetRef.current)) return

    const { offset, velocity } = info
    const goNext =
      offset.x < -SWIPE_OFFSET_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD
    const goPrev =
      offset.x > SWIPE_OFFSET_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD

    if (goNext && currentIndex < FREE_MODE_ROUTES.length - 1) {
      navigate(FREE_MODE_ROUTES[currentIndex + 1].to)
    } else if (goPrev && currentIndex > 0) {
      navigate(FREE_MODE_ROUTES[currentIndex - 1].to)
    }
  }

  return (
    <motion.div
      className="touch-pan-y"
      drag="x"
      dragSnapToOrigin
      dragElastic={0.18}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDownCapture={(e) => {
        startTargetRef.current = e.target
      }}
    >
      {children}
    </motion.div>
  )
}
