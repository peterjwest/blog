import { rgbToHex, hexToRgb, Colour } from './util.ts';

interface ColourPickerProps {
  colours: Colour[];
  setColours: (colours: (prev: Colour[]) => Colour[]) => void;
}

export default function ColourPicker({ colours, setColours }: ColourPickerProps) {
  const setColour = (i: number, colour: Colour) => setColours((colours) => {
    return colours.slice(0, i).concat([colour], colours.slice(i + 1));
  })

  const onChange = (i: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    return setColour(i, hexToRgb(event.target.value));
  }

  return (
    <>
      {colours.map((colour, i) => (
        <input key={i} className="fps_color" type="color" onChange={onChange(i)} value={rgbToHex(colour)} />
      ))}
    </>
  );
}
