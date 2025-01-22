interface NightModeButtonProps {
  nightMode: boolean;
  setNightMode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NightModeButton({ nightMode, setNightMode }: NightModeButtonProps) {
  return (
    <button type="button" className="NightModeButton" onClick={() => setNightMode((nightMode) => !nightMode)}>
      <img className="NightModeButton_image" src={nightMode ? '/public/moon.svg' : '/public/sun.svg'} />
    </button>
  );
}


