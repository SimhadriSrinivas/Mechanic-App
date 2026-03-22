let timer: ReturnType<typeof setInterval> | null = null;

export const startRequestTimer = (onTick: (seconds: number) => void) => {
  let seconds = 0;

  timer = setInterval(() => {
    seconds += 1;
    onTick(seconds);
  }, 1000);
};

export const stopRequestTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

export const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

export default {
  startRequestTimer,
  stopRequestTimer,
  formatTime,
};
