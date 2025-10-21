export function konami(callback: () => void) {
  const list = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
  let i = 0
  const onUp = ({ code }: KeyboardEvent) => {
    i = list[i] === code ? i + 1 : 0
    if (i >= list.length) {
      callback()
    }
  }

  window.addEventListener('keyup', onUp)

  return () => {
    window.removeEventListener('keyup', onUp)
  }
}