type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
  timeOfDay: string;
};

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  return (
    <div>
      <div className="flex flex-col p-4 bg-sky-400 rounded-lg gap-2">
        <div className="flex flex-row justify-between items-center">
          <div>
            <div className="text-lg text-sky-50 font-medium">{location}</div>
            <div className="flex flex-row items-center gap-2">
              <div className="text-4xl text-sky-50">{Math.round(temperature)}°</div>
            </div>
          </div>
          <div>
            <div className="capitalize text-sky-50 text-lg">{weather}</div>
          </div>
        </div>
      </div>
    </div>
  );
};