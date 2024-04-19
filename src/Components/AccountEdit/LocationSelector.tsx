import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Stack } from "@mui/material";
import { provincias_ecuador } from "../../utils/provincias_ciudades_ecuador";

const LocationSelector = ({ selectedCity, setSelectedCity, selectedProvince, setSelectedProvince }) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Initialize cities when selectedProvince changes
    if (selectedProvince) {
      const selectedProvinceData = provincias_ecuador.find((province) => province.name === selectedProvince);
      if (selectedProvinceData) {
        setCities(selectedProvinceData.cities);
        if (!selectedProvinceData.cities.find((city) => city.name === selectedCity)) {
          setSelectedCity("");
        }
      }
    } else {
      // Reset cities when selectedProvince is cleared
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedProvince, setSelectedCity, setSelectedProvince]);

  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value);
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  return (
    <Stack direction={"row"} spacing={2}>
      <FormControl fullWidth>
        <InputLabel id="province-label">Province</InputLabel>
        <Select labelId="province-label" value={selectedProvince} onChange={handleProvinceChange} label={"Province"}>
          {provincias_ecuador.map((province) => (
            <MenuItem key={province.id} value={province.name}>
              {province.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="city-label">City</InputLabel>
        <Select
          labelId="city-label"
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedProvince}
          label={"City"}
        >
          {cities.map((city) => (
            <MenuItem key={city.id} value={city.name}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default LocationSelector;
