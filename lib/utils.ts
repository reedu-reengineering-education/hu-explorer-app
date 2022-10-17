export const transformTemperatureData = devices => {
  return devices.map(e => {
    const sumWithInitial = e.temperature?.reduce(
      (a, b) => a + (parseFloat(b['value']) || 0),
      0,
    );
    if (e.temperature.length) {
      return parseFloat((sumWithInitial / e.temperature?.length).toFixed(2));
    }
    return null;
  });
};

export const transformBodenfeuchteData = devices => {
  return devices.map(e => {
    const sumWithInitial = e.bodenfeuchte?.reduce(
      (a, b) => a + (parseFloat(b['value']) || 0),
      0,
    );
    if (e.bodenfeuchte.length) {
      return parseFloat((sumWithInitial / e.bodenfeuchte.length).toFixed(2));
    }
    return null;
  });
};
