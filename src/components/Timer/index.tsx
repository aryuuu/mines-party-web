import "react";

type TimerProps = {
  time: number;
};

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

const Timer = (props: TimerProps) => {
  const { time } = props;
  return (
    <div id="timer-card" className="">
      {`${zeroPad( Math.floor(time / 60), 2)}:${zeroPad(time % 60, 2)}`}
    </div>
  );
};

export default Timer;

