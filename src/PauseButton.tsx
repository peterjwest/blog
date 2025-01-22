interface PauseButtonProps {
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PauseButton({ paused, setPaused }: PauseButtonProps) {
  return (
    <button type="button" className="PauseButton" onClick={() => setPaused((paused) => !paused)}>
      <img className="PauseButton_image" src={paused ? '/public/play.svg' : '/public/pause.svg'} />
    </button>
  );
}


