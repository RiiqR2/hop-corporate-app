import { countries } from "countries-list";
import { useMemo } from "react";

interface Country {
  name: string;
  codeNumber: string;
  flag: string;
}

export const useCountriesFromList = () => {
  const countryList: Country[] = useMemo(() => {
    return Object.entries(countries).map(([code, data]) => ({
      name: data.name,
      codeNumber: `+${data.phone}`,
      flag: `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
      capital: data.capital,
      continent: data.continent,
      languages: data.languages,
      phone: data.phone,
    })).filter(c => c.codeNumber !== "N/A");
  }, []);

  return { countries: countryList };
};
