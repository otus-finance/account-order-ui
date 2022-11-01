/* This example requires Tailwind CSS v2.0+ */
type RangeSliderProps = {
  title: String;
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: (arg0: number) => void
}

export const RangeSlider = ({ title, min, max, step, value, setValue }: RangeSliderProps) => {

  return (
    <>
      <label htmlFor="default-range" className="block mb-2 text-xs font-bold text-white dark:text-gray-600">{title}: {value}</label>
      <input data-tooltip-target="tooltip-default" id="default-range" onChange={(e) => setValue(parseFloat(e.target.value))} min={min} max={max} step={step} type="range" value={value} className="w-full h-1 bg-emerald-600 rounded-lg cursor-pointer dark:bg-green"></input>

    </>
  )
}
