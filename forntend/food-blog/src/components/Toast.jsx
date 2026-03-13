import React, { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  )
}

